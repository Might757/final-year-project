import SpeedGauge from './gauges/SpeedGauge';
import RpmGauge from './gauges/RpmGauge';
import CenterDisplay from './centerDisplay/CenterDisplay';

interface DashboardData {
    rpm: number;
    speed: number;
    gear: number;
}

export default function Cluster({ dashboardData }: { dashboardData: DashboardData }) {
    return (
        <div style={{
            display: 'flex',
            justifyContent: 'space-around',
            alignItems: 'center',
            height: '100vh',
            width: '100vw',
            backgroundColor: '#121212'
        }}>
            <SpeedGauge speed={dashboardData.speed} />
            <CenterDisplay gear={dashboardData.gear} />
            <RpmGauge rpm={dashboardData.rpm} />
        </div>
    );
}
