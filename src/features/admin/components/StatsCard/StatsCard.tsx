/**
 * 통계 카드 컴포넌트
 */

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: string;
  description?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger';
}

/**
 * 통계 카드 컴포넌트
 */
export function StatsCard({
  title,
  value,
  icon,
  description,
  trend,
  variant = 'default',
}: StatsCardProps) {
  const variantStyles = {
    default: 'bg-white',
    primary: 'bg-blue-50 border-blue-200',
    success: 'bg-green-50 border-green-200',
    warning: 'bg-yellow-50 border-yellow-200',
    danger: 'bg-red-50 border-red-200',
  };

  return (
    <div
      className={`rounded-lg border p-4 sm:p-6 ${variantStyles[variant]}`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="mt-2 text-2xl sm:text-3xl font-bold text-gray-900">
            {typeof value === 'number' ? value.toLocaleString() : value}
          </p>
          {description && (
            <p className="mt-1 text-sm text-gray-500">{description}</p>
          )}
          {trend && (
            <div className="mt-2 flex items-center gap-1">
              <span
                className={`text-sm font-medium ${
                  trend.isPositive ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
              </span>
              <span className="text-sm text-gray-500">전월 대비</span>
            </div>
          )}
        </div>
        <div className="flex-shrink-0 text-3xl">{icon}</div>
      </div>
    </div>
  );
}

export default StatsCard;
