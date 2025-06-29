import React from "react";
import { gaugeRegistry } from "../context/GaugeRegistry";
import "./GaugeSelector.css";
export default function GaugeSelector({
                                          selectedIds,
                                          toggle,
                                      }: {
    selectedIds: string[];
    toggle: (id: string) => void;
}) {
    return (
        <div className="settings" style={{ padding: 16, background: "#222", color: "#fff" }}>
            <h4>Choose Gauges</h4>
            {gaugeRegistry.map(({ id, label, icon }) => (
                <label key={id} style={{ display: "block", margin: "4px 0" }}>
                    <input
                        type="checkbox"
                        checked={selectedIds.includes(id)}
                        onChange={() => toggle(id)}
                    />{" "}
                    {label}
                </label>
            ))}
        </div>
    );
}
