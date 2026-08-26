import React, { useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';

const chartFontFamily = '"Segoe UI", "Arial", sans-serif';

const shortenCabangLabel = (label = '') => {
    if (!label) return '';

    const normalized = label.replace(/[-–—]/g, ' ').trim();
    const words = normalized.split(/\s+/).filter(Boolean);

    if (words.length <= 2) {
        return normalized;
    }

    const lastWord = words[words.length - 1];
    const secondLastWord = words[words.length - 2];

    const cityWords = ['Bandung', 'Jakarta', 'Surabaya', 'Bogor', 'Semarang', 'Medan', 'Yogyakarta', 'Bekasi', 'Depok', 'Malang', 'Solo'];
    const directions = ['Pusat', 'Selatan', 'Utara', 'Barat', 'Timur', 'Tengah'];

    if (cityWords.includes(lastWord)) {
        return lastWord;
    }

    if (directions.includes(lastWord) && cityWords.includes(secondLastWord)) {
        return `${secondLastWord} ${lastWord}`;
    }

    return lastWord;
};

export const LineChart = ({ label, labels, data, title }) => {
    const canvasRef = useRef(null);
    const chartRef = useRef(null);

    useEffect(() => {
        if (canvasRef.current && labels.length > 0 && data.length > 0) {
            if (chartRef.current) {
                chartRef.current.destroy();
            }

            const ctx = canvasRef.current.getContext('2d');
            chartRef.current = new Chart(ctx, {
                type: 'line',
                data: {
                    labels,
                    datasets: [
                        {
                            label,
                            data,
                            borderColor: '#3b82f6',
                            backgroundColor: 'rgba(59, 130, 246, 0.12)',
                            borderWidth: 3,
                            pointRadius: 4,
                            pointHoverRadius: 5,
                            pointBackgroundColor: '#3b82f6',
                            pointBorderColor: '#3b82f6',
                            pointBorderWidth: 2,
                            cubicInterpolationMode: 'monotone',
                            tension: 0.25,
                            fill: true,
                        },
                    ],
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    animation: {
                        duration: 0,
                    },
                    layout: {
                        padding: {
                            top: 10,
                            right: 10,
                            bottom: 0,
                            left: 6,
                        },
                    },
                    interaction: {
                        intersect: false,
                        mode: 'index',
                    },
                    plugins: {
                        legend: {
                            display: false,
                        },
                        title: {
                            display: false,
                            text: title,
                        },
                        tooltip: {
                            enabled: false,
                        },
                    },
                    scales: {
                        x: {
                            grid: {
                                display: false,
                                drawBorder: false,
                            },
                            border: {
                                display: false,
                            },
                            ticks: {
                                color: '#64748b',
                                font: {
                                    family: chartFontFamily,
                                    size: 12,
                                    weight: '500',
                                },
                            },
                        },
                        y: {
                            beginAtZero: true,
                            border: {
                                display: false,
                            },
                            grid: {
                                color: 'rgba(148, 163, 184, 0.25)',
                                drawBorder: false,
                                tickLength: 0,
                                borderDash: [4, 4],
                            },
                            ticks: {
                                color: '#64748b',
                                font: {
                                    family: chartFontFamily,
                                    size: 12,
                                    weight: '500',
                                },
                                precision: 0,
                                callback: (value) => Number(value).toFixed(0),
                            },
                        },
                    },
                },
            });
        }

        return () => {
            if (chartRef.current) {
                chartRef.current.destroy();
            }
        };
    }, [labels, data, label, title]);

    return (
        <div style={{ position: 'relative', width: '100%', height: '320px' }}>
            <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%' }}></canvas>
        </div>
    );
};

export const BarChart = ({ label, labels, data, title, orientation = 'vertical', shortenLabels = true }) => {
    const canvasRef = useRef(null);
    const chartRef = useRef(null);
    const isHorizontal = orientation === 'horizontal';

    useEffect(() => {
        if (canvasRef.current && labels.length > 0 && data.length > 0) {
            if (chartRef.current) {
                chartRef.current.destroy();
            }

            const ctx = canvasRef.current.getContext('2d');
            chartRef.current = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels,
                    datasets: [
                        {
                            label,
                            data,
                            backgroundColor: 'rgba(59, 130, 246, 0.92)',
                            borderColor: 'rgba(37, 99, 235, 1)',
                            borderWidth: 0,
                            borderRadius: 0,
                            borderSkipped: false,
                            maxBarThickness: 48,
                        },
                    ],
                },
                options: {
                    indexAxis: isHorizontal ? 'y' : 'x',
                    responsive: true,
                    maintainAspectRatio: false,
                    animation: {
                        duration: 0,
                    },
                    layout: {
                        padding: {
                            top: 8,
                            right: 12,
                            bottom: 8,
                            left: 8,
                        },
                    },
                    plugins: {
                        legend: {
                            display: false,
                        },
                        tooltip: {
                            enabled: false,
                        },
                        title: {
                            display: false,
                            text: title,
                        },
                    },
                    scales: {
                        x: {
                            grid: {
                                display: false,
                                drawBorder: false,
                            },
                            border: {
                                display: false,
                            },
                            ticks: {
                                color: '#64748b',
                                font: {
                                    family: chartFontFamily,
                                    size: 14,
                                    weight: '500',
                                },
                                maxRotation: 0,
                                minRotation: 0,
                                autoSkip: false,
                                maxTicksLimit: labels.length,
                                callback: isHorizontal
                                    ? (value) => Number(value).toFixed(0)
                                    : (value, index) => shortenLabels ? shortenCabangLabel(labels[index]) : labels[index],
                            },
                        },
                        y: {
                            beginAtZero: !isHorizontal,
                            border: {
                                display: false,
                            },
                            grid: {
                                color: 'rgba(148, 163, 184, 0.25)',
                                drawBorder: false,
                                tickLength: 0,
                                borderDash: [4, 4],
                            },
                            ticks: {
                                color: '#64748b',
                                font: {
                                    family: chartFontFamily,
                                    size: 14,
                                    weight: '500',
                                },
                                precision: isHorizontal ? undefined : 0,
                                callback: isHorizontal
                                    ? (value, index) => shortenLabels ? shortenCabangLabel(labels[index]) : labels[index]
                                    : (value) => Number(value).toFixed(0),
                            },
                        },
                    },
                },
            });
        }

        return () => {
            if (chartRef.current) {
                chartRef.current.destroy();
            }
        };
    }, [labels, data, label, title, isHorizontal, shortenLabels]);

    return (
        <div style={{ position: 'relative', width: '100%', height: '320px' }}>
            <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%' }}></canvas>
        </div>
    );
};

export const PieChart = ({ labels, data, title }) => {
    const canvasRef = useRef(null);
    const chartRef = useRef(null);

    useEffect(() => {
        if (canvasRef.current && labels.length > 0 && data.length > 0) {
            if (chartRef.current) {
                chartRef.current.destroy();
            }

            const ctx = canvasRef.current.getContext('2d');
            chartRef.current = new Chart(ctx, {
                type: 'doughnut',
                data: {
                    labels,
                    datasets: [
                        {
                            data,
                            backgroundColor: [
                                '#2f9ed8',
                                '#4ec3b7',
                                '#7ae1d0',
                                '#2a7ae2',
                            ],
                            borderColor: '#f8fafc',
                            borderWidth: 1,
                            hoverOffset: 0,
                            spacing: 0,
                            weight: 1,
                        },
                    ],
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    cutout: '72%',
                    layout: {
                        padding: {
                            top: 16,
                            right: 8,
                            bottom: 8,
                            left: 8,
                        },
                    },
                    animation: {
                        duration: 0,
                    },
                    plugins: {
                        legend: {
                            display: true,
                            position: 'bottom',
                            align: 'center',
                            labels: {
                                usePointStyle: true,
                                pointStyle: 'circle',
                                boxWidth: 10,
                                boxHeight: 10,
                                padding: 18,
                                color: '#4b5563',
                                font: {
                                    family: chartFontFamily,
                                    size: 12,
                                    weight: '600',
                                },
                            },
                        },
                        tooltip: {
                            enabled: true,
                        },
                        title: {
                            display: false,
                            text: title,
                        },
                    },
                },
            });
        }

        return () => {
            if (chartRef.current) {
                chartRef.current.destroy();
            }
        };
    }, [labels, data, title]);

    return (
        <div style={{ position: 'relative', width: '100%', height: '320px' }}>
            <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%' }}></canvas>
        </div>
    );
};

export const ProgressBarList = ({ items, colors = ['#2f9ed8', '#f3c64a', '#4ec3b7', '#4a90e2', '#2cc6a0'] }) => {
    const maxValue = Math.max(...items.map((item) => Number(item.value) || 0), 1);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
            {items.map((item, index) => {
                const value = Number(item.value) || 0;
                const width = Math.max((value / maxValue) * 100, 0);
                const color = item.color || colors[index % colors.length];

                return (
                    <div key={item.label || `${index}`} style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.75rem', marginBottom: '0.1rem' }}>
                            <div style={{ fontFamily: 'Montserrat, "Segoe UI", sans-serif', fontSize: '1rem', fontWeight: 600, color: '#1f2937', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {item.label}
                            </div>
                            <div style={{ fontFamily: 'Montserrat, "Segoe UI", sans-serif', fontSize: '1rem', fontWeight: 600, color: '#1f2937', whiteSpace: 'nowrap' }}>
                                {value}
                            </div>
                        </div>

                        <div style={{ position: 'relative', width: '100%', height: '12px', background: '#e5e7eb', borderRadius: '999px', overflow: 'hidden' }}>
                            <div
                                style={{
                                    width: `${width}%`,
                                    height: '100%',
                                    background: color,
                                    borderRadius: '999px',
                                    boxShadow: 'none',
                                }}
                            />
                        </div>
                    </div>
                );
            })}
        </div>
    );
};
