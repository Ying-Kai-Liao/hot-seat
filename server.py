#!/usr/bin/env python3
"""
Simple HTTP server to serve the Hot Seat web UI.

This is a static file server - all the logic runs in the browser.
The API calls go directly from the browser to OpenAI using the user's API key.

Usage:
    python server.py
    # Then open http://localhost:8000 in your browser
"""

import http.server
import socketserver
import os
import sys

PORT = 8000
DIRECTORY = "web"


class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)

    def log_message(self, format, *args):
        # Custom logging with colors
        print(f"  {args[0]}")

    def end_headers(self):
        # Add CORS headers for local development
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, OPTIONS')
        self.send_header('Cache-Control', 'no-store, no-cache, must-revalidate')
        super().end_headers()


def main():
    os.chdir(os.path.dirname(os.path.abspath(__file__)))

    with socketserver.TCPServer(("", PORT), Handler) as httpd:
        print(f"""
╔══════════════════════════════════════════════════════════════╗
║              Persona Roundtable - Local Server               ║
╚══════════════════════════════════════════════════════════════╝

  Server running at: http://localhost:{PORT}

  Open this URL in your browser to use the app.

  Your API key stays in your browser - nothing is sent to us.
  All API calls go directly from your browser to OpenAI.

  Press Ctrl+C to stop the server.
""")
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\n\n  Server stopped. Goodbye!")
            sys.exit(0)


if __name__ == "__main__":
    main()
