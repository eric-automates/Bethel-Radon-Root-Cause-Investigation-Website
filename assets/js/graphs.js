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
    "26. Radar Profile: Active Environmental Averages",
    "27. Radar Profile: Meteorological Extremes (Top 30% vs Bottom 30% Radon Days)",
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

// Math helper for mapping data arrays
const getAvg = arr => arr.reduce((a, b) => a + b, 0) / (arr.length || 1);

function switchGraph(index) {
    const idx = parseInt(index);
    if (chartInstance) chartInstance.destroy();

    const ctx = document.getElementById('investigationChart').getContext('2d');
    
    // Core data arrays generated from globalData
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

    // Index Logic Router
    if (idx === 1) { 
        const delta = globalData.outsideTemp.map((ot, i) => ot - globalData.sensorTemp[i]);
        datasets[1].hidden = true; datasets[2].hidden = true;
        datasets.push({ label: 'Stack Effect Delta (Out - In)', data: delta, borderColor: '#ff7b72', yAxisID: 'yT', type: 'line' });
    } else if (idx === 15) { // Volatility Delta
        const delta = globalData.radon.map((r, i) => i === 0 ? 0 : r - globalData.radon[i-1]);
        datasets = [{ label: 'Day-over-Day Radon Change (pCi/L)', data: delta, borderColor: '#ff7b72', backgroundColor: 'rgba(255,123,114,0.4)', type: 'bar', yAxisID: 'yR' }];
    } else if (idx === 16) { // Min-Max Normalization (0-100%)
        datasets.forEach(d => {
            if(d.type === 'line' || d.type === 'bar') {
                const max = Math.max(...d.data), min = Math.min(...d.data);
                d.data = d.data.map(v => max === min ? 0 : ((v - min) / (max - min)) * 100);
            }
        });
        options.scales.yR.title.text = "Normalized Percentage (0-100%)";
    } else if (idx >= 10 && idx <= 14) {
        if (idx === 10) datasets.forEach(d => { d.hidden = false; d.type = 'bar'; });
        if (idx === 11) datasets.forEach(d => { d.hidden = false; d.fill = true; });
        if (idx === 12) datasets.forEach(d => { d.hidden = false; d.stepped = true; });
        if (idx === 13) datasets.forEach(d => { d.hidden = false; d.showLine = false; });
        if (idx === 14) datasets.forEach(d => { d.hidden = false; d.borderWidth = 4; });
    } else if (idx >= 20 && idx <= 24) {
        chartType = 'scatter';
        const targetData = idx === 20 ? globalData.sensorTemp : idx === 21 ? globalData.outsideTemp : idx === 22 ? globalData.outsidePressure : idx === 23 ? globalData.windSpeed : globalData.sensorHumidity;
        const labelName = idx === 20 ? 'Sensor Temp (°F)' : idx === 21 ? 'Outside Temp (°F)' : idx === 22 ? 'Pressure (inHg)' : idx === 23 ? 'Wind Speed (mph)' : 'Sensor Humidity (%)';
        datasets = [{
            label: `Radon vs ${labelName}`,
            data: targetData.map((v, i) => ({ x: v, y: globalData.radon[i] })),
            backgroundColor: '#ff7b72', borderColor: '#ff7b72', pointRadius: 5
        }];
        options.scales = {
            x: { type: 'linear', title: { display: true, text: labelName, color: '#c9d1d9' }, grid: { color: '#30363d' }, ticks: { color: '#8b949e' } },
            y: { type: 'linear', title: { display: true, text: 'Radon (pCi/L)', color: '#ff7b72' }, grid: { color: '#30363d' }, ticks: { color: '#8b949e' } }
        };
    } else if (idx === 25 || idx === 26) {
        chartType = 'radar';
        // Normalize variables to fit on a single geometric scale (1-100)
        let radarData1, radarData2, label1, label2;
        
        if (idx === 25) {
            // Overall Active Window Average
            label1 = "Active Window Profile";
            label2 = "EPA Ideal Baseline";
            radarData1 = [ getAvg(globalData.radon)*10, getAvg(globalData.sensorTemp), getAvg(globalData.sensorHumidity), getAvg(globalData.outsidePressure), getAvg(globalData.windSpeed)*5 ];
            radarData2 = [ 4.0*10, 68.0, 45.0, 29.92, 5.0*5 ];
        } else {
            // Extreme Weather Extraction: Sort the dataset by Radon levels to separate worst days from best days
            const combined = globalData.radon.map((r, i) => ({ r: r, sT: globalData.sensorTemp[i], sH: globalData.sensorHumidity[i], oP: globalData.outsidePressure[i], wS: globalData.windSpeed[i] }));
            combined.sort((a, b) => a.r - b.r);
            const third = Math.max(1, Math.floor(combined.length / 3));
            const lowThird = combined.slice(0, third);
            const highThird = combined.slice(-third);
            
            label1 = "Top 30% Highest Radon Days";
            label2 = "Top 30% Lowest Radon Days";
            radarData1 = [ getAvg(highThird.map(d=>d.r))*10, getAvg(highThird.map(d=>d.sT)), getAvg(highThird.map(d=>d.sH)), getAvg(highThird.map(d=>d.oP)), getAvg(highThird.map(d=>d.wS))*5 ];
            radarData2 = [ getAvg(lowThird.map(d=>d.r))*10, getAvg(lowThird.map(d=>d.sT)), getAvg(lowThird.map(d=>d.sH)), getAvg(lowThird.map(d=>d.oP)), getAvg(lowThird.map(d=>d.wS))*5 ];
        }

        datasets = [
            { label: label1, data: radarData1, borderColor: '#ff7b72', backgroundColor: 'rgba(255,123,114,0.2)' },
            { label: label2, data: radarData2, borderColor: '#58a6ff', backgroundColor: 'rgba(88,166,255,0.2)' }
        ];
        options.scales = { r: { angleLines: { color: '#30363d' }, grid: { color: '#30363d' }, pointLabels: { color: '#c9d1d9' }, ticks: { display: false } } };
        options.data = { labels: ['Radon (x10)', 'Sensor Temp', 'Sensor Humidity', 'Pressure (inHg)', 'Wind Speed (Scaled)'] };
    } else if (idx === 27) {
        chartType = 'doughnut';
        const highCount = globalData.radon.filter(r => r >= 4.0).length;
        const lowCount = globalData.radon.length - highCount;
        datasets = [{ data: [highCount, lowCount], backgroundColor: ['#ff7b72', '#3fb950'], borderColor: '#161b22', borderWidth: 2 }];
        options.scales = {}; // Remove axes for doughnut
        options.data = { labels: ['Days ABOVE EPA Action Level (4.0+ pCi/L)', 'Days BELOW Action Level'] };
    }

    chartInstance = new Chart(ctx, {
        type: chartType,
        data: options.data || { labels: globalData.labels, datasets: datasets },
        options: options
    });
            }
