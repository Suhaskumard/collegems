import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface LineChartWidgetProps {
    data: any[];
    xDataKey: string;
    lineDataKey: string;
    color?: string;
}

const LineChartWidget: React.FC<LineChartWidgetProps> = ({ data, xDataKey, lineDataKey, color = "#82ca9d" }) => {
    return (
        <ResponsiveContainer width="100%" height={300}>
            <LineChart
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
                <Line type="monotone" dataKey={lineDataKey} stroke={color} strokeWidth={2} activeDot={{ r: 8 }} />
            </LineChart>
        </ResponsiveContainer>
    );
};

export default LineChartWidget;
