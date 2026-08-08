import http.server
import socketserver
import webbrowser
import os
import socket
import sys

PORT = 8888
DIST_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "dist")

def is_port_in_use(port):
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        return s.connect_ex(('127.0.0.1', port)) == 0

class NoCacheHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIST_DIR, **kwargs)
        
    def end_headers(self):
        self.send_header('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0')
        self.send_header('Pragma', 'no-cache')
        self.send_header('Expires', '0')
        super().end_headers()
        
    def log_message(self, format, *args):
        pass

def main():
    url = f"http://localhost:{PORT}"
    if is_port_in_use(PORT):
        webbrowser.open(url)
        sys.exit(0)
        
    webbrowser.open(url)
    
    socketserver.TCPServer.allow_reuse_address = True
    with socketserver.TCPServer(("127.0.0.1", PORT), NoCacheHandler) as httpd:
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            pass

if __name__ == "__main__":
    main()
