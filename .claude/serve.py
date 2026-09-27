# Dev server for the AI But Great site.
# Sets its own directory, so it works even when the parent process's
# working directory is unreadable (python -m http.server calls getcwd()
# at import time and crashes in that case).
import functools, http.server, os, socketserver

DIR = "/Users/rhettjones/Documents/AI lore/ai-but-great"
os.chdir(DIR)
Handler = functools.partial(http.server.SimpleHTTPRequestHandler, directory=DIR)
socketserver.TCPServer.allow_reuse_address = True
with socketserver.TCPServer(("127.0.0.1", 5173), Handler) as httpd:
    print("serving %s on http://127.0.0.1:5173" % DIR, flush=True)
    httpd.serve_forever()
