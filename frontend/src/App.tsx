import { useState, useEffect } from 'react';
import io, { Socket } from 'socket.io-client';
import Gauge from './components/victory-gauge';
import Cluster from './components/Cluster';
// Define the data structure
interface DashboardData {
    rpm: number;
    speed: number;
    gear: number;
}

const socket: Socket = io('http://localhost:5000');

export default function App() {
    const [data, setData] = useState<DashboardData>({ rpm: 0, speed: 0, gear: 0 });

    useEffect(() => {
        socket.on('update', (newData: DashboardData) => {
            setData(newData);
        });
    }, []);

    return (
        <div>
            <Cluster dashboardData={data}/>
        </div>
    );
}
