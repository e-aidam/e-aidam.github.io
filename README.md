# e-aidam.github.io

Static GitHub Pages build for ethanaidam.com.

To run locally at http://localhost:XXXX/:
`python3 -m http.server XXXX`

Run it from the repo root, and restart it after adding new files. If edits
don't show up, it's the browser cache: hard-refresh with Cmd+Shift+R, or open
DevTools and check "Disable cache" on the Network tab.

To kill server at http://localhost:XXXX/:
`kill $(lsof -ti :XXXX)`
