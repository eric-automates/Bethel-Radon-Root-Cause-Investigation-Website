let chartInstance = null;

const graphTitles = [
    "1. Master Multivariable Overlay",
    "2. Stack Effect Delta (Outside Temp vs Sensor Temp)",
    "3. Barometric Pressure vs Radon Correlation",
    "4. Sensor Temp vs Outside Temp Comparison",
    "5. Sensor Humidity vs Outside Humidity Impact",
    "6. Wind Speed & Barometric Pressure Dynamics",
    "7. Cumulative Rainfall vs Radon Spikes",
    "8. Severe Storm Threat Index vs Radon",
    "9. Indoor Climate Focus (Sensor Temp & Humidity)",
    "10. Outdoor Weather Focus (Outside Temp & Pressure)",
    "11. Time-Series: Bar Chart Mode (All Metrics)",
    "12. Time-Series: Filled Area Chart Mode",
    "13. Time-Series: Stepped Line Profile",
    "14. Time-Series: Raw Data Points Only",
    "15. High Contrast Executive Visibility View",
    "16. Volatility Index: Day-over-Day Radon Delta",
    "17. Normalized Percentage Scale (0-100% Comparison)",
    "18. Cumulative Rainfall Progression Profile",
    "19. Barometric Pressure Volatility Curve",
    "20. Wind Velocity Stress Profile",
    "21. Scatter: Radon vs Sensor Temp",
    "22. Scatter: Radon vs Outside Temp",
    "23. Scatter: Radon vs Barometric Pressure",
    "24. Scatter: Radon vs Wind Speed",
    "25. Scatter: Radon vs Sensor Humidity",
    "26. Radar Profile: Weekly Environmental Averages",
    "27. Radar Profile: Meteorological Extremes",
    "28. Doughnut: EPA Action Level Breakdown (Above/Below 4.0 pCi/L)",
    "29. Cumulative Pressure Deviation Analysis",
    "30. Bethel Root Cause Summary Synthesis"
];

function initGraphs() {
    const select = document.getElementById('graphSelect');
    select.innerHTML = '';
    graphTitles.forEach((title, index) => {
        const opt = document.createElement('option');
        opt.value = index;
        opt.textContent = title;
        select.appendChild(opt);
    });
    switchGraph(0);
}

function switchGraph(index) {
    idx = parseInt(index);
    if (chartInstance) chartInstance.destroy();

    const ctx = document.getElementById('investigationChart').getContext('2d');
    
    // Base Datasets (All metrics available in every graph via toggleable legends)
    let datasets = [
        { label: 'Radon (pCi/L)', data: globalData.radon, borderColor: '#ff7b72', backgroundColor: 'rgba(255,123,114,0.2)', yAxisID: 'yR', type: 'line', hidden: false },
        { label: 'Sensor Temp (°F)', data: globalData.sensorTemp, borderColor: '#58a6ff', backgroundColor: 'rgba(88,166,255,0.2)', yAxisID: 'yT', type: 'line', hidden: false },
        { label: 'Outside Temp (°F)', data: globalData.outsideTemp, borderColor: '#ffa657', backgroundColor: 'rgba(255,166,87,0.2)', yAxisID: 'yT', type: 'line', hidden: false },
        { label: 'Sensor Humidity (%)', data: globalData.sensorHumidity, borderColor: '#3fb950', backgroundColor: 'rgba(63,185,80,0.2)', yAxisID: 'yH', type: 'line', hidden: false },
        { label: 'Outside Pressure (inHg)', data: globalData.outsidePressure, borderColor: '#d2a8ff', backgroundColor: 'rgba(210,168,255,0.2)', yAxisID: 'yP', type: 'line', hidden: false },
        { label: 'Wind Speed (mph)', data: globalData.windSpeed, borderColor: '#79c0ff', backgroundColor: 'rgba(121,192,255,0.2)', yAxisID: 'yH', type: 'line', hidden: true },
        { label: 'Rainfall (in)', data: globalData.rainfall, backgroundColor: 'rgba(163,113,247,0.6)', yAxisID: 'yRain', type: 'bar', hidden: false },
        { label: 'Storm Threat Index', data: globalData.stormThreat, borderColor: '#f85149', backgroundColor: 'rgba(248,81,73,0.2)', yAxisID: 'yRain', type: 'line', hidden: true }
    ];

    let chartType = 'line';
    let options = {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: 'index', intersect: false },
        plugins: { legend: { labels: { color: '#c9d1d9', boxWidth: 12, font: { size: 11 } } } },
        scales: {
            x: { grid: { color: '#30363d' }, ticks: { color: '#8b949e', font: { size: 10 } } },
            yR: { type: 'linear', position: 'left', title: { display: true, text: 'Radon (pCi/L)', color: '#ff7b72' }, ticks: { color: '#8b949e' }, grid: { color: '#30363d' } },
            yT: { type: 'linear', position: 'right', title: { display: true, text: 'Temperature (°F)', color: '#58a6ff' }, ticks: { color: '#8b949e' }, grid: { drawOnChartArea: false } },
            yH: { type: 'linear', position: 'right', display: false, min: 0, max: 100 },
            yP: { type: 'linear', position: 'right', display: false, min: 28, max: 31 },
            yRain: { type: 'linear', position: 'right', display: false, min: 0, max: 10 }
        }
    };

    // Specific graph type modifications across the 30 variations
    if (idx === 1) { // Stack effect delta
        const delta = globalData.outsideTemp.map((ot, i) => ot - globalData.sensorTemp[i]);
        datasets[1].hidden = true; datasets[2].hidden = true;
        datasets.push({ label: 'Stack Effect Delta (Out - In)', data: delta, borderColor: '#ff7b72', yAxisID: 'yT', type: 'line' });
    } else if (idx >= 10 && idx <= 14) {
        if (idx === 11) datasets.forEach(d => { d.hidden = false; d.type = 'bar'; });
        if (idx === 12) datasets.forEach(d => { d.hidden = false; d.fill = true; });
        if (idx === 13) datasets.forEach(d => { d.hidden = false; d.stepped = true; });
        if (idx === 14) datasets.forEach(d => { d.hidden = false; d.showLine = false; });
    } else if (idx >= 20 && idx <= 24) {
        chartType = 'scatter';
        const targetData = idx === 20 ? globalData.sensorTemp : idx === 21 ? globalData.outsideTemp : idx === 22 ? globalData.outsidePressure : idx === 23 ? globalData.windSpeed : globalData.sensorHumidity;
        const labelName = idx === 20 ? 'Sensor Temp' : idx === 21 ? 'Outside Temp' : idx === 22 ? 'Pressure' : idx === 23 ? 'Wind Speed' : 'Sensor Humidity';
        datasets = [{
            label: `Radon vs ${labelName}`,
            data: targetData.map((v, i) => ({ x: v, y: globalData.radon[i] })),
            backgroundColor: '#ff7b72',
            pointRadius: 6
        }];
        options.scales = {
            x: { type: 'linear', title: { display: true, text: labelName, color: '#c9d1d9' }, grid: { color: '#30363d' }, ticks: { color: '#8b949e' } },
            y: { type: 'linear', title: { display: true, text: 'Radon (pCi/L)', color: '#ff7b72' }, grid: { color: '#30363d' }, ticks: { color: '#8b949e' } }
        };
    } else if (idx === 25 || idx === 26) {
        chartType = 'radar';
        datasets = [
            { label: 'Phase 1 Baseline', data: [4.2, 65, 75, 45, 29.9], borderColor: '#58a6ff', backgroundColor: 'rgba(88,166,255,0.2)' },
            { label: 'Phase 2 Basement Storm Event', data: [7.5, 62, 85, 55, 29.3], borderColor: '#ff7b72', backgroundColor: 'rgba(255,123,114,0.2)' }
        ];
        options.scales = { r: { angleLines: { color: '#30363d' }, grid: { color: '#30363d' }, pointLabels: { color: '#c9d1d9' }, ticks: { display: false } } };
        options.data = { labels: ['Radon (pCi/L)', 'Sensor Temp', 'Sensor Humidity', 'Wind Speed', 'Pressure'] };
    } else if (idx === 27) {
        chartType = 'doughnut';
        const highCount = globalData.radon.filter(r => r >= 4.0).length;
        const lowCount = globalData.radon.length - highCount;
        datasets = [{ data: [highCount, lowCount], backgroundColor: ['#ff7b72', '#3fb950'], borderWidth: 0 }];
        options.scales = {};
        options.data = { labels: ['Days ABOVE EPA Action Level (4.0+ pCi/L)', 'Days BELOW Action Level'] };
    }

    chartInstance = new Chart(ctx, {
        type: chartType,
        data: options.data || { labels: globalData.labels, datasets: datasets },
        options: options
    });
}
