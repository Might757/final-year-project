import React from 'react';
import { VictoryLabel } from 'victory';
import { animated, useSpring } from '@react-spring/web';
import { useGaugeConfig } from "../../context/GaugeConfigContext";

// “nice number” algorithim: rounds a raw interval to 1,2,5,10,20,50… etc.
function niceInterval(raw: number) {
    const exponent = Math.floor(Math.log10(raw));
    const base = raw / Math.pow(10, exponent);
    let niceBase: number;
    if (base < 1.5) niceBase = 1;
    else if (base < 3) niceBase = 2;
    else if (base < 7) niceBase = 5;
    else niceBase = 10;
    return niceBase * Math.pow(10, exponent);
}

export default function SpeedGauge({ speed }: { speed: number }) {
    const { config } = useGaugeConfig();
    const max = config.speedGauge.max;
    const safeSpeed = Math.min(Math.max(speed, 0), max);

    // animate the current value
    const { animatedValue } = useSpring({
        from: { animatedValue: 0 },
        to:   { animatedValue: safeSpeed },
        config: { mass: 1, tension: 170, friction: 22 }
    });

    //
    // Decide on interval
    //
    const targetTicks = 10;
    const rawInterval = max / targetTicks;
    const interval = niceInterval(rawInterval);        // e.g. niceInterval(390/10) = 50
    const tickValues = [];
    for (let v = 0; v <= max; v += interval) {
        tickValues.push(Math.round(v));
    }
    // ensure last tick hits exactly max
    if (tickValues[tickValues.length - 1] !== max) {
        tickValues.push(max);
    }

    //
    // Generate tick positions around dial
    //
    function generateTicks(count: number, radius: number, startAngle: number, endAngle: number) {
        const ticks = [];
        const angleStep = (endAngle - startAngle) / (count - 1);
        for (let i = 0; i < count; i++) {
            const angleRad = (startAngle + i * angleStep) * (Math.PI / 180);
            const x1 = 200 + radius * Math.cos(angleRad);
            const y1 = 200 + radius * Math.sin(angleRad);
            const x2 = 200 + (radius - 10) * Math.cos(angleRad);
            const y2 = 200 + (radius - 10) * Math.sin(angleRad);

            ticks.push(
                <line
                    key={`tick-${i}`}
                    x1={x1} y1={y1} x2={x2} y2={y2}
                    stroke="white"
                    strokeWidth={i === 0 || i === count - 1 ? 3 : 1}  // bolder at min/max
                />
            );
        }
        return ticks;
    }

    //
    // Generate tick labels around dial
    //
    function generateTickLabels(values: number[], radius: number, startAngle: number, endAngle: number) {
        const labels = [];
        const count = values.length;
        const angleStep = (endAngle - startAngle) / (count - 1);

        for (let i = 0; i < count; i++) {
            const angleRad = (startAngle + i * angleStep) * (Math.PI / 180);
            const x = 200 + radius * Math.cos(angleRad);
            const y = 200 + radius * Math.sin(angleRad);

            labels.push(
                <VictoryLabel
                    key={`label-${i}`}
                    textAnchor="middle"
                    verticalAnchor="middle"
                    x={x}
                    y={y}
                    text={values[i].toString()}
                    style={{ fontSize: 12, fill: 'white', opacity: 0.7 }}
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

                {/* Outer circle */}
                <circle
                    cx="200" cy="200" r="190"
                    stroke="white" strokeWidth="2" fill="none"
                    style={{ filter: 'url(#glow)', opacity: 1 }}
                />

                {/* Ticks & labels */}
                {generateTicks(tickValues.length, 180, -90, 90)}
                {generateTickLabels(tickValues, 155, -90, 90)}

                {/* Needle */}
                <AnimatedLine
                    x1="200" y1="150" x2="200" y2="70"
                    stroke="white" strokeWidth="2.5" strokeLinecap="round"
                    style={{
                        transform: animatedValue.to(v =>
                            `rotate(${(v / max) * 180}deg)`
                        ),
                        transformOrigin: '200px 200px'
                    }}
                />

                {/* Units */}
                <VictoryLabel
                    textAnchor="middle" verticalAnchor="middle"
                    x={200} y={320} text="km/h"
                    style={{ fontSize: 20, fill: "white", opacity: 0.7 }}
                />
            </svg>

            {/* Big number */}
            <animated.div style={{
                position: 'absolute', top: '34%', left: '50%',
                transform: 'translate(-50%, -50%)',
                fontSize: '3rem', fontFamily: 'Orbitron, sans-serif',
                fontWeight: 'bold', color: 'white'
            }}>
                {animatedValue.to(v => Math.round(v))}
            </animated.div>
        </div>
    );
}
