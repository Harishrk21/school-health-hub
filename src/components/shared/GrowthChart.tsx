import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface HealthRecord {
  checkupDate: string;
  height: number;
  weight: number;
  bmi: number;
}

interface GrowthChartProps {
  records: HealthRecord[];
  type: 'height' | 'weight' | 'bmi';
  title: string;
}

export function GrowthChart({ records, type, title }: GrowthChartProps) {
  const chartData = records
    .sort((a, b) => new Date(a.checkupDate).getTime() - new Date(b.checkupDate).getTime())
    .map(record => ({
      date: new Date(record.checkupDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
      value: record[type],
      fullDate: record.checkupDate,
    }));

  const getYAxisLabel = () => {
    switch (type) {
      case 'height':
        return 'Height (cm)';
      case 'weight':
        return 'Weight (kg)';
      case 'bmi':
        return 'BMI';
      default:
        return 'Value';
    }
  };

  const getColor = () => {
    switch (type) {
      case 'height':
        return '#3b82f6'; // blue
      case 'weight':
        return '#10b981'; // green
      case 'bmi':
        return '#f59e0b'; // amber
      default:
        return '#6366f1';
    }
  };

  if (chartData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground py-8">No data available for {title}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="date" 
                tick={{ fontSize: 12 }}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis 
                label={{ value: getYAxisLabel(), angle: -90, position: 'insideLeft' }}
                tick={{ fontSize: 12 }}
              />
              <Tooltip 
                formatter={(value: number) => [value.toFixed(1), getYAxisLabel()]}
                labelFormatter={(label) => `Date: ${label}`}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="value" 
                stroke={getColor()} 
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
                name={getYAxisLabel()}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        {chartData.length > 0 && (
          <div className="mt-4 flex items-center justify-between text-sm">
            <div>
              <span className="text-muted-foreground">First Record: </span>
              <span className="font-medium">{chartData[0].value.toFixed(1)}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Latest: </span>
              <span className="font-medium">{chartData[chartData.length - 1].value.toFixed(1)}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Change: </span>
              <span className={`font-medium ${
                chartData[chartData.length - 1].value > chartData[0].value ? 'text-green-600' : 
                chartData[chartData.length - 1].value < chartData[0].value ? 'text-red-600' : 
                'text-muted-foreground'
              }`}>
                {chartData[chartData.length - 1].value > chartData[0].value ? '↑' : 
                 chartData[chartData.length - 1].value < chartData[0].value ? '↓' : '→'} 
                {Math.abs(chartData[chartData.length - 1].value - chartData[0].value).toFixed(1)}
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

