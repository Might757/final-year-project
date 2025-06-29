import React, { useState } from "react";
import { useGaugeConfig } from "../context/GaugeConfigContext";
import "./SettingsPanel.css"
export default function SettingsPanel() {
    const { config, saveLimits } = useGaugeConfig();

    const [rpm, setRpm] = useState(config.rpmGauge.max);
    const [spd, setSpd] = useState(config.speedGauge.max);
    const [busy, setBusy] = useState(false);

    const handleSave = async () => {
        setBusy(true);
        await saveLimits(rpm, spd);
        setBusy(false);
    };

    return (
        <div className="settings-popup" style={{ padding: 20, background: "#111", color: "white", borderRadius: 10 }}>
            <h3>Gauge Settings</h3>

            <label>
                Max RPM:{" "}
                <input
                    type="number"
                    value={rpm}
                    onChange={e => setRpm(+e.target.value)}
                    min={1000}
                    max={12000}
                />
            </label>
            <br />

            <label>
                Max Speed (km/h):{" "}
                <input
                    type="number"
                    value={spd}
                    onChange={e => setSpd(+e.target.value)}
                    min={20}
                    max={400}
                />
            </label>
            <br />

            <button onClick={handleSave} disabled={busy}>
                {busy ? "Saving…" : "Save"}
            </button>
        </div>
    );
}
