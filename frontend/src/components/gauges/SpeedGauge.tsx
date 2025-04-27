// src/components/gauges/SpeedGauge.tsx

import React from 'react';
import { VictoryPie, VictoryLabel } from 'victory';
import { animated, useSpring } from '@react-spring/web';

export default function SpeedGauge() {
    const value = 84; // temporary
    const max = 260;

    const percent = (value / max) * 100;
    const rotation = (percent * 180) / 100 - 90;

    const { number } = useSpring({
        from: { number: 0 },
        to: { number: value },
        config: { mass: 1, tension: 170, friction: 20 }
    });

    return (
        <div style={{ width: '30vw', height: '50vh', position: 'relative' }}>
            <svg viewBox="0 0 400 400">
                <defs>
                    <radialGradient id="speedGradient" r="50%" cx="50%" cy="50%">
                        <stop offset="0%" stopColor="#222" />
                        <stop offset="100%" stopColor="#000" />
                    </radialGradient>
                </defs>

                <circle cx="200" cy="200" r="180" stroke="white" strokeWidth="3" fill="url(#speedGradient)" />

                <VictoryPie
                    standalone={false}
                    data={[
                        { x: 1, y: percent },
                        { x: 2, y: 100 - percent }
                    ]}
                    innerRadius={130}
                    startAngle={-90}
                    endAngle={90}
                    labels={() => null}
                    style={{
                        data: { fill: ({ datum }) => (datum.x === 1 ? "white" : "transparent") }
                    }}
                />

                <VictoryLabel
                    textAnchor="middle"
                    verticalAnchor="middle"
                    x={200}
                    y={250}
                    text={`${Math.round(value)}`}
                    style={{
                        fontSize: 50,
                        fontFamily: "Orbitron, sans-serif",
                        fill: "white",
                        fontWeight: "bold"
                    }}
                />
                <VictoryLabel
                    textAnchor="middle"
                    verticalAnchor="middle"
                    x={200}
                    y={290}
                    text="km/h"
                    style={{
                        fontSize: 20,
                        fill: "white",
                        opacity: 0.7
                    }}
                />
            </svg>
        </div>
    );
}
