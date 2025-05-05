import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { DollarSign, Calendar, Users, TrendingUp, Activity } from 'lucide-react';
import { format, subDays, startOfMonth, endOfMonth, startOfYear, endOfYear } from 'date-fns';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { formatCurrency } from '@/lib/utils';

// Custom types for analytics data
interface SummaryMetrics {
  totalAppointments: number;
  completedAppointments: number;
  canceledAppointments: number;
  totalRevenue: number;
  averageRevenue: number;
}

interface TimeframeData {
  label: string;
  appointments: number;
  revenue: number;
}

interface ProviderPerformance {
  provider: string;
  appointments: number;
  revenue: number;
  cancellationRate: number;
}

interface MarketingChannelData {
  channel: string;
  appointments: number;
  revenue: number;
  percentage: number;
}

// Main Analytics component
export default function Analytics() {
  const [timeframe, setTimeframe] = useState<'week' | 'month' | 'year'>('month');
  
  // Function to get date range based on selected timeframe
  const getDateRange = () => {
    const now = new Date();
    
    switch(timeframe) {
      case 'week':
        return {
          start: subDays(now, 7),
          end: now
        };
      case 'month':
        return {
          start: startOfMonth(now),
          end: endOfMonth(now)
        };
      case 'year':
        return {
          start: startOfYear(now),
          end: endOfYear(now)
        };
    }
  };
  
  // Query to fetch analytics data
  const { data, isLoading, error } = useQuery({
    queryKey: ['/api/analytics', timeframe],
    queryFn: async () => {
      const range = getDateRange();
      const response = await fetch(
        `/api/analytics?timeframe=${timeframe}&start=${format(range.start, 'yyyy-MM-dd')}&end=${format(range.end, 'yyyy-MM-dd')}`
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch analytics data');
      }
      
      return response.json();
    }
  });
  
  // Sample data for development - will be replaced with actual API data
  // This is only for UI development and will be removed once API is implemented
  const sampleData = {
    summary: {
      totalAppointments: 42,
      completedAppointments: 35,
      canceledAppointments: 7,
      totalRevenue: 12600.00,
      averageRevenue: 360.00
    },
    timeframeData: [
      { label: 'Week 1', appointments: 9, revenue: 2700 },
      { label: 'Week 2', appointments: 12, revenue: 3600 },
      { label: 'Week 3', appointments: 8, revenue: 2400 },
      { label: 'Week 4', appointments: 13, revenue: 3900 }
    ],
    providerPerformance: [
      { provider: 'Sera', appointments: 18, revenue: 5400, cancellationRate: 0.05 },
      { provider: 'Courtesan Couple', appointments: 8, revenue: 3200, cancellationRate: 0.12 },
      { provider: 'Chloe', appointments: 9, revenue: 2700, cancellationRate: 0.11 },
      { provider: 'Alexa', appointments: 7, revenue: 1300, cancellationRate: 0.28 }
    ],
    marketingChannels: [
      { channel: 'Private Delights', appointments: 16, revenue: 4800, percentage: 38.1 },
      { channel: 'Eros', appointments: 10, revenue: 3000, percentage: 23.8 },
      { channel: 'Tryst', appointments: 8, revenue: 2400, percentage: 19.0 },
      { channel: 'Referral', appointments: 5, revenue: 1500, percentage: 11.9 },
      { channel: 'Other', appointments: 3, revenue: 900, percentage: 7.2 }
    ]
  };

  // Will use actual data when API is implemented
  const analytics = data || sampleData;
  
  // Colors for charts
  const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#a4de6c', '#d0ed57'];
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="w-16 h-16 border-t-4 border-b-4 border-primary rounded-full animate-spin"></div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-red-500">Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Failed to load analytics data. Please try again later.</p>
            <Button onClick={() => window.location.reload()} className="mt-4">
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="container py-10 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold tracking-tight mb-4">Analytics Dashboard</h1>
      
      <div className="flex justify-between items-center mb-6">
        <p className="text-muted-foreground">
          View insights and metrics to understand business performance
        </p>
        <div className="flex items-center space-x-2">
          <Select
            value={timeframe}
            onValueChange={(value) => setTimeframe(value as 'week' | 'month' | 'year')}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select timeframe" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">Last 7 days</SelectItem>
              <SelectItem value="month">This month</SelectItem>
              <SelectItem value="year">This year</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      {/* Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Appointments</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.summary.totalAppointments}</div>
            <p className="text-xs text-muted-foreground">
              {`${analytics.summary.completedAppointments} completed, ${analytics.summary.canceledAppointments} canceled`}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(analytics.summary.totalRevenue)}</div>
            <p className="text-xs text-muted-foreground">
              Avg. {formatCurrency(analytics.summary.averageRevenue)} per appointment
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round((analytics.summary.completedAppointments / analytics.summary.totalAppointments) * 100)}%
            </div>
            <p className="text-xs text-muted-foreground">
              {analytics.summary.completedAppointments} out of {analytics.summary.totalAppointments} appointments
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Growth</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+12.5%</div>
            <p className="text-xs text-muted-foreground">
              Compared to previous {timeframe}
            </p>
          </CardContent>
        </Card>
      </div>
      
      {/* Tabs for different analytics views */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full md:w-auto grid-cols-3 mb-8">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="providers">Providers</TabsTrigger>
          <TabsTrigger value="marketing">Marketing</TabsTrigger>
        </TabsList>
        
        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Appointment & Revenue Trends</CardTitle>
              <CardDescription>
                Track appointments and revenue over time
              </CardDescription>
            </CardHeader>
            <CardContent className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={analytics.timeframeData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="label" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip formatter={(value, name) => {
                    if (name === 'revenue') return [`$${value}`, 'Revenue'];
                    return [value, 'Appointments'];
                  }} />
                  <Legend />
                  <Line 
                    yAxisId="left"
                    type="monotone" 
                    dataKey="appointments" 
                    stroke="#8884d8" 
                    name="Appointments" 
                  />
                  <Line 
                    yAxisId="right"
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="#82ca9d" 
                    name="Revenue" 
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Providers Tab */}
        <TabsContent value="providers" className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Provider Performance</CardTitle>
              <CardDescription>
                Compare provider appointments and revenue
              </CardDescription>
            </CardHeader>
            <CardContent className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={analytics.providerPerformance}
                  margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="provider" />
                  <YAxis />
                  <Tooltip formatter={(value, name) => {
                    if (name === 'revenue') return [`$${value}`, 'Revenue'];
                    if (name === 'cancellationRate') return [`${(value as number * 100).toFixed(1)}%`, 'Cancellation Rate'];
                    return [value, 'Appointments'];
                  }} />
                  <Legend />
                  <Bar dataKey="appointments" name="Appointments" fill="#8884d8" />
                  <Bar dataKey="revenue" name="Revenue" fill="#82ca9d" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Cancellation Rates by Provider</CardTitle>
              <CardDescription>
                Compare provider cancellation rates
              </CardDescription>
            </CardHeader>
            <CardContent className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={analytics.providerPerformance}
                  margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="provider" />
                  <YAxis tickFormatter={(value) => `${(value * 100).toFixed(0)}%`} />
                  <Tooltip formatter={(value) => [`${(value as number * 100).toFixed(1)}%`, 'Cancellation Rate']} />
                  <Legend />
                  <Bar dataKey="cancellationRate" name="Cancellation Rate" fill="#ff8042" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Marketing Tab */}
        <TabsContent value="marketing" className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Marketing Channel Distribution</CardTitle>
                <CardDescription>
                  Appointments by marketing channel
                </CardDescription>
              </CardHeader>
              <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={analytics.marketingChannels}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="appointments"
                      nameKey="channel"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
                    >
                      {analytics.marketingChannels.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value, name, entry) => {
                        const data = entry.payload;
                        return [`${value} (${data.percentage.toFixed(1)}%)`, data.channel];
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Revenue by Marketing Channel</CardTitle>
                <CardDescription>
                  Revenue generated through each channel
                </CardDescription>
              </CardHeader>
              <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={analytics.marketingChannels}
                    margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="channel" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`$${value}`, 'Revenue']} />
                    <Legend />
                    <Bar dataKey="revenue" name="Revenue" fill="#82ca9d" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Marketing Channel Effectiveness</CardTitle>
              <CardDescription>
                Compare appointments and revenue by channel
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analytics.marketingChannels.map((channel, idx) => (
                  <div key={channel.channel} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">{channel.channel}</span>
                      <span className="text-sm text-muted-foreground">
                        {channel.appointments} appointments · {formatCurrency(channel.revenue)}
                      </span>
                    </div>
                    <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-primary rounded-full"
                        style={{ width: `${channel.percentage}%`, backgroundColor: COLORS[idx % COLORS.length] }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}