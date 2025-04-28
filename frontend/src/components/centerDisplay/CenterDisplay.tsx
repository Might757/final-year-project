// src/components/centerDisplay/CenterDisplay.tsx

import React from 'react';

export default function CenterDisplay() {
    return (
        <div style={{
            color: 'white',
            textAlign: 'center',
            lineHeight: 1.5,
            fontFamily: 'Orbitron, sans-serif'
        }}>
            {/*<div style={{ fontSize: '3rem', margin: '1rem 0' }}>Mazda 3 logo?</div>*/}
            <div style={{ fontSize: '1rem', opacity: 0.7 }}>
                10:34 | 123.4 km | 21.5°C
            </div>
        </div>
    );
}
