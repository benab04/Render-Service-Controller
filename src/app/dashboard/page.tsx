'use client';

import { useEffect, useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { redirect } from 'next/navigation';
import { MetricCard } from '../components/ui/metric-card';
import { ServiceControl } from '../components/ui/service-control';
import { ClockIcon, ServerIcon, ChartBarIcon, ArrowRightOnRectangleIcon, CurrencyRupeeIcon } from '@heroicons/react/24/outline';

interface ServiceDetails {
    suspended: string;
    // Add other fields as needed
}

interface ServiceMetrics {
    totalHours: number;
    billing: {
        totalCost: string;
        totalHours: string;
    };
    // Add other metrics as needed
}

export default function Dashboard() {
    const { data: session, status } = useSession();
    const [serviceDetails, setServiceDetails] = useState<ServiceDetails | null>(null);
    const [metrics, setMetrics] = useState<ServiceMetrics | null>(null);
    const [cost, setCost] = useState<string>('0.00');

    useEffect(() => {
        if (status === 'unauthenticated') {
            redirect('/auth/signin');
        }
    }, [status]);

    async function fetchExchangeRate(usdCost: number): Promise<string> {
        if (!usdCost) return '0.00';

        try {
            const res = await fetch(`https://api.freecurrencyapi.com/v1/latest?apikey=${process.env.NEXT_PUBLIC_CURRENCY_API_KEY}`);
            const data = await res.json();

            const rate = data?.data?.INR || 85.91; // fallback
            console.log('Exchange rate:', rate);
            const inrCost = String(Number((usdCost * rate).toFixed(2)) + 500);
            return inrCost;
        } catch (err) {
            console.error('Error fetching exchange rate:', err);
            // fallback to fixed rate
            return (usdCost * 85.91).toFixed(2);
        }
    }

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [detailsResponse, metricsResponse] = await Promise.all([
                    fetch('/api/service/details'),
                    fetch('/api/service/metrics'),
                ]);

                const details = await detailsResponse.json();
                const metricsData = await metricsResponse.json();

                setServiceDetails(details);
                setMetrics(metricsData);

                // Fix: Properly handle the cost calculation
                const usdCost = Number(metricsData.billing.totalCost);
                const inrCost = await fetchExchangeRate(usdCost);
                setCost(inrCost || '0.00');
            } catch (error) {
                console.error('Failed to fetch data:', error);
                setCost('0.00'); // Set fallback value on error
            }
        };

        fetchData();
        const interval = setInterval(fetchData, 60000); // Refresh every minute
        return () => clearInterval(interval);
    }, []);

    const handleSuspend = async () => {
        try {
            await fetch('/api/service/suspend', { method: 'POST' });
            // Refresh data after action
            const response = await fetch('/api/service/details');
            const details = await response.json();
            setServiceDetails(details);
        } catch (error) {
            console.error('Failed to suspend service:', error);
        }
    };

    const handleResume = async () => {
        try {
            await fetch('/api/service/resume', { method: 'POST' });
            // Refresh data after action
            const response = await fetch('/api/service/details');
            const details = await response.json();
            setServiceDetails(details);
        } catch (error) {
            console.error('Failed to resume service:', error);
        }
    };

    const handleSignOut = async () => {
        try {
            await signOut({ redirect: false });
            redirect('/auth/signin');
        } catch (error) {
            console.error('Failed to sign out:', error);
        }
    };

    if (status === 'loading') {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto mb-4"></div>
                    <p className="text-slate-300 text-lg">Loading dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-3 sm:p-4 md:p-6">
            {/* Background decorative elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-48 h-48 sm:w-64 sm:h-64 md:w-96 md:h-96 bg-blue-500/5 rounded-full blur-3xl"></div>
                <div className="absolute bottom-1/4 right-1/4 w-48 h-48 sm:w-64 sm:h-64 md:w-96 md:h-96 bg-purple-500/5 rounded-full blur-3xl"></div>
            </div>

            <div className="max-w-7xl mx-auto relative z-10">
                {/* Header with Sign Out Button */}
                <div className="mb-6 sm:mb-8">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0 mb-3 sm:mb-2">
                        <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-3">
                            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                                <ChartBarIcon className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                            </div>
                            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
                                Instance Settings
                            </h1>
                        </div>

                        {/* Sign Out Button */}
                        <button
                            onClick={handleSignOut}
                            className="group flex items-center space-x-2 px-4 py-2 bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl hover:bg-slate-700/50 transition-all duration-200 text-slate-300 hover:text-white shadow-lg"
                        >
                            <ArrowRightOnRectangleIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                            <span className="text-sm sm:text-base font-medium">Sign Out</span>
                        </button>
                    </div>
                    <p className="text-slate-400 text-sm sm:text-base lg:text-lg ml-0 sm:ml-13">GameOfTrades Control Panel</p>
                </div>

                {/* Metrics Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
                    <MetricCard
                        title="Service Status"
                        value={serviceDetails?.suspended ? (serviceDetails?.suspended === 'not_suspended' ? 'Running' : 'Suspended') : 'Loading...'}
                        icon={<ServerIcon className="h-5 w-5 sm:h-6 sm:w-6" />}
                    />
                    <MetricCard
                        title="Total Hours"
                        value={metrics?.billing.totalHours || '0'}
                        icon={<ClockIcon className="h-5 w-5 sm:h-6 sm:w-6" />}
                    />
                    <MetricCard
                        title="Estimated Cost"
                        value={`₹${cost}`}
                        icon={<CurrencyRupeeIcon className="h-5 w-5 sm:h-6 sm:w-6" />}
                    />
                </div>

                {/* Service Control Panel */}
                <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8 shadow-2xl">
                    <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-3 mb-4 sm:mb-6">
                        <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg flex items-center justify-center flex-shrink-0">
                            <ServerIcon className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                        </div>
                        <h2 className="text-lg sm:text-xl lg:text-2xl font-semibold text-white">Service Control</h2>
                    </div>

                    <div className="bg-slate-900/50 rounded-lg sm:rounded-xl p-4 sm:p-6 border border-slate-700/30">
                        <ServiceControl
                            status={serviceDetails?.suspended ? (serviceDetails?.suspended === 'not_suspended' ? 'Live' : 'Suspended') : 'loading'}
                            onSuspend={handleSuspend}
                            onResume={handleResume}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}