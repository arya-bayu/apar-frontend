'use client';

import currencyFormatter from "@/lib/currency";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    Brush,
} from 'recharts';

export interface IRevenueData {
    date: string;
    month: string;
    year: string;
    revenue: number;
}

interface RevenueChartProps {
    data: IRevenueData[];
    period: 'daily' | 'monthly' | 'yearly';
}


const RevenueChart = ({ data, period }: RevenueChartProps) => {
    return (
        <ResponsiveContainer width="100%" height="100%" className="text-sm">
            <LineChart
                width={500}
                height={300}
                data={data}
                margin={{
                    left: 30,
                    right: 30,
                }}
            >
                <CartesianGrid strokeDasharray="3 3" stroke="#666" />
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey={period === "daily" ? "date" : period === "monthly" ? "month" : "year"} />
                <YAxis />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Line name="Pendapatan" type="monotone" dataKey="revenue" stroke="#EF4444" />
                <Brush />
            </LineChart>
        </ResponsiveContainer>
    );
};

export default RevenueChart;

interface TooltipProps {
    active?: boolean;
    payload?: any;
    label?: string;
}

const CustomTooltip = ({ active, payload, label }: TooltipProps) => {
    if (!active && !payload && !label) return null;

    return (

        <div className="p-4 bg-zinc-50 px-4 py-4 shadow-md dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-700 flex-col gap-4 rounded-md">
            <p className="text-medium text-lg">
                {payload?.[0]?.payload.date && payload?.[0]?.payload.date + ' '}
                {payload?.[0]?.payload.month && payload?.[0]?.payload.month + ' '}
                {payload?.[0]?.payload.year}
            </p>
            <p className="text-sm text-blue-400">
                Pendapatan:
                <span className="ml-2">{currencyFormatter(payload?.[0]?.value)}</span>
            </p>
        </div>
    )
}


