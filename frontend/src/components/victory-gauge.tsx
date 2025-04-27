import React from 'react';
import { VictoryPie, VictoryLabel, VictoryStyleObject } from 'victory';
import { animated, useSpring } from '@react-spring/web';

const AnimatedLine = animated('line');

interface Datum {
    x: number;
    y: number;
}

interface GaugeProps {
    value: number;
    max: number;
    label: string;
    threshold?: number;
    baseColor?: string;
    warningColor?: string;
}

const Gauge: React.FC<GaugeProps> = ({
                                         value,
                                         max,
                                         label,
                                         threshold = 7000,
                                         baseColor = '#00FF00',
                                         warningColor = '#FF0000'
                                     }) => {
    const percent = (value / max) * 100;
    const rotation = (percent * 180) / 100 - 90;

    interface ThemeColors {
        gradient: string;
        glow: string;
    }

    const themes: Record<string, ThemeColors> = {
        midnightPurple: {
            gradient: 'midnightPurpleGradient',
            glow: 'purple'
        },
        frostGreen: {
            gradient: 'frostGreenGradient',
            glow: 'lime'
        },
        classicWhite: {
            gradient: 'classicWhiteGradient',
            glow: 'red'
        }
    };
    const { rotate } = useSpring({
        from: { rotate: -90 },
        to: { rotate: rotation },
        config: { tension: 200, friction: 15 }
    });

    const { fill } = useSpring({
        fill: value > threshold ? warningColor : baseColor,
        config: { tension: 200, friction: 15 }
    });

    const data: Datum[] = [
        { x: 1, y: percent },
        { x: 2, y: 100 - percent }
    ];

    const pieStyle: VictoryStyleObject = {
        data: {
            fill: ({ datum }) =>
                (datum as Datum).x === 1 ? `url(#${currentTheme.gradient})` : '#2a2a2a',
            stroke: '#fff',
            strokeWidth: 2
        }
    };
    const currentTheme = themes['frostGreen']; // make this dynamic later
    return (
        <div style={{ width: 500, height: 300, position: 'relative' }}>
            <svg viewBox="0 0 400 400" className={value > threshold ? 'blinking-glow' : ''}
                 style={{
                     '--glow-color': currentTheme.glow
                 } as React.CSSProperties}
            >
                <defs>
                    {/* Midnight Purple */}
                    <linearGradient id="midnightPurpleGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#9d4edd" />
                        <stop offset="70%" stopColor="#7b2cbf" />
                        <stop offset="100%" stopColor="#3c096c" />
                    </linearGradient>

                    {/* Frost Green */}
                    <linearGradient id="frostGreenGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#b8f2e6" />
                        <stop offset="70%" stopColor="#8ef5b5" />
                        <stop offset="100%" stopColor="#38b000" />
                    </linearGradient>

                    {/* Classic White */}
                    <linearGradient id="classicWhiteGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#e0e0e0" />
                        <stop offset="70%" stopColor="#cccccc" />
                        <stop offset="100%" stopColor="#ffffff" />
                    </linearGradient>
                </defs>
                <VictoryPie
                    standalone={false}
                    data={data}
                    innerRadius={120}
                    startAngle={-90}
                    endAngle={90}
                    labels={() => null}
                    style={pieStyle}
                />
                <VictoryLabel
                    textAnchor="middle"
                    verticalAnchor="middle"
                    x={200}
                    y={300}
                    text={`${Math.round(value)}\n${label}`}
                    style={{
                        fontSize: 40,
                        fontFamily: "Orbitron, sans-serif", // looks more tech-y
                        fontWeight: "bold",
                        fill: "white",
                        lineHeight: 1.2
                    }}
                />
            </svg>
        </div>
    );
};

export default Gauge;