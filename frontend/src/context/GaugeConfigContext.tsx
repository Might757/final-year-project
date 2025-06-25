import React, { createContext, useState, useEffect, ReactNode } from "react";

// Configuration
export interface GaugeConfig {
    speedGauge: { max: number };
    rpmGauge:   { max: number };
    // → add other gauges here as needed
}

// Defaults for config if fails to load
const defaultConfig: GaugeConfig = {
    speedGauge: { max: 320 },
    rpmGauge:   { max: 7000 },
};

// The context value: both the config and a setter for live updates
interface ContextValue {
    config: GaugeConfig;
    setConfig: React.Dispatch<React.SetStateAction<GaugeConfig>>;
}

export const GaugeConfigContext = createContext<ContextValue | undefined>(undefined);

// Provider component that fetches JSON on mount
export const GaugeConfigProvider = ({ children }: { children: ReactNode }) => {
    const [config, setConfig] = useState<GaugeConfig>(defaultConfig);

    useEffect(() => {
        fetch("/config/gauges.json")
            .then(res => res.json())
            .then((json: GaugeConfig) => setConfig(json))
            .catch(err => {
                console.error("Could not load gauge config, using defaults", err);
            });
    }, []);

    return (
        <GaugeConfigContext.Provider value={{ config, setConfig }}>
            {children}
        </GaugeConfigContext.Provider>
    );
};

export function useGaugeConfig(): ContextValue {
    const ctx = React.useContext(GaugeConfigContext);
    if (!ctx) throw new Error("useGaugeConfig must be used within GaugeConfigProvider");
    return ctx;
}
