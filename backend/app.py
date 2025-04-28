import socketio
from flask import Flask
from flask_socketio import SocketIO
from obd_reader import OBDSimulator
from threading import Thread



app = Flask(__name__)
socketio = SocketIO(app, cors_allowed_origins="*")
obd_sim = OBDSimulator(use_mock=True)

@app.route('/')
def index():
    return "Hello! The Flask server is running. Connect to the React frontend at http://localhost:5173"

def emit_updates():
    while True:
        socketio.sleep(0.1)  # Update every 100ms
        socketio.emit("update", {
            "rpm": obd_sim.get_rpm(),
            "speed": obd_sim.get_speed()
        })

@socketio.on("connect")
def handle_connect():
    Thread(target=emit_updates).start()  # Start thread on client connect

if __name__ == "__main__":
    socketio.run(app, port=5000)