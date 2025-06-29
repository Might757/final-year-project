// frontend/src/App.tsx
import React, { useState, useEffect } from 'react';
import io, { Socket } from 'socket.io-client';

import Cluster           from './components/Cluster';
import GaugeSelector     from './components/GaugeSelector';
import SettingsPanel     from './components/SettingsPanel';
import { gaugeRegistry } from './context/GaugeRegistry';

interface DashboardData { rpm: number; speed: number; gear: number; }
const socket: Socket = io('http://localhost:5000');

export default function App() {
    const [data, setData]             = useState<DashboardData>({ rpm:0, speed:0, gear:0 });
    const [showSettings, setSettings] = useState(false);
    // ← New state for showing/hiding gauge selector
    const [showSelector, setSelector] = useState(false);

    const DEFAULT_GAUGES = ["speedGauge", "rpmGauge"];

    const [selectedGauges, setSelectedGauges] = useState<string[]>(() =>
        DEFAULT_GAUGES
    );

    const toggleGauge = (id: string) => {
        setSelectedGauges(s =>
            s.includes(id) ? s.filter(x => x !== id) : [...s, id]
        );
    };

    useEffect(() => {
        socket.on('update', setData);
        return () => { socket.off('update'); };
    }, []);

    return (
        <>
            {/* Settings */}
            <button
                onClick={() => setSettings(s => !s)}
                style={{ position:"absolute", top:10, right:10, zIndex:1000 }}
            >⚙ Settings</button>
            {showSettings && <SettingsPanel />}

            {/* ← New: toggle for gauge selector */}
            <button
                onClick={() => setSelector(v => !v)}
                style={{ position:"absolute", top:10, left:10, zIndex:1000 }}
            >Select Gauges</button>
            {showSelector && (
                <GaugeSelector
                    selectedIds={selectedGauges}
                    toggle={toggleGauge}
                />
            )}

            {/* Dashboard */}
            <Cluster
                dashboardData={data}
                gaugeIds={selectedGauges}
            />
        </>
    );
}
