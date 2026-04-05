'use client';

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

interface GeoChartProps {
  data: Array<{ name: string; value: number }>;
}

export function GeoChart({ data }: GeoChartProps) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} layout="vertical" margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.04)" horizontal={false} />
        <XAxis type="number" hide />
        <YAxis
          dataKey="name"
          type="category"
          stroke="rgba(0,0,0,0.2)"
          tick={{ fontSize: 10, fill: 'rgba(0,0,0,0.5)' }}
          tickLine={false}
          axisLine={false}
          width={30}
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
        <Bar 
          dataKey="value" 
          fill="rgba(0,0,0,0.15)" 
          radius={[0, 2, 2, 0]}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
