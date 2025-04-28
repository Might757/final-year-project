import React, { useState, useEffect } from 'react';
import { VictoryLabel } from 'victory';
import { animated, useSpring } from '@react-spring/web';

export default function RpmGauge({ rpm }: { rpm: number }) {
    const max = 7000;
    const value = rpm;

    const [overRevving, setOverRevving] = useState(false);

    useEffect(() => {
        if (value > 6000 && !overRevving) {
            setOverRevving(true);
        } else if (value <= 6000 && overRevving) {
            setOverRevving(false);
        }
    }, [value, overRevving]);

    const { animatedValue } = useSpring({
        from: { animatedValue: 0 },
        to: { animatedValue: value },
        config: { mass: 1, tension: 170, friction: 22 }
    });

    const [springProps, api] = useSpring(() => ({
        opacity: 1,
        strokeWidth: 2
    }));

    useEffect(() => {
        if (overRevving) {
            api.start({
                to: async (next) => {
                    while (true) {
                        await next({ opacity: 1, strokeWidth: 6 });
                        await next({ opacity: 0.6, strokeWidth: 2 });
                    }
                },
                loop: true,
                config: { duration: 600 }
            });
        } else {
            api.stop();
            api.start({
                opacity: 1,
                strokeWidth: 2,
                config: { duration: 300 }
            });
        }
    }, [overRevving, api]);

    function generateTicks(count: number, radius: number, startAngle: number, endAngle: number) {
        const ticks = [];
        const angleStep = (endAngle - startAngle) / (count - 1);

        for (let i = 0; i < count; i++) {
            const angle = (startAngle + i * angleStep) * (Math.PI / 180);
            const x1 = 200 + radius * Math.cos(angle);
            const y1 = 200 + radius * Math.sin(angle);
            const x2 = 200 + (radius - 10) * Math.cos(angle);
            const y2 = 200 + (radius - 10) * Math.sin(angle);

            const isWarningTick = i >= 10; // Last 4 ticks red (6k+)

            ticks.push(
                <line
                    key={i}
                    x1={x1}
                    y1={y1}
                    x2={x2}
                    y2={y2}
                    stroke={isWarningTick ? 'red' : 'white'}
                    strokeWidth="2"
                />
            );
        }

        return ticks;
    }

    function generateTickLabels(count: number, radius: number, startAngle: number, endAngle: number) {
        const labels = [];
        const angleStep = (endAngle - startAngle) / (count - 1);

        let labelValue = 1; // Start labeling from 1

        for (let i = 1; i < count; i += 2) {  // Start from i=1, then every 2 steps
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
                    text={labelValue.toString()}
                    style={{
                        fontSize: 12,
                        fill: 'white',
                        opacity: 0.7
                    }}
                />
            );
            labelValue++;
        }

        return labels;
    }


    const AnimatedLine = animated('line');
    const AnimatedCircle = animated('circle');

    return (
        <div style={{ width: '30vw', height: '50vh', position: 'relative' }}>
            <svg viewBox="0 0 400 400">
                <defs>
                    <radialGradient id="rpmGradient" r="50%" cx="50%" cy="50%">
                        <stop offset="0%" stopColor="#222" />
                        <stop offset="100%" stopColor="#000" />
                    </radialGradient>

                    <filter id="glow">
                        <feGaussianBlur stdDeviation="4.5" result="coloredBlur" />
                        <feMerge>
                            <feMergeNode in="coloredBlur" />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>
                </defs>

                {/* Outer Halo */}
                <AnimatedCircle
                    cx="200"
                    cy="200"
                    r="190"
                    stroke={overRevving ? 'red' : 'white'}
                    fill="none"
                    style={{
                        filter: 'url(#glow)',
                        opacity: springProps.opacity,
                        strokeWidth: springProps.strokeWidth
                    }}
                />

                {/* Ticks and Labels */}
                {generateTicks(14, 180, -90, 90)}
                {generateTickLabels(14, 155, -90, 90)}

                {/* Needle */}
                <AnimatedLine
                    x1="200"
                    y1="150"
                    x2="200"
                    y2="70"
                    stroke="white"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    style={{
                        transform: animatedValue.to(v => `rotate(${(Math.min(Math.max(v, 0), max) / max) * 180}deg)`),
                        transformOrigin: '200px 200px'
                    }}
                />

                {/* Units */}
                <VictoryLabel
                    textAnchor="middle"
                    verticalAnchor="middle"
                    x={200}
                    y={320}
                    text="x1000 RPM"
                    style={{
                        fontSize: 20,
                        fill: "white",
                        opacity: 0.7
                    }}
                />
            </svg>

            {/* Big RPM Number */}
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
