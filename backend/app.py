import socketio
import json
from flask import Flask, jsonify, request
from flask_socketio import SocketIO
from obd_reader import OBDSimulator
from threading import Thread

app = Flask(__name__)
socketio = SocketIO(app, cors_allowed_origins="*")

# ─── 1. Load and apply your limits on startup ───────────────────────────────
with open("config/limits.json") as f:
    limits = json.load(f)

obd_sim = OBDSimulator(
    max_rpm=limits["rpmGauge"],
    max_speed=limits["speedGauge"],
    use_mock=True
)

@app.route('/')
def index():
    return (
        "Hello! The Flask server is running. "
        "Connect to the React frontend at http://localhost:5173"
    )

@app.route("/api/limits", methods=["GET"])
def get_limits():
    return jsonify(limits)

@app.route("/api/limits", methods=["POST"])
def set_limits():
    global limits, obd_sim

    data = request.get_json(force=True)
    new_rpm   = int(data.get("maxRpm", limits["maxRpm"]))
    new_speed = int(data.get("maxSpeed", limits["maxSpeed"]))

    limits["maxRpm"]   = new_rpm
    limits["maxSpeed"] = new_speed

    with open("config/limits.json", "w") as f:
        json.dump(limits, f, indent=2)

    obd_sim.set_limits(new_rpm, new_speed)
    return jsonify(limits)

def emit_updates():
    while True:
        socketio.sleep(0.1)  # 10Hz
        socketio.emit("update", {
            "rpm":   obd_sim.get_rpm(),
            "speed": obd_sim.get_speed()
        })

@socketio.on("connect")
def handle_connect():
    socketio.start_background_task(emit_updates)

if __name__ == "__main__":
    socketio.run(app, port=5000)
