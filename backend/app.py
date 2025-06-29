import socketio
import json
from flask import Flask, jsonify, request
from flask_cors import CORS
from flask_socketio import SocketIO
from obd_reader import OBDSimulator
from threading import Thread

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "*"}})
socketio = SocketIO(app, cors_allowed_origins="*")

# ─── 1. Load and apply your limits on startup ───────────────────────────────
with open("config/gauges.json") as f:
    limits = json.load(f)

obd_sim = OBDSimulator(
    max_rpm=limits["rpmGauge"]["max"],
    max_speed=limits["speedGauge"]["max"],
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
    new_rpm   = int(data.get("maxRpm", limits["rpmGauge"]["max"]))
    new_speed = int(data.get("maxSpeed", limits["speedGauge"]["max"]))

    limits["rpmGauge"]["max"] = new_rpm
    limits["speedGauge"]["max"] = new_speed

    with open("config/gauges.json", "w") as f:
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
