import { useState, useEffect } from 'react';
import io, { Socket } from 'socket.io-client';
import Gauge from './components/victory-gauge';
import Cluster from './components/Cluster';

import SettingsPanel from "./components/SettingsPanel"
// Define the data structure
interface DashboardData {
    rpm: number;
    speed: number;
    gear: number;
}

const socket: Socket = io('http://localhost:5000');

export default function App() {
    const [data, setData] = useState<DashboardData>({ rpm: 0, speed: 0, gear: 0 });
    const [showSettings, setShowSettings] = useState(false);
    useEffect(() => {
        socket.on('update', (newData: DashboardData) => {
            setData(newData);
        });
    }, []);

    return (
        <>
            <button
                onClick={() => setShowSettings(!showSettings)}
                style={{
                    position: "absolute",
                    top: 10,
                    right: 10,
                    zIndex: 1000
                }}
            >
                ⚙ Settings
            </button>

            {showSettings && <SettingsPanel />}

            <div>
                <Cluster dashboardData={data}/>
            </div>
        </>
    );
}
