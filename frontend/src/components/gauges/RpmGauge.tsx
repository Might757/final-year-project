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

    // Big number animation (rpm display)
    const { number } = useSpring({
        from: { number: 0 },
        to: { number: value },
        config: { mass: 1, tension: 170, friction: 22 }
    });

    // Needle rotation animation
    const rotation = (value / max) * 180;

    const { rotate } = useSpring({
        from: { rotate: 0 },
        to: { rotate: rotation },
        config: { mass: 1, tension: 170, friction: 22 }
    });

    // Halo breathing spring (controlled manually)
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

            const isWarningTick = i >= count - 3; // Last 3 ticks are red

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
                    <linearGradient id="needleGradient" x1="0%" y1="100%" x2="0%" y2="0%">
                        <stop offset="0%" stopColor="white" stopOpacity="0" />
                        <stop offset="100%" stopColor="white" stopOpacity="1" />
                    </linearGradient>
                    <filter id="needleGlow">
                        <feGaussianBlur stdDeviation="2.5" result="coloredBlur" />
                        <feMerge>
                            <feMergeNode in="coloredBlur" />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>
                </defs>

                {/* Outer Halo Circle */}
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

                {/* Ticks */}
                {generateTicks(13, 180, -90, 90)}

                {/* Needle */}
                <AnimatedLine
                    x1="200"
                    y1="150"   // Start a little above center (closer to middle)
                    x2="200"
                    y2="70"    // End like before
                    stroke="white"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    style={{
                        transform: rotate.to(r => `rotate(${r}deg)`),
                        transformOrigin: '200px 200px'
                    }}
                />





                {/* Units Label */}
                <VictoryLabel
                    textAnchor="middle"
                    verticalAnchor="middle"
                    x={200}
                    y={320}
                    text="RPM"
                    style={{
                        fontSize: 20,
                        fill: "white",
                        opacity: 0.7
                    }}
                />
            </svg>

            {/* Big Animated RPM Number */}
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
                {number.to(n => `${Math.round(n)}`)}
            </animated.div>
        </div>
    );
}
