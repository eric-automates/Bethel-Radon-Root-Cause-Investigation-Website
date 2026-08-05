    // Base options block with optimized layout for maximum graph visibility
    let chartOptions = { 
        responsive: true, 
        maintainAspectRatio: false, 
        layout: { padding: { top: 10, bottom: 0, left: 0, right: 0 } },
        plugins: { 
            legend: { 
                position: 'bottom', // Pushes legend to the bottom to maximize graph height
                labels: { 
                    color: '#c9d1d9',
                    boxWidth: 10,       // Shrinks the color box
                    font: { size: 10 }, // Shrinks the label text slightly
                    padding: 10
                } 
            },
            subtitle: {
                display: true,
                text: `Time Range: ${dateRangeStr}`,
                color: '#94a3b8',
                font: { size: 11, style: 'italic' },
                padding: { bottom: 10 }
            }
        } 
    };
