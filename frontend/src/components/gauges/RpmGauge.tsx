import React, {useState, useEffect, JSX} from 'react';
import { VictoryLabel } from 'victory';
import { animated, useSpring } from '@react-spring/web';
import { useGaugeConfig } from "../../context/GaugeConfigContext";

const startAngle = 0;
const endAngle = 180;
const span = endAngle - startAngle;

// Round a raw interval to something like 1,2,5,10,20,… ×10^n
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
export const metadata = {
    id: "rpmGauge",
    label: "RPM",
    icon: "tachometer",
};
export default function RpmGauge({ rpm }: { rpm: number }) {
    const { config } = useGaugeConfig();
    const max = config.rpmGauge.max;
    const safeRpm = Math.min(Math.max(rpm, 0), max);

    // Animate the numeric value
    const { animatedValue } = useSpring({
        from: { animatedValue: 0 },
        to:   { animatedValue: safeRpm },
        config: { mass: 1, tension: 170, friction: 22 }
    });

    // Over-rev flashing
    const [over, setOver] = useState(false);
    useEffect(() => {
        setOver(safeRpm > max * 0.85);  // 85% of redline
    }, [safeRpm, max]);

    // Flashing halo spring
    const [haloProps, haloApi] = useSpring(() => ({ opacity: 1, strokeWidth: 2 }));
    useEffect(() => {
        if (over) {
            haloApi.start({
                to: async next => {
                    while (1) {
                        await next({ opacity: 1, strokeWidth: 6 });
                        await next({ opacity: 0.6, strokeWidth: 2 });
                    }
                },
                loop: true,
                config: { duration: 300 }
            });
        } else {
            haloApi.stop();
            haloApi.start({ opacity: 1, strokeWidth: 2, config: { duration: 300 } });
        }
    }, [over, haloApi]);

    //
    // Build tick values from 0 to max
    //
    const targetTicks = 8;
    const rawInt = max / targetTicks;
    const interval = niceInterval(rawInt);
    const tickValues: number[] = [];
    for (let v = 0; v <= max; v += interval) {
        tickValues.push(Math.round(v));
    }
    if (tickValues[tickValues.length - 1] !== max) {
        tickValues.push(max);
    }

    //
    // Render tick **lines**
    //
    function renderTicks(count: number, radius: number, start: number, end: number) {
        const ticks = [];
        const step = (end - start) / (count - 1);
        for (let i = 0; i < count; i++) {
            const a = (start + i * step) * (Math.PI / 180);
            const x1 = 200 + radius * Math.cos(a);
            const y1 = 200 + radius * Math.sin(a);
            const x2 = 200 + (radius - 10) * Math.cos(a);
            const y2 = 200 + (radius - 10) * Math.sin(a);
            const isWarning = tickValues[i] >= max * 0.85;

            ticks.push(
                <line
                    key={i}
                    x1={x1} y1={y1} x2={x2} y2={y2}
                    stroke={isWarning ? 'red' : 'white'}
                    strokeWidth={i === 0 || i === count - 1 ? 3 : 1}
                />
            );
        }
        return ticks;
    }

    //
    // Render tick **labels** (in x1000 RPM units)
    //
    function renderLabels(
        values: number[],
        radius: number,
        startAngle: number,
        endAngle: number
    ) {
        const labels: JSX.Element[] = [];
        const count = values.length;
        const step  = (endAngle - startAngle) / (count - 1);

        for (let i = 0; i < count; i++) {
            const v = values[i];

            // This will skip halves
            if (v % 1000 !== 0) continue;

            const angleRad = (startAngle + i * step) * (Math.PI / 180);
            const x = 200 + radius * Math.cos(angleRad);
            const y = 200 + radius * Math.sin(angleRad);

            labels.push(
                <VictoryLabel
                    key={`lbl-${i}`}
                    x={x} y={y}
                    textAnchor="middle"
                    verticalAnchor="middle"
                    text={(v / 1000).toFixed(0)}  // “1”, “2”, … “7”
                    style={{ fontSize: 12, fill: 'white', opacity: 0.7 }}
                />
            );
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

                {/* Flashing halo */}
                <AnimatedCircle
                    cx={200} cy={200} r={190}
                    stroke={over ? 'red' : 'white'} fill="none"
                    style={{
                        filter: 'url(#glow)',
                        opacity: haloProps.opacity,
                        strokeWidth: haloProps.strokeWidth
                    }}
                />

                {/* Ticks and labels */}
                {renderTicks(tickValues.length, 180, -90, 90)}
                {renderLabels(tickValues, 155, -90, 90)}

                {/* Needle */}
                <AnimatedLine
                    x1="200" y1="150" x2="200" y2="70"
                    stroke="white" strokeLinecap="round"
                    style={{
                        transform: animatedValue.to(v => {
                            const pct = Math.min(Math.max(v,0), max) / max;
                            const deg = pct* span + startAngle;
                            return `rotate(${deg}deg)`;
                        }),
                        transformOrigin: '200px 200px'
                    }}
                />

                {/* Units legend */}
                <VictoryLabel
                    textAnchor="middle" verticalAnchor="middle"
                    x={200} y={320} text="×1000 RPM"
                    style={{ fontSize: 20, fill: "white", opacity: 0.7 }}
                />
            </svg>

            {/* Big RPM number */}
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
