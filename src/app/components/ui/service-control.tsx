'use client';

import { useState } from 'react';
import { PlayIcon, PauseIcon, CheckCircleIcon, ExclamationTriangleIcon } from '@heroicons/react/24/solid';

interface ServiceControlProps {
    status: string;
    onSuspend: () => Promise<void>;
    onResume: () => Promise<void>;
}

export function ServiceControl({ status, onSuspend, onResume }: ServiceControlProps) {
    const [isLoading, setIsLoading] = useState(false);

    const handleAction = async (action: 'suspend' | 'resume') => {
        setIsLoading(true);
        try {
            if (action === 'suspend') {
                await onSuspend();
            } else {
                await onResume();
            }
        } catch (error) {
            console.error('Failed to control service:', error);
        }
        setIsLoading(false);
    };

    const getStatusConfig = (status: string) => {
        switch (status) {
            case 'Live':
                return {
                    color: 'text-emerald-400',
                    bgColor: 'bg-emerald-500/10',
                    icon: CheckCircleIcon,
                    borderColor: 'border-emerald-500/20'
                };
            case 'Suspended':
                return {
                    color: 'text-amber-400',
                    bgColor: 'bg-amber-500/10',
                    icon: ExclamationTriangleIcon,
                    borderColor: 'border-amber-500/20'
                };
            default:
                return {
                    color: 'text-slate-400',
                    bgColor: 'bg-slate-500/10',
                    icon: CheckCircleIcon,
                    borderColor: 'border-slate-500/20'
                };
        }
    };

    const statusConfig = getStatusConfig(status);
    const StatusIcon = statusConfig.icon;

    return (
        <div className="space-y-6">
            {/* Status Display */}
            <div className={`${statusConfig.bgColor} ${statusConfig.borderColor} border rounded-xl p-4 transition-all duration-200`}>
                <div className="flex items-center space-x-3">
                    <StatusIcon className={`h-5 w-5 ${statusConfig.color}`} />
                    <div>
                        <p className="text-sm font-medium text-slate-300">Current Status</p>
                        <p className={`text-lg font-semibold ${statusConfig.color}`}>
                            {status}
                        </p>
                    </div>
                </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center space-x-4">
                {status === 'Live' ? (
                    <button
                        onClick={() => handleAction('suspend')}
                        disabled={isLoading}
                        className="group relative overflow-hidden bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 disabled:from-red-800 disabled:to-red-900 px-6 py-3 rounded-xl text-sm font-medium text-white transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-slate-800 disabled:opacity-50 shadow-lg shadow-red-600/20 hover:shadow-red-600/30"
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-red-500 to-red-600 opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
                        <div className="relative flex items-center">
                            {isLoading ? (
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            ) : (
                                <PauseIcon className="mr-2 h-4 w-4" />
                            )}
                            {isLoading ? 'Suspending...' : 'Suspend Service'}
                        </div>
                    </button>
                ) : (
                    <button
                        onClick={() => handleAction('resume')}
                        disabled={isLoading}
                        className="group relative overflow-hidden bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 disabled:from-emerald-800 disabled:to-emerald-900 px-6 py-3 rounded-xl text-sm font-medium text-white transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-slate-800 disabled:opacity-50 shadow-lg shadow-emerald-600/20 hover:shadow-emerald-600/30"
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-emerald-600 opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
                        <div className="relative flex items-center">
                            {isLoading ? (
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            ) : (
                                <PlayIcon className="mr-2 h-4 w-4" />
                            )}
                            {isLoading ? 'Resuming...' : 'Resume Service'}
                        </div>
                    </button>
                )}

                {/* Status indicator dot */}
                <div className="flex items-center space-x-2">
                    <div className={`w-3 h-3 rounded-full ${status === 'Live' ? 'bg-emerald-400' : 'bg-amber-400'} ${status === 'Live' ? 'animate-pulse' : ''}`}></div>
                    <span className="text-xs text-slate-400 font-medium">
                        {status === 'Live' ? 'Active' : 'Inactive'}
                    </span>
                </div>
            </div>

            {/* Additional Info */}
            <div className="bg-slate-800/30 border border-slate-700/30 rounded-lg p-4">
                <p className="text-xs text-slate-400 leading-relaxed">
                    {status === 'Live'
                        ? 'Your service is currently running and processing requests. Use the suspend button to temporarily halt operations.'
                        : 'Your service is currently suspended. Click resume to restart operations and begin processing requests.'
                    }
                </p>
            </div>
        </div>
    );
}