import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface BarChartWidgetProps {
    data: any[];
    xDataKey: string;
    barDataKey: string;
    color?: string;
}

const BarChartWidget: React.FC<BarChartWidgetProps> = ({ data, xDataKey, barDataKey, color = "#8884d8" }) => {
    return (
        <ResponsiveContainer width="100%" height={300}>
            <BarChart
                data={data}
                margin={{
                    top: 5,
                    right: 30,
                    left: 20,
                    bottom: 5,
                }}
            >
                <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                <XAxis dataKey={xDataKey} stroke="#ccc" />
                <YAxis stroke="#ccc" />
                <Tooltip 
                    contentStyle={{ backgroundColor: '#333', borderColor: '#555', color: '#fff' }}
                    itemStyle={{ color: '#fff' }}
                />
                <Legend />
                <Bar dataKey={barDataKey} fill={color} radius={[4, 4, 0, 0]} />
            </BarChart>
        </ResponsiveContainer>
    );
};

export default BarChartWidget;
