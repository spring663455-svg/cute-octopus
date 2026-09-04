"""Launch the arithmetic practice app as a local desktop experience."""

from __future__ import annotations

import contextlib
import http.server
import os
from pathlib import Path
import socket
import threading
import webbrowser


APP_DIRECTORY = Path(__file__).resolve().parent


class QuietRequestHandler(http.server.SimpleHTTPRequestHandler):
    """Serve app files without printing a line for every browser request."""

    def __init__(self, *args: object, **kwargs: object) -> None:
        super().__init__(*args, directory=str(APP_DIRECTORY), **kwargs)

    def log_message(self, format: str, *args: object) -> None:
        return


def find_available_port() -> int:
    """Ask the operating system for an unused local TCP port."""

    with contextlib.closing(socket.socket()) as sock:
        sock.bind(("127.0.0.1", 0))
        return int(sock.getsockname()[1])


def main() -> None:
    os.chdir(APP_DIRECTORY)
    port = find_available_port()
    server = http.server.ThreadingHTTPServer(("127.0.0.1", port), QuietRequestHandler)
    address = f"http://127.0.0.1:{port}"

    threading.Timer(0.4, webbrowser.open, args=(address,)).start()
    print("小章魚算算樂已啟動！")
    print(f"若瀏覽器沒有自動開啟，請前往：{address}")
    print("關閉這個視窗即可結束程式。")

    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        server.server_close()


if __name__ == "__main__":
    main()
