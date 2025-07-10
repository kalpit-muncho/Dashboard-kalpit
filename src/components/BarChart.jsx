import React, { useRef, useEffect } from 'react';
import { Chart, registerables } from 'chart.js';

// Register all Chart.js components
Chart.register(...registerables);

// Helper to parse 'YYYY-MM-DD' strings into Date objects as local dates
const parseDateString = (dateStr_YYYY_MM_DD) => {
  if (!dateStr_YYYY_MM_DD || typeof dateStr_YYYY_MM_DD !== 'string') return null;
  const parts = dateStr_YYYY_MM_DD.split('-');
  if (parts.length === 3) {
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1; // Month is 0-indexed
    const day = parseInt(parts[2], 10);
    if (!isNaN(year) && !isNaN(month) && !isNaN(day)) {
      return new Date(year, month, day);
    }
  }
  return null; // Invalid date string
};

const BarChart = ({ data }) => {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  const formatDateForTooltip = (dateString_YYYY_MM_DD) => {
    const date = parseDateString(dateString_YYYY_MM_DD);
    if (date) {
      return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
    }
    return dateString_YYYY_MM_DD; // Fallback
  };

  useEffect(() => {
    if (chartRef.current && data) {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }

      const ctx = chartRef.current.getContext('2d');

      let latestDateInPeriodString = "";
      if (data.length > 0) {
        const lastItemDate = parseDateString(data[data.length - 1].date);
        if (lastItemDate) {
          latestDateInPeriodString = lastItemDate.toDateString();
        }
      }

      chartInstance.current = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: data.map(item => item.day),
          datasets: [
            {
              data: data.map(item => item.reviews),
              backgroundColor: (context) => {
                if (!data[context.dataIndex]) return '#E2E8F0';
                const itemDate = parseDateString(data[context.dataIndex].date);
                if (itemDate) {
                  return itemDate.toDateString() === latestDateInPeriodString ? '#6366F1' : '#E2E8F0';
                }
                return '#E2E8F0';
              },
              borderRadius: 8,
              borderSkipped: false,
              barThickness: "flex",
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: false,
            },
            tooltip: {
              enabled: true,
              backgroundColor: '#F8F7FA',
              titleColor: '#5C5C7A',
              bodyColor: '#000000',
              titleFont: {
                size: 14,
                weight: 'normal',
              },
              bodyFont: {
                size: 12,
              },
              padding: 10,
              cornerRadius: 10,
              callbacks: {
                title: (tooltipItems) => {
                  const index = tooltipItems[0].dataIndex;
                  if (data[index] && data[index].date) {
                    return formatDateForTooltip(data[index].date);
                  }
                  return '';
                },
                label: (tooltipItem) => {
                  return `${tooltipItem.formattedValue} reviews`;
                },
              },
            },
          },
          scales: {
            x: {
              display: false,
              grid: {
                display: false,
              },
            },
            y: {
              display: false,
              beginAtZero: true,
            },
          },
          barPercentage: 0.9,
          categoryPercentage: 0.9,
        },
      });
    }

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [data]);

  return (
    <div 
      className="w-full border-gray-200 pb-2" 
      style={{ 
        height: '100%',
        minWidth: `${Math.max(400, (data ? data.length : 0) * 30)}px`
      }}
    >
      <div className="w-full h-full">
        <canvas ref={chartRef} />
      </div>
    </div>
  );
};

export default BarChart;
