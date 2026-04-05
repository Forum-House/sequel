'use client';

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

interface TrafficChartProps {
  data: Array<{ name: string; clicks: number }>;
}

export function TrafficChart({ data }: TrafficChartProps) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.04)" />
        <XAxis
          dataKey="name"
          stroke="rgba(0,0,0,0.2)"
          tick={{ fontSize: 10, fill: 'rgba(0,0,0,0.4)' }}
          tickLine={false}
          axisLine={false}
        />
        <YAxis 
          stroke="rgba(0,0,0,0.2)" 
          tick={{ fontSize: 10, fill: 'rgba(0,0,0,0.4)' }}
          tickLine={false}
          axisLine={false}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: '#ffffff',
            border: '1px solid rgba(0,0,0,0.08)',
            borderRadius: '2px',
            fontSize: '11px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
          }}
        />
        <Line
          type="monotone"
          dataKey="clicks"
          stroke="rgba(0,0,0,0.7)"
          strokeWidth={1.5}
          dot={{ r: 3, fill: '#ffffff', stroke: 'rgba(0,0,0,0.5)', strokeWidth: 1.5 }}
          activeDot={{ r: 4, fill: '#000000' }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
