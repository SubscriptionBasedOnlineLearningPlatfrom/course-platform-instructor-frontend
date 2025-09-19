import { Card } from "../dashboard1/ui/card.jsx";

export const MetricCard = ({ 
  title, 
  value, 
  icon: Icon, 
  trend,
  gradient = 'blue' 
}) => {
  const gradientClasses = {
    blue: 'from-blue-500 to-indigo-500',
    green: 'from-emerald-500 to-teal-500',
    orange: 'from-orange-400 to-pink-500',
    purple: 'from-purple-500 to-fuchsia-500'
  };

  return (
    <Card className="relative p-6 overflow-hidden rounded-2xl backdrop-blur-md bg-white/70 dark:bg-gray-900/70 shadow-md hover:shadow-xl transition duration-300">
      {/* Glow background */}
      <div className={`absolute -top-10 -right-10 w-32 h-32 rounded-full bg-gradient-to-r ${gradientClasses[gradient]} opacity-20 blur-3xl`} />
      
      <div className="flex items-start justify-between relative z-10">
        {/* Text content */}
        <div className="space-y-3">
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
          <div className="space-y-2">
            <p className="text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight">{value}</p>

            {trend && (
              <span 
                className={`inline-flex items-center text-xs font-semibold px-2 py-1 rounded-full shadow-sm
                  ${trend.isPositive 
                    ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" 
                    : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"}`}
              >
                {trend.isPositive ? "▲" : "▼"} {trend.value}% 
                <span className="ml-1 text-gray-500 dark:text-gray-400">vs last month</span>
              </span>
            )}
          </div>
        </div>

        {/* Icon container */}
        <div className={`p-4 rounded-2xl bg-gradient-to-r ${gradientClasses[gradient]} shadow-lg transform transition duration-300 hover:scale-110 hover:rotate-3`}>
          <Icon className="h-7 w-7 text-white" />
        </div>
      </div>
    </Card>
  );
};
