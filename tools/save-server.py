#!/usr/bin/env python3
"""
save-server.py — local dev server for partner-decks editor.

Replaces `npx http-server`. Serves the deck AND exposes a /save
endpoint that the in-browser editor uses to write changes back to
natgeo/index.html and auto-commit + push to git.

Usage:
    python tools/save-server.py

Then open:
    http://localhost:8080/natgeo/

Endpoints:
    GET  /*      — static file serving from project root
    POST /save   — write HTML to disk, commit, push
    POST /brief  — save editor-brief.json to project root (optional)
"""

import http.server
import os
import re
import json
import base64
import subprocess
import datetime
import sys

# Windows consoles default to cp1252 and choke on non-ASCII in print().
# Reconfigure stdout/stderr to UTF-8 so logging never crashes a request.
try:
    sys.stdout.reconfigure(encoding='utf-8')
    sys.stderr.reconfigure(encoding='utf-8')
except Exception:
    pass

# Port: default 8080, override with `python save-server.py <port>` or PORT env.
PORT = int(os.environ.get('PORT', sys.argv[1] if len(sys.argv) > 1 else 8080))
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
TARGET_HTML = os.path.join(ROOT, 'natgeo', 'index.html')


# ---------------------------------------------------------------------------
# Safety guard
#
# The editor's buildCleanHTML() already strips all runtime artifacts
# (data-eid/data-iid attributes, editor-* classes, injected toolbar/banner/
# pin nodes) client-side before POSTing. We do NOT regex-mangle the HTML
# here — that risks corrupting legitimate content. We only sanity-check
# that the payload looks like the deck and isn't truncated, then write it
# verbatim.
# ---------------------------------------------------------------------------

def looks_like_deck(html: str) -> bool:
    if not html or len(html) < 2000:
        return False
    if '<!doctype html>' not in html.lower():
        return False
    # Must contain the deck root and close properly
    if 'class="deck"' not in html and 'id="deck"' not in html:
        return False
    if '</html>' not in html.lower():
        return False
    return True


# ---------------------------------------------------------------------------
# Git helpers
# ---------------------------------------------------------------------------

def git(args, cwd=ROOT):
    result = subprocess.run(
        ['git'] + args, cwd=cwd,
        capture_output=True, text=True
    )
    return result.returncode, result.stdout.strip(), result.stderr.strip()


# ---- Branch helpers ----

def git_current_branch() -> str:
    code, out, _ = git(['rev-parse', '--abbrev-ref', 'HEAD'])
    return out if code == 0 else ''


def git_branches() -> list:
    code, out, _ = git(['branch', '--format=%(refname:short)'])
    if code != 0:
        return []
    return [b.strip() for b in out.splitlines() if b.strip()]


def git_is_clean() -> bool:
    code, out, _ = git(['status', '--porcelain'])
    return code == 0 and out.strip() == ''


def branches_info() -> dict:
    return {'ok': True,
            'current': git_current_branch(),
            'branches': git_branches(),
            'clean': git_is_clean()}


def switch_branch(branch: str) -> dict:
    if not branch:
        return {'ok': False, 'error': 'No branch specified.'}
    if branch == git_current_branch():
        return {'ok': True, 'message': 'Already on ' + branch, 'current': branch}
    if not git_is_clean():
        return {'ok': False, 'dirty': True,
                'error': 'Uncommitted changes present. Save & Commit before '
                         'switching branches (or discard them) to avoid losing work.'}
    code, out, err = git(['checkout', branch])
    if code != 0:
        return {'ok': False, 'error': err or out}
    print(f'  Switched to branch: {branch}')
    return {'ok': True, 'current': branch, 'message': 'Switched to ' + branch}


def create_branch(name: str) -> dict:
    if not name:
        return {'ok': False, 'error': 'No branch name specified.'}
    # Basic sanity on branch name
    bad = set(' ~^:?*[\\')
    if any(c in bad for c in name) or name.startswith('-'):
        return {'ok': False, 'error': 'Invalid branch name.'}
    if name in git_branches():
        return {'ok': False, 'error': 'Branch already exists: ' + name}
    if not git_is_clean():
        return {'ok': False, 'dirty': True,
                'error': 'Uncommitted changes present. Save & Commit before '
                         'creating a branch to avoid carrying stray edits.'}
    code, out, err = git(['checkout', '-b', name])
    if code != 0:
        return {'ok': False, 'error': err or out}
    print(f'  Created and switched to branch: {name}')
    return {'ok': True, 'current': name, 'message': 'Created ' + name}


def save_and_commit(html: str, message: str) -> dict:
    # Guard against truncated / wrong payloads overwriting the deck
    if not looks_like_deck(html):
        return {'ok': False, 'step': 'validation',
                'error': 'Payload does not look like the deck (too short or '
                         'missing doctype/deck root/closing html). Aborted to '
                         'protect the file.'}

    # Write file (client already produced clean HTML; write verbatim)
    with open(TARGET_HTML, 'w', encoding='utf-8', newline='\n') as f:
        f.write(html)
    print(f'  Written: {TARGET_HTML}')

    # Stage index.html + only the images the HTML actually references.
    # This captures drop-replaced images while leaving orphan drops untracked.
    refs = set(re.findall(r'assets/images/[A-Za-z0-9._-]+\.(?:webp|jpg|jpeg|png|svg)', html))
    ref_paths = []
    for r in refs:
        p = os.path.join('natgeo', r)
        if os.path.exists(os.path.join(ROOT, p)):
            ref_paths.append(p)
    code, out, err = git(['add', 'natgeo/index.html'] + ref_paths)
    if code != 0:
        return {'ok': False, 'step': 'git add', 'error': err}

    # Check if there's anything to commit
    code, out, _ = git(['diff', '--cached', '--quiet'])
    if code == 0:
        return {'ok': True, 'message': 'No changes to commit (file unchanged after stripping).'}

    # Commit
    code, out, err = git(['commit', '-m', message])
    if code != 0:
        return {'ok': False, 'step': 'git commit', 'error': err}
    print(f'  Committed: {message}')

    # Push
    code, out, err = git(['push'])
    if code != 0:
        return {'ok': False, 'step': 'git push', 'error': err}
    print(f'  Pushed.')

    return {'ok': True, 'message': 'Saved, committed, and pushed.'}


# ---------------------------------------------------------------------------
# Image replacement — decode upload, convert to WebP + JPG, place in folder
# ---------------------------------------------------------------------------

IMAGES_SUBDIR = os.path.join('natgeo', 'assets', 'images')


def _sanitize_base(name: str) -> str:
    name = os.path.splitext(name)[0].lower()
    name = re.sub(r'[^a-z0-9]+', '-', name).strip('-')
    return name or 'image'


def _unique_base(out_dir: str, base: str) -> str:
    """Ensure neither <base>.webp nor <base>.jpg already exists; else suffix."""
    candidate = base
    n = 1
    while (os.path.exists(os.path.join(out_dir, candidate + '.webp')) or
           os.path.exists(os.path.join(out_dir, candidate + '.jpg'))):
        n += 1
        candidate = f'{base}-{n}'
    return candidate


def replace_image(data_url: str, target_dir_rel: str, base_name: str) -> dict:
    # Resolve + confine target dir to natgeo/assets/images
    if not data_url or ',' not in data_url:
        return {'ok': False, 'error': 'No image data received.'}

    target_dir_rel = (target_dir_rel or IMAGES_SUBDIR).replace('\\', '/').strip('/')
    out_dir = os.path.abspath(os.path.join(ROOT, target_dir_rel))
    allowed = os.path.abspath(os.path.join(ROOT, IMAGES_SUBDIR))
    if os.path.commonpath([out_dir, allowed]) != allowed:
        return {'ok': False, 'error': 'Target folder outside the images directory.'}
    os.makedirs(out_dir, exist_ok=True)

    # Decode data URL payload
    try:
        header, b64 = data_url.split(',', 1)
        raw = base64.b64decode(b64)
    except Exception as e:
        return {'ok': False, 'error': 'Could not decode image: ' + str(e)}

    base = _unique_base(out_dir, _sanitize_base(base_name))

    # Write to a temp source file, convert, clean up
    tmp = os.path.join(out_dir, '.tmp-upload')
    try:
        with open(tmp, 'wb') as f:
            f.write(raw)
        proc = subprocess.run(
            ['node', os.path.join('tools', 'convert-image.js'), tmp, out_dir, base],
            cwd=ROOT, capture_output=True, text=True
        )
        if proc.returncode != 0:
            return {'ok': False, 'error': 'Conversion failed: ' + (proc.stderr or proc.stdout)}
        info = json.loads(proc.stdout.strip().splitlines()[-1])
        if not info.get('ok'):
            return {'ok': False, 'error': info.get('error', 'Conversion failed.')}
    finally:
        if os.path.exists(tmp):
            os.remove(tmp)

    # Paths relative to the deck HTML (natgeo/index.html) for src/srcset
    html_dir = target_dir_rel[len('natgeo/'):] if target_dir_rel.startswith('natgeo/') else target_dir_rel
    webp_rel = f'{html_dir}/{base}.webp'
    jpg_rel  = f'{html_dir}/{base}.jpg'

    # Do NOT git-add here — Save & Commit stages only images the HTML actually
    # references, so dropped-but-unused files never pollute a commit.

    print(f'  Replaced image -> {base}.webp / {base}.jpg  ({info.get("width")}x{info.get("height")})')
    return {'ok': True, 'base': base, 'webp': webp_rel, 'jpg': jpg_rel,
            'width': info.get('width'), 'height': info.get('height')}


# ---------------------------------------------------------------------------
# Request handler
# ---------------------------------------------------------------------------

class Handler(http.server.SimpleHTTPRequestHandler):

    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=ROOT, **kwargs)

    # ---- CORS preflight ----
    def do_OPTIONS(self):
        self.send_response(200)
        self._cors()
        self.end_headers()

    # ---- GET /git/branches  (else static) ----
    def do_GET(self):
        path = self.path.split('?')[0]
        if path == '/git/branches':
            try:
                self._json_response(branches_info())
            except Exception as e:
                self._json_response({'ok': False, 'error': str(e)}, 500)
            return
        # Fall through to static file serving
        super().do_GET()

    # ---- POST /save  /brief  /git/switch  /git/branch ----
    def do_POST(self):
        path = self.path.split('?')[0]

        if path == '/save':
            self._handle_save()
        elif path == '/brief':
            self._handle_brief()
        elif path == '/replace-image':
            self._handle_replace_image()
        elif path == '/git/switch':
            self._handle_git('switch')
        elif path == '/git/branch':
            self._handle_git('branch')
        else:
            self.send_error(404, 'Not found')

    def _read_json(self):
        length = int(self.headers.get('Content-Length', 0))
        raw = self.rfile.read(length)
        return json.loads(raw)

    def _json_response(self, data, status=200):
        body = json.dumps(data, indent=2).encode('utf-8')
        self.send_response(status)
        self._cors()
        self.send_header('Content-Type', 'application/json')
        self.send_header('Content-Length', str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def _cors(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'POST, GET, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')

    def _handle_save(self):
        try:
            data    = self._read_json()
            html    = data.get('html', '')
            message = data.get('message', '').strip()
            if not message:
                ts      = datetime.datetime.now().strftime('%Y-%m-%d %H:%M')
                message = f'Editor: visual save {ts}'
            print(f'\n/save  ->  "{message}"')
            result = save_and_commit(html, message)
            self._json_response(result)
        except Exception as e:
            self._json_response({'ok': False, 'error': str(e)}, 500)

    def _handle_brief(self):
        try:
            data = self._read_json()
            out  = os.path.join(ROOT, 'editor-brief.json')
            with open(out, 'w', encoding='utf-8') as f:
                json.dump(data, f, indent=2)
            print(f'\n/brief  ->  saved to editor-brief.json')
            self._json_response({'ok': True, 'path': 'editor-brief.json'})
        except Exception as e:
            self._json_response({'ok': False, 'error': str(e)}, 500)

    def _handle_replace_image(self):
        try:
            data = self._read_json()
            print(f'\n/replace-image  ->  base "{data.get("baseName", "")}"')
            result = replace_image(
                data.get('dataUrl', ''),
                data.get('targetDir', ''),
                data.get('baseName', 'image')
            )
            self._json_response(result)
        except Exception as e:
            self._json_response({'ok': False, 'error': str(e)}, 500)

    def _handle_git(self, action):
        try:
            data = self._read_json()
            if action == 'switch':
                print(f'\n/git/switch  ->  "{data.get("branch", "")}"')
                self._json_response(switch_branch(data.get('branch', '').strip()))
            elif action == 'branch':
                print(f'\n/git/branch  ->  "{data.get("name", "")}"')
                self._json_response(create_branch(data.get('name', '').strip()))
        except Exception as e:
            self._json_response({'ok': False, 'error': str(e)}, 500)

    # Silence request logs for cleaner output (remove to debug)
    def log_message(self, fmt, *args):
        if self.command == 'OPTIONS' or self.path.startswith(('/save', '/brief', '/git', '/replace-image')):
            super().log_message(fmt, *args)


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

if __name__ == '__main__':
    os.chdir(ROOT)
    print(f'partner-decks save-server')
    print(f'  Root   : {ROOT}')
    print(f'  Serving: http://localhost:{PORT}/natgeo/')
    print(f'  Save   : POST http://localhost:{PORT}/save')
    print(f'  Brief  : POST http://localhost:{PORT}/brief')
    print()

    try:
        with http.server.ThreadingHTTPServer(('', PORT), Handler) as srv:
            srv.serve_forever()
    except KeyboardInterrupt:
        print('\nStopped.')
        sys.exit(0)
