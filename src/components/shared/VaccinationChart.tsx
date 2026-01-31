import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface VaccinationChartProps {
  data: {
    Completed: number;
    Pending: number;
    Overdue: number;
  };
}

export function VaccinationChart({ data }: VaccinationChartProps) {
  const chartData = [
    { name: 'Completed', value: data.Completed, fill: '#10b981' },
    { name: 'Pending', value: data.Pending, fill: '#f59e0b' },
    { name: 'Overdue', value: data.Overdue, fill: '#ef4444' },
  ];

  const total = data.Completed + data.Pending + data.Overdue;
  const complianceRate = total > 0 ? ((data.Completed / total) * 100).toFixed(1) : 0;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Vaccination Status</CardTitle>
          <div className="text-right">
            <p className="text-2xl font-bold text-primary">{complianceRate}%</p>
            <p className="text-xs text-muted-foreground">Compliance Rate</p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
              <XAxis type="number" />
              <YAxis type="category" dataKey="name" width={80} />
              <Tooltip />
              <Bar dataKey="value" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t">
          {chartData.map(item => (
            <div key={item.name} className="text-center">
              <p className="text-2xl font-bold" style={{ color: item.fill }}>{item.value}</p>
              <p className="text-xs text-muted-foreground">{item.name}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
