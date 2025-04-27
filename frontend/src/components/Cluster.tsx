// src/components/Cluster.tsx

import SpeedGauge from './gauges/SpeedGauge';
import RpmGauge from './gauges/RpmGauge';
import CenterDisplay from './centerDisplay/CenterDisplay';

export default function Cluster() {
    return (
        <div style={{
            display: 'flex',
            justifyContent: 'space-around',
            alignItems: 'center',
            height: '100vh',
            width: '100vw',
            backgroundColor: '#121212' // Deep dark background
        }}>
            <SpeedGauge />
            <CenterDisplay />
            <RpmGauge />
        </div>
    );
}
