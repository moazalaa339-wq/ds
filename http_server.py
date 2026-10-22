# -*- coding: utf-8 -*-
"""Hawa Engine local static server — LAN + signaling for WebRTC rooms."""
from __future__ import print_function
import atexit
import json
import os
import sys
import socket
import webbrowser
import threading
import time
import signal
import random
import string

try:
    from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
except ImportError:
    from SimpleHTTPServer import SimpleHTTPRequestHandler
    from SocketServer import ThreadingTCPServer as ThreadingHTTPServer

try:
    from urllib.parse import urlparse, parse_qs
except ImportError:
    from urlparse import urlparse, parse_qs

ROOT = os.path.dirname(os.path.abspath(__file__))
os.chdir(ROOT)
PORT_FILE = os.path.join(ROOT, ".hawa_port")
PID_FILE = os.path.join(ROOT, ".hawa_pid")
_server = None

# ---- LAN room signaling (in-memory, same Wi-Fi / LAN) ----
_rooms_lock = threading.Lock()
_rooms = {}  # code -> {name, host, players[{id,name,slot,host}], signals[{to,from,type,sdp,ts}], created}


def _rand_code(n=6):
    alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"
    return "".join(alphabet[random.randrange(len(alphabet))] for _ in range(n))


def _cleanup_old_rooms():
    now = time.time()
    with _rooms_lock:
        dead = [c for c, r in _rooms.items() if now - r.get("created", now) > 3600]
        for c in dead:
            _rooms.pop(c, None)


def _json_response(handler, obj, status=200):
    body = json.dumps(obj, ensure_ascii=False).encode("utf-8")
    handler.send_response(status)
    handler.send_header("Content-Type", "application/json; charset=utf-8")
    handler.send_header("Content-Length", str(len(body)))
    handler.send_header("Cache-Control", "no-store")
    handler.send_header("Access-Control-Allow-Origin", "*")
    handler.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
    handler.send_header("Access-Control-Allow-Headers", "Content-Type")
    handler.end_headers()
    handler.wfile.write(body)


def _read_json(handler):
    length = int(handler.headers.get("Content-Length") or 0)
    if length <= 0:
        return {}
    raw = handler.rfile.read(length)
    try:
        return json.loads(raw.decode("utf-8"))
    except Exception:
        return {}


def _handle_api(handler, method, path):
    _cleanup_old_rooms()
    # POST /api/lan/create
    if method == "POST" and path == "/api/lan/create":
        data = _read_json(handler)
        name = (data.get("name") or "غرفة").strip()[:40] or "غرفة"
        host_name = (data.get("hostName") or "مضيف").strip()[:20] or "مضيف"
        host_id = (data.get("peerId") or ("h-" + _rand_code(8)))
        code = _rand_code(6)
        with _rooms_lock:
            while code in _rooms:
                code = _rand_code(6)
            _rooms[code] = {
                "name": name,
                "host": host_id,
                "players": [{"id": host_id, "name": host_name, "slot": 1, "host": True}],
                "signals": [],
                "created": time.time(),
                "started": False,
            }
        return _json_response(handler, {"ok": True, "code": code, "peerId": host_id, "roomName": name})

    # POST /api/lan/rehost — إعادة فتح رووم بنفس الكود (بعد الانتقال لصفحة اللعب)
    if method == "POST" and path == "/api/lan/rehost":
        data = _read_json(handler)
        code = (data.get("code") or "").strip().upper()
        host_name = (data.get("hostName") or "مضيف").strip()[:20] or "مضيف"
        peer_id = data.get("peerId") or ("h-" + _rand_code(8))
        with _rooms_lock:
            room = _rooms.get(code)
            if not room:
                _rooms[code] = {
                    "name": data.get("name") or "play",
                    "host": peer_id,
                    "players": [{"id": peer_id, "name": host_name, "slot": 1, "host": True}],
                    "signals": [],
                    "created": time.time(),
                    "started": True,
                }
            else:
                room["host"] = peer_id
                room["started"] = True
                # أبقِ اللاعبين، حدّث المضيف
                found = False
                for pl in room["players"]:
                    if pl.get("host") or pl.get("slot") == 1:
                        pl["id"] = peer_id
                        pl["name"] = host_name
                        pl["host"] = True
                        found = True
                        break
                if not found:
                    room["players"].insert(0, {"id": peer_id, "name": host_name, "slot": 1, "host": True})
                room["signals"] = []  # ابدأ إشارة جديدة
            players = list(_rooms[code]["players"])
        return _json_response(handler, {"ok": True, "code": code, "peerId": peer_id, "players": players})

    # POST /api/lan/join
    if method == "POST" and path == "/api/lan/join":
        data = _read_json(handler)
        code = (data.get("code") or "").strip().upper()
        player_name = (data.get("name") or "لاعب").strip()[:20] or "لاعب"
        peer_id = (data.get("peerId") or ("g-" + _rand_code(8)))
        with _rooms_lock:
            room = _rooms.get(code)
            if not room:
                return _json_response(handler, {"ok": False, "error": "الكود غلط أو الرووم اتقفلت"}, 404)
            existing = None
            for pl in room["players"]:
                if pl["id"] == peer_id or (not pl.get("host") and pl.get("name") == player_name):
                    existing = pl
                    break
            if existing:
                existing["id"] = peer_id
                existing["name"] = player_name
                slot = existing["slot"]
            else:
                used = set(p["slot"] for p in room["players"])
                slot = None
                for i in range(1, 4):
                    if i not in used:
                        slot = i
                        break
                if not slot:
                    return _json_response(handler, {"ok": False, "error": "الرووم ممتلئة (3 لاعبين)"}, 400)
                room["players"].append({"id": peer_id, "name": player_name, "slot": slot, "host": False})
            players = list(room["players"])
            room_name = room["name"]
            host_id = room["host"]
        return _json_response(handler, {
            "ok": True, "code": code, "peerId": peer_id, "slot": slot,
            "players": players, "roomName": room_name, "hostId": host_id
        })

    # GET /api/lan/room/CODE
    if method == "GET" and path.startswith("/api/lan/room/"):
        code = path[len("/api/lan/room/"):].strip().upper().split("?")[0]
        with _rooms_lock:
            room = _rooms.get(code)
            if not room:
                return _json_response(handler, {"ok": False, "error": "مش موجود"}, 404)
            return _json_response(handler, {
                "ok": True, "code": code, "name": room["name"], "host": room["host"],
                "players": list(room["players"]), "started": room.get("started", False)
            })

    # POST /api/lan/leave
    if method == "POST" and path == "/api/lan/leave":
        data = _read_json(handler)
        code = (data.get("code") or "").strip().upper()
        peer_id = data.get("peerId") or ""
        with _rooms_lock:
            room = _rooms.get(code)
            if room:
                room["players"] = [p for p in room["players"] if p["id"] != peer_id]
                if not room["players"] or peer_id == room.get("host"):
                    _rooms.pop(code, None)
        return _json_response(handler, {"ok": True})

    # POST /api/lan/start
    if method == "POST" and path == "/api/lan/start":
        data = _read_json(handler)
        code = (data.get("code") or "").strip().upper()
        with _rooms_lock:
            room = _rooms.get(code)
            if not room:
                return _json_response(handler, {"ok": False}, 404)
            room["started"] = True
            players = list(room["players"])
        return _json_response(handler, {"ok": True, "players": players})

    # POST /api/lan/signal  — WebRTC SDP / ICE relay
    if method == "POST" and path == "/api/lan/signal":
        data = _read_json(handler)
        code = (data.get("code") or "").strip().upper()
        with _rooms_lock:
            room = _rooms.get(code)
            if not room:
                return _json_response(handler, {"ok": False, "error": "رووم مش موجودة"}, 404)
            msg = {
                "to": data.get("to"),
                "from": data.get("from"),
                "type": data.get("type"),  # offer | answer | ice
                "sdp": data.get("sdp"),
                "candidate": data.get("candidate"),
                "ts": time.time(),
            }
            room["signals"].append(msg)
            # keep last 80 signals
            if len(room["signals"]) > 80:
                room["signals"] = room["signals"][-80:]
        return _json_response(handler, {"ok": True})

    # GET /api/lan/signal/CODE?peer=ID&after=TS
    if method == "GET" and path.startswith("/api/lan/signal/"):
        rest = path[len("/api/lan/signal/"):]
        code = rest.split("?")[0].strip().upper()
        qs = parse_qs(urlparse(handler.path).query)
        peer = (qs.get("peer") or [""])[0]
        try:
            after = float((qs.get("after") or ["0"])[0])
        except Exception:
            after = 0.0
        with _rooms_lock:
            room = _rooms.get(code)
            if not room:
                return _json_response(handler, {"ok": False, "signals": [], "players": []}, 404)
            sigs = [s for s in room["signals"] if s.get("ts", 0) > after and (s.get("to") in (None, "*", peer) or s.get("from") == peer)]
            # deliver signals addressed to this peer (or broadcast)
            out = [s for s in sigs if s.get("to") in (None, "*", peer)]
            return _json_response(handler, {
                "ok": True,
                "signals": out,
                "players": list(room["players"]),
                "started": room.get("started", False),
                "serverTime": time.time(),
            })

    # GET /api/lan/info — LAN URLs for UI
    if method == "GET" and path == "/api/lan/info":
        port = getattr(handler.server, "server_port", 0)
        ips = _local_ips()
        return _json_response(handler, {
            "ok": True,
            "port": port,
            "ips": ips,
            "urls": ["http://%s:%s" % (ip, port) for ip in ips],
        })

    return None


def _local_ips():
    ips = []
    try:
        hostname = socket.gethostname()
        for info in socket.getaddrinfo(hostname, None, socket.AF_INET):
            ip = info[4][0]
            if ip and not ip.startswith("127.") and ip not in ips:
                ips.append(ip)
    except Exception:
        pass
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(("8.8.8.8", 80))
        ip = s.getsockname()[0]
        s.close()
        if ip and not ip.startswith("127.") and ip not in ips:
            ips.insert(0, ip)
    except Exception:
        pass
    if not ips:
        ips = ["127.0.0.1"]
    return ips


class QuietHandler(SimpleHTTPRequestHandler):
    extensions_map = SimpleHTTPRequestHandler.extensions_map.copy()
    extensions_map.update({
        ".js": "application/javascript",
        ".mjs": "application/javascript",
        ".json": "application/json",
        ".css": "text/css",
        ".html": "text/html",
    })

    def log_message(self, fmt, *args):
        try:
            sys.stderr.write("%s - %s\n" % (self.address_string(), fmt % args))
        except Exception:
            pass

    def end_headers(self):
        self.send_header("Cache-Control", "no-store")
        self.send_header("Access-Control-Allow-Origin", "*")
        SimpleHTTPRequestHandler.end_headers(self)

    def do_OPTIONS(self):
        self.send_response(204)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.end_headers()

    def do_GET(self):
        parsed = urlparse(self.path)
        if parsed.path.startswith("/api/"):
            handled = _handle_api(self, "GET", parsed.path)
            if handled is not None:
                return
            return _json_response(self, {"ok": False, "error": "not found"}, 404)
        return SimpleHTTPRequestHandler.do_GET(self)

    def do_POST(self):
        parsed = urlparse(self.path)
        if parsed.path.startswith("/api/"):
            handled = _handle_api(self, "POST", parsed.path)
            if handled is not None:
                return
            return _json_response(self, {"ok": False, "error": "not found"}, 404)
        self.send_error(405)


def pick_port(start=8765, tries=80):
    for i in range(tries):
        port = start + i
        s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        try:
            s.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
            s.bind(("0.0.0.0", port))
            s.close()
            return port
        except Exception:
            try:
                s.close()
            except Exception:
                pass
    return start


def cleanup():
    global _server
    try:
        if _server is not None:
            try:
                _server.shutdown()
            except Exception:
                pass
            try:
                _server.server_close()
            except Exception:
                pass
            _server = None
    except Exception:
        pass
    for path in (PORT_FILE, PID_FILE):
        try:
            if os.path.isfile(path):
                os.remove(path)
        except Exception:
            pass


def write_lock_files(port):
    try:
        with open(PORT_FILE, "w", encoding="utf-8") as f:
            f.write(str(port))
    except Exception:
        pass
    try:
        with open(PID_FILE, "w", encoding="utf-8") as f:
            f.write(str(os.getpid()))
    except Exception:
        pass


def open_browser(url):
    def _go():
        time.sleep(0.5)
        try:
            webbrowser.open(url)
        except Exception:
            pass
    threading.Thread(target=_go, daemon=True).start()


def _signal_handler(signum, frame):
    cleanup()
    try:
        sys.exit(0)
    except SystemExit:
        os._exit(0)


def main():
    global _server
    atexit.register(cleanup)
    try:
        signal.signal(signal.SIGINT, _signal_handler)
        signal.signal(signal.SIGTERM, _signal_handler)
    except Exception:
        pass

    port = pick_port()
    write_lock_files(port)
    ips = _local_ips()
    base_local = "http://127.0.0.1:%d" % port
    build_url = base_local + "/index.html"
    game_url = base_local + "/game.html"

    print("")
    print("========================================")
    print("  Hawa Engine - Local + LAN Server")
    print("========================================")
    print("  Folder: %s" % ROOT)
    print("  PID:    %s" % os.getpid())
    print("  Local:  %s" % build_url)
    print("  Game:   %s" % game_url)
    print("  --- LAN (نفس الواي فاي) ---")
    for ip in ips:
        print("  LAN:    http://%s:%d/game.html" % (ip, port))
    print("  Keep this window OPEN.")
    print("  Stop: close window OR Ctrl+C OR STOP_SERVER.bat")
    print("========================================")
    print("")

    open_browser(build_url)

    _server = ThreadingHTTPServer(("0.0.0.0", port), QuietHandler)
    try:
        _server.daemon_threads = True
    except Exception:
        pass

    try:
        _server.serve_forever()
    except KeyboardInterrupt:
        print("\nStopping...")
    finally:
        cleanup()
        print("Stopped. Process cleaned up.")
    return 0


if __name__ == "__main__":
    try:
        sys.exit(main() or 0)
    finally:
        cleanup()
