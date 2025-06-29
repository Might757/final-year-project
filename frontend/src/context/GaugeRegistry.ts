import React from "react";

// 1. Use Vite’s glob to pull in all TSX under /gauges
const modules = import.meta.glob("../components/gauges/*.tsx", ({eager: true}));

// 2. Define the shape of what each module should export
type GaugeModule = {
    metadata: { id: string; label: string; icon?: string };
    default: React.ComponentType<{ [prop: string]: any }>;
};

// 3. Build an array of registered gauges
export interface RegisteredGauge {
    id:      string;
    label:   string;
    icon?:   string;
    Component: React.ComponentType<{ [prop: string]: any }>;
}

export const gaugeRegistry: RegisteredGauge[] = Object.entries(modules).map(
    ([, mod]) => {
        const m = mod as unknown as GaugeModule;
        return {
            id:        m.metadata.id,
            label:     m.metadata.label,
            icon:      m.metadata.icon,
            Component: m.default,
        };
    }
);
