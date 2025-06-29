# backend/obd_reader.py
import obd
import random
from time import time

class OBDSimulator:
    def __init__(self, max_rpm=7000, max_speed=320, use_mock=True):
        self.use_mock = use_mock
        self.max_rpm = max_rpm
        self.max_speed = max_speed
        self.last_rpm = 1000  # Track state between calls
        self.last_speed = 0

    def set_limits(self, max_rpm, max_speed):
        self.max_rpm = max_rpm
        self.max_speed = max_speed

    def get_rpm(self):
        if self.use_mock:
            # Simulate realistic RPM fluctuations
            self.last_rpm += random.randint(-100, 200)
            self.last_rpm = max(0, min(self.max_rpm, self.last_rpm))  # Clamp RPM between 800-7000
            return self.last_rpm

    def get_speed(self):
        if self.use_mock:
            # Simulate gradual speed changes
            self.last_speed += random.randint(-5, 10)
            self.last_speed = max(0, min(self.max_speed, self.last_speed))  # Clamp speed between 0-200 km/h
            return self.last_speed