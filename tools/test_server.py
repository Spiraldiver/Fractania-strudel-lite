#!/usr/bin/env python3
"""Static server + POST /upload?name=x.png endpoint for headless render tests."""
import http.server
import os
import sys
from urllib.parse import urlparse, parse_qs

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
UPLOADS = os.path.join(ROOT, "test_out")
os.makedirs(UPLOADS, exist_ok=True)


class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *a, **kw):
        super().__init__(*a, directory=ROOT, **kw)

    # CORS + Private-Network-Access headers so an HTTPS page (strudel.cc)
    # may import http://127.0.0.1:<port>/dist/fractania-strudel-lite.js directly —
    # private local testing with no CDN involved.
    def end_headers(self):
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "*")
        self.send_header("Access-Control-Allow-Private-Network", "true")
        self.send_header("Cache-Control", "no-store")
        super().end_headers()

    def do_OPTIONS(self):
        self.send_response(204)
        self.end_headers()

    def do_POST(self):
        u = urlparse(self.path)
        if u.path == "/upload":
            name = parse_qs(u.query).get("name", ["out.bin"])[0]
            name = os.path.basename(name)  # no traversal
            n = int(self.headers.get("Content-Length", 0))
            data = self.rfile.read(n)
            with open(os.path.join(UPLOADS, name), "wb") as f:
                f.write(data)
            self.send_response(200)
            self.end_headers()
            self.wfile.write(b"ok")
            print(f"[upload] {name} ({n} bytes)", flush=True)
        else:
            self.send_response(404)
            self.end_headers()

    def log_message(self, *a):
        pass


if __name__ == "__main__":
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8123
    http.server.ThreadingHTTPServer(("127.0.0.1", port), Handler).serve_forever()
