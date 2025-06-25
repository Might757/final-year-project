import React from 'react';
import { VictoryLabel } from 'victory';
import { animated, useSpring } from '@react-spring/web';
import { useGaugeConfig } from "../../context/GaugeConfigContext";

export default function SpeedGauge({ speed }: { speed: number }) {
    const { config } = useGaugeConfig();
    const max = config.speedGauge.max;

    const safeSpeed = Math.min(Math.max(speed, 0), max);

    const { animatedValue } = useSpring({
        from: { animatedValue: 0 },
        to: { animatedValue: safeSpeed },
        config: { mass: 1, tension: 170, friction: 22 }
    });

    function generateTicks(count: number, radius: number, startAngle: number, endAngle: number) {
        const ticks = [];
        const angleStep = (endAngle - startAngle) / (count - 1);

        for (let i = 0; i < count; i++) {
            const angle = (startAngle + i * angleStep) * (Math.PI / 180);
            const x1 = 200 + radius * Math.cos(angle);
            const y1 = 200 + radius * Math.sin(angle);
            const x2 = 200 + (radius - 10) * Math.cos(angle);
            const y2 = 200 + (radius - 10) * Math.sin(angle);

            ticks.push(
                <line
                    key={i}
                    x1={x1}
                    y1={y1}
                    x2={x2}
                    y2={y2}
                    stroke="white"
                    strokeWidth="2"
                />
            );
        }

        return ticks;
    }
    function generateTickLabels(count: number, values: number[], radius: number, startAngle: number, endAngle: number) {
        const labels = [];
        const angleStep = (endAngle - startAngle) / (count - 1);

        for (let i = 0; i < count; i++) {
            const angle = (startAngle + i * angleStep) * (Math.PI / 180);
            const x = 200 + radius * Math.cos(angle);
            const y = 200 + radius * Math.sin(angle);

            labels.push(
                <VictoryLabel
                    key={i}
                    textAnchor="middle"
                    verticalAnchor="middle"
                    x={x}
                    y={y}
                    text={(values[i] ?? "").toString()}

                    style={{
                        fontSize: 12,
                        fill: 'white',
                        opacity: 0.7
                    }}
                />
            );
        }

        return labels;
    }


    const AnimatedLine = animated('line');

    return (
        <div style={{ width: '30vw', height: '50vh', position: 'relative' }}>
            <svg viewBox="0 0 400 400">
                <defs>
                    <radialGradient id="speedGradient" r="50%" cx="50%" cy="50%">
                        <stop offset="0%" stopColor="#222" />
                        <stop offset="100%" stopColor="#000" />
                    </radialGradient>
                </defs>

                {/* Outer Circle */}
                <circle
                    cx="200"
                    cy="200"
                    r="190"
                    stroke="white"
                    strokeWidth="2"
                    fill="none"
                    style={{
                        filter: 'url(#glow)',
                        opacity: 1
                    }}
                />

                {/* Ticks */}
                {generateTicks(13, 180, -90, 90)}
                {generateTickLabels(13, [0, 20, 40, 60, 80, 100, 140, 180, 220, 260, 280, 300, 320], 155, -90, 90)}

                {/* Needle */}
                <AnimatedLine
                    x1="200"
                    y1="150"   // Shorter needle start
                    x2="200"
                    y2="70"    // Needle tip
                    stroke="white"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    style={{
                        transform: animatedValue.to(v => `rotate(${(Math.min(Math.max(v, 0), max) / max) * 180}deg)`),
                        transformOrigin: '200px 200px'
                    }}
                />

                {/* Units Label */}
                <VictoryLabel
                    textAnchor="middle"
                    verticalAnchor="middle"
                    x={200}
                    y={320}
                    text="km/h"
                    style={{
                        fontSize: 20,
                        fill: "white",
                        opacity: 0.7
                    }}
                />
            </svg>

            {/* Big Animated Speed Number */}
            <animated.div style={{
                position: 'absolute',
                top: '34%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                fontSize: '3rem',
                fontFamily: 'Orbitron, sans-serif',
                fontWeight: 'bold',
                color: 'white'
            }}>
                {animatedValue.to(v => `${Math.round(v)}`)}
            </animated.div>
        </div>
    );
}
