# backend/obd_reader.py
import obd
import random
from time import time

class OBDSimulator:
    def __init__(self, use_mock=True):
        self.use_mock = use_mock
        self.last_rpm = 1000  # Track state between calls
        self.last_speed = 0

    def get_rpm(self):
        if self.use_mock:
            # Simulate realistic RPM fluctuations
            self.last_rpm += random.randint(-100, 200)
            self.last_rpm = max(800, min(7000, self.last_rpm))  # Clamp RPM between 800-7000
            return self.last_rpm
        # ... (real OBD code)

    def get_speed(self):
        if self.use_mock:
            # Simulate gradual speed changes
            self.last_speed += random.randint(-5, 10)
            self.last_speed = max(0, min(320, self.last_speed))  # Clamp speed between 0-200 km/h
            return self.last_speed
        # ... (real OBD code)