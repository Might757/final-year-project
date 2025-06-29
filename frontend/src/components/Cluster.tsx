// frontend/src/components/Cluster.tsx
import React from "react";
import { gaugeRegistry } from "../context/GaugeRegistry";
import CenterDisplay from "./centerDisplay/CenterDisplay";

interface DashboardData {
    speed: number;
    rpm:   number;
    gear:  number;
}

export default function Cluster({
                                    dashboardData: { speed, rpm, gear },
                                    gaugeIds,
                                }: {
    dashboardData: DashboardData;
    gaugeIds:      string[];
}) {
    // A quick lookup for speed/rpm by name
    const dataMap: Record<string, number> = { speed, rpm };

    return (
        <div
            style={{
                display:        "flex",
                justifyContent: "space-around",
                alignItems:     "center",
                height:         "100vh",
                width:          "100vw",
                backgroundColor:"#121212",
            }}
        >
            {/*
        For each gauge id the user selected, find its component
        in the registry and render it with the correct prop.
      */}
            {gaugeIds.map(id => {
                const entry = gaugeRegistry.find(g => g.id === id);
                if (!entry) return null;

                const { Component } = entry;
                // Derive propName: strip "Gauge" suffix e.g. "speedGauge" → "speed"
                const propName = id.replace(/Gauge$/, "");
                const value    = dataMap[propName] ?? 0;

                return <Component key={id} {...{ [propName]: value }} />;
            })}

            {/* Center display is always shown in the middle */}
            <CenterDisplay gear={gear} />
        </div>
    );
}
