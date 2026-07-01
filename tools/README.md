# tools/

Local editor tooling for the deck. **Not for client delivery.**

## save-server.py

A local dev server that replaces `npx http-server`. It serves the deck
**and** exposes endpoints the in-browser editor uses to write changes
back to disk and commit them.

### Run

```bash
python tools/save-server.py
```

Then open <http://localhost:8080/natgeo/>.

To use a different port: `python tools/save-server.py 8090` or `PORT=8090 python tools/save-server.py`.

> Only one process can hold port 8080. If you already have `http-server`
> running there, stop it first — save-server serves static files too.

### Endpoints

| Method | Path     | Purpose |
|--------|----------|---------|
| GET    | `/*`     | Static file serving from project root |
| POST   | `/save`  | Overwrite `natgeo/index.html`, `git add` + commit + push |
| POST   | `/brief` | Save `editor-brief.json` to project root |

`/save` validates the payload (must look like the deck) before writing,
so a truncated or wrong body can't clobber the file. If the write results
in no actual diff, it reports "No changes to commit" instead of an empty
commit.

## The editing workflow

1. Start `save-server.py`, open the deck.
2. Press **E** for edit mode.
3. **Text** — edit `natgeo/index.html` directly in your code editor for
   copy changes. Use the in-browser nudge/size controls for visual
   position/size tweaks.
4. **Save & Commit** — sends the current visual state to `/save`; the file
   is overwritten (editor wiring preserved), committed, and pushed.
5. **Images** — click an image, describe the replacement, **Add to Brief**.
   **Export Brief** writes `editor-brief.json`. Hand that file to Claude,
   who will source/convert/place the image, update the HTML, and commit.
6. **Pins** — press **P**, click to drop coordinate markers (1920×1080
   canvas space) as position references for Claude.

## Client delivery

Before sending the deck to a client, remove the two lines tagged
`data-editor-remove` in `natgeo/index.html` (the editor `<link>` and
`<script>`). That strips the editor entirely.
