import React, { createContext, useState, useEffect, ReactNode } from "react";

// Configuration
export interface GaugeConfig {
    speedGauge: { max: number };
    rpmGauge:   { max: number };
}

// Defaults for config if fails to load
const defaultConfig: GaugeConfig = {
    speedGauge: { max: 320 },
    rpmGauge:   { max: 7000 },
};

interface ContextValue {
    config: GaugeConfig;
    setConfig: React.Dispatch<React.SetStateAction<GaugeConfig>>;
    saveLimits: (maxRpm: number, maxSpeed: number) => Promise<void>;
}

// The context value: both the config and a setter for live updates
const defaultContext: ContextValue = {
    config: defaultConfig,
    setConfig: () => {},
    saveLimits: async () => {}
};


export const GaugeConfigContext = createContext<ContextValue>(defaultContext);

// Provider component that fetches JSON on mount
export const GaugeConfigProvider = ({ children }: { children: React.ReactNode }) => {
    const [config, setConfig] = useState<GaugeConfig>(defaultConfig);
    const API = "http://localhost:5000";
    useEffect(() => {
        fetch(`${API}/api/limits`)
            .then(res => res.json())
            .then(json => setConfig(json));
    }, []);


    const saveLimits = async (maxRpm: number, maxSpeed: number) => {
        const res = await fetch(`${API}/api/limits`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ maxRpm, maxSpeed })
        });
        if (!res.ok) throw new Error(await res.text());
        const json = await res.json();
        setConfig(json);
    };

    return (
        <GaugeConfigContext.Provider value={{ config, setConfig, saveLimits }}>
            {children}
        </GaugeConfigContext.Provider>
    );
};

export function useGaugeConfig(): ContextValue {
    const ctx = React.useContext(GaugeConfigContext);
    if (!ctx) throw new Error("useGaugeConfig must be used within GaugeConfigProvider");
    return ctx;
}
