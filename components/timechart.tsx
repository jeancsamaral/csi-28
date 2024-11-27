"use client"

import React, { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import { ApexOptions } from 'apexcharts'
import { useTheme } from "next-themes"

interface TimeChartProps {
  symbol: string
  interval?: string // 1d, 5d, 1mo, 3mo, 6mo, 1y, 2y, 5y, max
  range?: string // 1d, 5d, 1mo, 3mo, 6mo, 1y, 2y, 5y, max
}

interface HistoricalData {
  timestamp: number
  value: number
}

const ReactApexChart = dynamic(() => import('react-apexcharts'), {
  ssr: false,
})

const TimeChart: React.FC<TimeChartProps> = ({ 
  symbol,
  interval = '1d',
  range = '3mo'
}) => {
  const { theme } = useTheme()
  const [data, setData] = useState<[number, number][]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchHistoricalData = async () => {
      try {
        setLoading(true)
        setError(null)
        
        const response = await fetch(`/api/yahoo/historical?symbol=${symbol}&interval=${interval}&range=${range}`)
        
        if (!response.ok) {
          throw new Error('Failed to fetch historical data')
        }

        const historicalData = await response.json()
        
        // Transform data into format expected by ApexCharts [timestamp, value]
        const formattedData = historicalData.map((item: HistoricalData) => [
          item.timestamp,
          item.value
        ])

        setData(formattedData)
      } catch (err) {
        console.error('Error fetching historical data:', err)
        setError(err instanceof Error ? err.message : 'Failed to fetch data')
      } finally {
        setLoading(false)
      }
    }

    fetchHistoricalData()
  }, [symbol, interval, range])

  const chartOptions: ApexOptions = {
    chart: {
      type: 'line',
      height: 350,
      background: 'transparent',
      theme: {
        mode: theme === 'dark' ? 'dark' : 'light'
      },
      zoom: {
        enabled: true,
        type: 'x',
      },
      toolbar: {
        show: true,
        tools: {
          download: true,
          selection: true,
          zoom: true,
          zoomin: true,
          zoomout: true,
          pan: true,
          reset: true
        }
      },
      animations: {
        enabled: true
      }
    },
    stroke: {
      curve: 'smooth',
      width: 2,
      colors: ['hsl(var(--primary))']
    },
    fill: {
      type: 'gradient',
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.45,
        opacityTo: 0.05,
        stops: [0, 100],
        colorStops: [
          {
            offset: 0,
            color: 'hsl(var(--primary))',
            opacity: 0.4
          },
          {
            offset: 100,
            color: 'hsl(var(--primary))',
            opacity: 0.1
          }
        ]
      }
    },
    grid: {
      show: true,
      borderColor: theme === 'dark' ? 'hsl(var(--muted))' : '#f1f1f1',
      strokeDashArray: 0,
      position: 'back',
      xaxis: {
        lines: {
          show: false
        }
      },
      yaxis: {
        lines: {
          show: true
        }
      }
    },
    dataLabels: {
      enabled: false
    },
    markers: {
      size: 0,
      hover: {
        size: 3
      }
    },
    title: {
      text: `${symbol} Price History`,
      align: 'left',
      style: {
        fontSize: '16px',
        fontWeight: 'bold',
        color: theme === 'dark' ? 'hsl(var(--foreground))' : '#1a1a1a'
      }
    },
    yaxis: {
      labels: {
        formatter: function (val: number) {
          return `$ ${val.toFixed(2)}`;
        },
        style: {
          colors: theme === 'dark' ? 'hsl(var(--muted-foreground))' : '#666'
        }
      },
      tickAmount: 6,
      min: function(min) { return min * 0.995 },
      max: function(max) { return max * 1.005 }
    },
    xaxis: {
      type: 'datetime',
      labels: {
        style: {
          colors: theme === 'dark' ? 'hsl(var(--muted-foreground))' : '#666',
          fontSize: '12px'
        },
        datetimeFormatter: {
          year: 'yyyy',
          month: 'MMM',
          day: 'dd',
          hour: 'HH:mm'
        }
      },
      axisBorder: {
        show: false
      },
      axisTicks: {
        show: false
      }
    },
    tooltip: {
      shared: false,
      theme: theme === 'dark' ? 'dark' : 'light',
      x: {
        format: 'dd MMM yyyy HH:mm'
      },
      y: {
        formatter: function (val: number) {
          return `$ ${val.toFixed(2)}`
        }
      },
      style: {
        fontSize: '12px'
      }
    }
  }

  const chartSeries = [{
    name: 'Price',
    data: data
  }]

  if (loading) {
    return <div className="h-[350px] flex items-center justify-center">Loading...</div>
  }

  if (error) {
    return <div className="h-[350px] flex items-center justify-center text-red-500">{error}</div>
  }

  return (
    <div className="h-[350px] m-6">
      {typeof window !== 'undefined' && data.length > 0 && (
        <ReactApexChart
          options={chartOptions}
          series={chartSeries}
          type="area"
          height="100%"
          key="price-chart"
        />
      )}
    </div>
  )
}

export default TimeChart
