'use client'

import { useLanguage } from '@/contexts/LanguageContext'

const translations = {
  noData: { en: 'No data available', fr: 'Aucune donnée', ht: 'Pa gen done', es: 'Sin datos' },
}

interface DataPoint {
  date: string
  revenue: number
  orders: number
}

interface RevenueChartProps {
  data: DataPoint[]
  className?: string
}

export default function RevenueChart({ data, className = '' }: RevenueChartProps) {
  const { t } = useLanguage()

  if (!data || data.length === 0) {
    return (
      <div className={`flex items-center justify-center h-64 text-gray-500 ${className}`}>
        {t('noData', translations.noData)}
      </div>
    )
  }

  const maxRevenue = Math.max(...data.map(d => d.revenue), 1)
  const chartHeight = 200
  const chartWidth = 100 // percentage
  const barWidth = Math.min(30, (chartWidth / data.length) - 2)
  const barGap = (chartWidth - barWidth * data.length) / (data.length + 1)

  // Calculate Y-axis labels
  const yAxisSteps = 5
  const yAxisLabels = Array.from({ length: yAxisSteps + 1 }, (_, i) =>
    Math.round((maxRevenue / yAxisSteps) * (yAxisSteps - i))
  )

  return (
    <div className={`${className}`}>
      <div className="flex">
        {/* Y-axis labels */}
        <div className="flex flex-col justify-between text-xs text-gray-500 pr-2" style={{ height: chartHeight }}>
          {yAxisLabels.map((label, i) => (
            <span key={i} className="text-right min-w-[50px]">${label.toLocaleString()}</span>
          ))}
        </div>

        {/* Chart area */}
        <div className="flex-1 relative">
          {/* Grid lines */}
          <div className="absolute inset-0">
            {yAxisLabels.map((_, i) => (
              <div
                key={i}
                className="absolute w-full border-t border-gray-100"
                style={{ top: `${(i / yAxisSteps) * 100}%` }}
              />
            ))}
          </div>

          {/* Bars */}
          <svg width="100%" height={chartHeight} className="relative z-10">
            {data.map((point, i) => {
              const barHeight = (point.revenue / maxRevenue) * chartHeight
              const x = barGap + (i * (barWidth + barGap))

              return (
                <g key={point.date}>
                  {/* Bar */}
                  <rect
                    x={`${x}%`}
                    y={chartHeight - barHeight}
                    width={`${barWidth}%`}
                    height={barHeight}
                    rx="4"
                    className="fill-primary-500 hover:fill-primary-600 transition-colors cursor-pointer"
                  />
                  {/* Tooltip area */}
                  <title>
                    {new Date(point.date).toLocaleDateString()}: ${point.revenue.toFixed(2)} ({point.orders} orders)
                  </title>
                </g>
              )
            })}
          </svg>
        </div>
      </div>

      {/* X-axis labels */}
      <div className="flex mt-2 ml-14">
        <div className="flex-1 flex justify-between">
          {data.length <= 14 ? (
            data.map((point, i) => (
              <span key={i} className="text-xs text-gray-500 text-center" style={{ width: `${barWidth}%` }}>
                {new Date(point.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </span>
            ))
          ) : (
            // For longer periods, show fewer labels
            <>
              <span className="text-xs text-gray-500">
                {new Date(data[0].date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </span>
              <span className="text-xs text-gray-500">
                {new Date(data[Math.floor(data.length / 2)].date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </span>
              <span className="text-xs text-gray-500">
                {new Date(data[data.length - 1].date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </span>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
