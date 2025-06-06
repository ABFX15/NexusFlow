import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useState } from "react";

type TimeFrame = '1D' | '7D' | '1M' | '1Y';

export function PriceChart() {
  const [selectedTimeFrame, setSelectedTimeFrame] = useState<TimeFrame>('1D');

  const { data: chartData, isLoading } = useQuery({
    queryKey: ['/api/portfolio/chart', selectedTimeFrame],
  });

  const timeFrames: TimeFrame[] = ['1D', '7D', '1M', '1Y'];

  return (
    <Card className="crypto-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-white">Portfolio Performance</CardTitle>
          <div className="flex space-x-2">
            {timeFrames.map((timeFrame) => (
              <Button
                key={timeFrame}
                variant={selectedTimeFrame === timeFrame ? "default" : "ghost"}
                size="sm"
                onClick={() => setSelectedTimeFrame(timeFrame)}
                className={
                  selectedTimeFrame === timeFrame
                    ? "bg-primary text-primary-foreground"
                    : "text-gray-400 hover:text-white"
                }
              >
                {timeFrame}
              </Button>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <i className="fas fa-spinner fa-spin text-4xl text-purple-500 mb-2"></i>
                <p className="text-gray-400">Loading chart data...</p>
              </div>
            </div>
          ) : chartData && chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis 
                  dataKey="timestamp" 
                  stroke="#9CA3AF"
                  fontSize={12}
                />
                <YAxis 
                  stroke="#9CA3AF"
                  fontSize={12}
                  tickFormatter={(value) => `$${value.toLocaleString()}`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#374151',
                    border: '1px solid #4B5563',
                    borderRadius: '8px',
                    color: '#F3F4F6'
                  }}
                  formatter={(value: any) => [`$${value.toLocaleString()}`, 'Portfolio Value']}
                />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="url(#cryptoGradient)"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4, fill: '#7C3AED' }}
                />
                <defs>
                  <linearGradient id="cryptoGradient" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#7C3AED" />
                    <stop offset="100%" stopColor="#06B6D4" />
                  </linearGradient>
                </defs>
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <i className="fas fa-chart-area text-4xl text-purple-500 mb-2"></i>
                <p className="text-gray-400">No chart data available</p>
                <p className="text-sm text-gray-500">Connect your wallet to view portfolio performance</p>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
