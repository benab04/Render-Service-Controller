interface MetricCardProps {
    title: string;
    value: string | number;
    icon?: React.ReactNode;
}

export function MetricCard({ title, value, icon }: MetricCardProps) {
    const getCardGradient = (title: string) => {
        switch (title) {
            case 'Service Status':
                return 'from-emerald-500/10 to-green-500/10 border-emerald-500/20 hover:border-emerald-500/30';
            case 'Total Hours':
                return 'from-blue-500/10 to-cyan-500/10 border-blue-500/20 hover:border-blue-500/30';
            case 'Estimated Cost':
                return 'from-purple-500/10 to-pink-500/10 border-purple-500/20 hover:border-purple-500/30';
            default:
                return 'from-slate-500/10 to-slate-400/10 border-slate-500/20 hover:border-slate-500/30';
        }
    };

    const getIconColor = (title: string) => {
        switch (title) {
            case 'Service Status':
                return 'text-emerald-400';
            case 'Total Hours':
                return 'text-blue-400';
            case 'Estimated Cost':
                return 'text-purple-400';
            default:
                return 'text-slate-400';
        }
    };

    const getValueColor = (title: string, value: string | number) => {
        if (title === 'Service Status') {
            return value === 'Running' ? 'text-emerald-400' : value === 'Suspended' ? 'text-amber-400' : 'text-slate-400';
        }
        return 'text-white';
    };

    return (
        <div className={`group relative overflow-hidden rounded-xl sm:rounded-2xl bg-gradient-to-br ${getCardGradient(title)} backdrop-blur-sm border transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl shadow-lg`}>
            {/* Background gradient overlay */}
            <div className="absolute inset-0 bg-slate-800/50 backdrop-blur-sm"></div>

            {/* Content */}
            <div className="relative p-4 sm:p-6">
                <div className="flex items-center space-x-3 sm:space-x-4">
                    {icon && (
                        <div className={`flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-slate-700/50 flex items-center justify-center ${getIconColor(title)} group-hover:scale-110 transition-transform duration-300`}>
                            {icon}
                        </div>
                    )}
                    <div className="flex-1 min-w-0">
                        <h3 className="text-xs sm:text-sm font-medium text-slate-400 mb-1 tracking-wide uppercase truncate">
                            {title}
                        </h3>
                        <p className={`text-xl sm:text-2xl font-bold ${getValueColor(title, value)} transition-colors duration-300 break-words`}>
                            {value}
                        </p>
                    </div>
                </div>

                {/* Decorative corner element */}
                <div className="absolute top-0 right-0 w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-white/5 to-transparent rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                {/* Bottom accent line */}
                <div className={`absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r ${getCardGradient(title).split(' ')[0]} opacity-50`}></div>
            </div>
        </div>
    );
}