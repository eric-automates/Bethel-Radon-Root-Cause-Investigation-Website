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

const getAvg = arr => arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;
const getCumul = arr => { let sum = 0; return arr.map(v => sum += v); };
const getDelta = arr => arr.map((v, i) => i === 0 ? 0 : v - arr[i-1]);

function switchGraph(index) {
    const idx = parseInt(index);
    if (chartInstance) chartInstance.destroy();
    
    // Guard against empty data on initial load
    if (!globalData || !globalData.radon || globalData.radon.length === 0) return;

    const ctx = document.getElementById('investigationChart').getContext('2d');
    
    // 1. Generate Base Data Objects
    const d_radon = { label: 'Radon (pCi/L)', data: [...globalData.radon], borderColor: '#ff7b72', backgroundColor: 'rgba(255,123,114,0.2)', yAxisID: 'yR', type: 'line', borderWidth: 2 };
    const d_inTemp = { label: 'Sensor Temp (°F)', data: [...globalData.sensorTemp], borderColor: '#58a6ff', backgroundColor: 'rgba(88,166,255,0.2)', yAxisID: 'yT', type: 'line', borderWidth: 2 };
    const d_outTemp = { label: 'Outside Temp (°F)', data: [...globalData.outsideTemp], borderColor: '#ffa657', backgroundColor: 'rgba(255,166,87,0.2)', yAxisID: 'yT', type: 'line', borderWidth: 2 };
    const d_inHum = { label: 'Sensor Humidity (%)', data: [...globalData.sensorHumidity], borderColor: '#3fb950', backgroundColor: 'rgba(63,185,80,0.2)', yAxisID: 'yH', type: 'line', borderWidth: 2 };
    const d_outPress = { label: 'Outside Pressure (inHg)', data: [...globalData.outsidePressure], borderColor: '#d2a8ff', backgroundColor: 'rgba(210,168,255,0.2)', yAxisID: 'yP', type: 'line', borderWidth: 2 };
    const d_wind = { label: 'Wind Speed (mph)', data: [...globalData.windSpeed], borderColor: '#79c0ff', backgroundColor: 'rgba(121,192,255,0.2)', yAxisID: 'yH', type: 'line', borderWidth: 2 };
    const d_rain = { label: 'Rainfall (in)', data: [...globalData.rainfall], backgroundColor: 'rgba(163,113,247,0.6)', yAxisID: 'yRain', type: 'bar' };
    const d_storm = { label: 'Storm Threat Index', data: [...globalData.stormThreat], borderColor: '#f85149', backgroundColor: 'rgba(248,81,73,0.2)', yAxisID: 'yRain', type: 'line', borderWidth: 2 };

    let chartType = 'line';
    let chartDatasets = [];
    let chartOptions = { responsive: true, maintainAspectRatio: false, plugins: { legend: { labels: { color: '#c9d1d9' } } } };

    // 2. ISOLATED ROUTING (Prevents Chart.js Axis Crashes)
    if (idx >= 20 && idx <= 24) {
        // --- SCATTER CHARTS ---
        chartType = 'scatter';
        const targetData = idx === 20 ? globalData.sensorTemp : idx === 21 ? globalData.outsideTemp : idx === 22 ? globalData.outsidePressure : idx === 23 ? globalData.windSpeed : globalData.sensorHumidity;
        const labelName = idx === 20 ? 'Sensor Temp (°F)' : idx === 21 ? 'Outside Temp (°F)' : idx === 22 ? 'Pressure (inHg)' : idx === 23 ? 'Wind Speed (mph)' : 'Sensor Humidity (%)';
        
        chartDatasets = [{
            label: `Radon vs ${labelName}`,
            data: targetData.map((v, i) => ({ x: v, y: globalData.radon[i] })),
            backgroundColor: '#ff7b72', borderColor: '#ff7b72', pointRadius: 5
        }];
        chartOptions.scales = {
            x: { type: 'linear', title: { display: true, text: labelName, color: '#c9d1d9' }, grid: { color: '#30363d' }, ticks: { color: '#8b949e' } },
            y: { type: 'linear', title: { display: true, text: 'Radon (pCi/L)', color: '#ff7b72' }, grid: { color: '#30363d' }, ticks: { color: '#8b949e' } }
        };

    } else if (idx === 25 || idx === 26) {
        // --- RADAR CHARTS ---
        chartType = 'radar';
        let rData1, rData2, lbl1, lbl2;
        if (idx === 25) {
            lbl1 = "Active Window Profile"; lbl2 = "EPA Ideal Baseline";
            rData1 = [ getAvg(globalData.radon)*10, getAvg(globalData.sensorTemp), getAvg(globalData.sensorHumidity), getAvg(globalData.outsidePressure), getAvg(globalData.windSpeed)*5 ];
            rData2 = [ 4.0*10, 68.0, 45.0, 29.92, 5.0*5 ];
        } else {
            const combined = globalData.radon.map((r, i) => ({ r, sT: globalData.sensorTemp[i], sH: globalData.sensorHumidity[i], oP: globalData.outsidePressure[i], wS: globalData.windSpeed[i] }));
            combined.sort((a, b) => a.r - b.r);
            const third = Math.max(1, Math.floor(combined.length / 3));
            const lowThird = combined.slice(0, third);
            const highThird = combined.slice(-third);
            lbl1 = "Top 30% Highest Radon Days"; lbl2 = "Top 30% Lowest Radon Days";
            rData1 = [ getAvg(highThird.map(d=>d.r))*10, getAvg(highThird.map(d=>d.sT)), getAvg(highThird.map(d=>d.sH)), getAvg(highThird.map(d=>d.oP)), getAvg(highThird.map(d=>d.wS))*5 ];
            rData2 = [ getAvg(lowThird.map(d=>d.r))*10, getAvg(lowThird.map(d=>d.sT)), getAvg(lowThird.map(d=>d.sH)), getAvg(lowThird.map(d=>d.oP)), getAvg(lowThird.map(d=>d.wS))*5 ];
        }
        chartDatasets = [
            { label: lbl1, data: rData1, borderColor: '#ff7b72', backgroundColor: 'rgba(255,123,114,0.2)' },
            { label: lbl2, data: rData2, borderColor: '#58a6ff', backgroundColor: 'rgba(88,166,255,0.2)' }
        ];
        chartOptions.scales = { r: { angleLines: { color: '#30363d' }, grid: { color: '#30363d' }, pointLabels: { color: '#c9d1d9' }, ticks: { display: false } } };

    } else if (idx === 27) {
        // --- DOUGHNUT CHART ---
        chartType = 'doughnut';
        const highCount = globalData.radon.filter(r => r >= 4.0).length;
        const lowCount = globalData.radon.length - highCount;
        chartDatasets = [{ data: [highCount, lowCount], backgroundColor: ['#ff7b72', '#3fb950'], borderColor: '#161b22', borderWidth: 2 }];
        chartOptions.scales = {}; // Force zero scales to prevent crashes
        
        // Inject doughnut-specific properties directly into the config wrapper
        var doughnutConfig = {
            type: 'doughnut',
            data: { labels: ['Days ABOVE Action Level (4.0+)', 'Days BELOW Action Level'], datasets: chartDatasets },
            options: chartOptions
        };

    } else {
        // --- ALL LINE / BAR CHARTS (0-19, 28, 29) ---
        chartOptions.interaction = { mode: 'index', intersect: false };
        chartOptions.scales = {
            x: { grid: { color: '#30363d' }, ticks: { color: '#8b949e' } },
            yR: { type: 'linear', position: 'left', title: { display: true, text: 'Radon (pCi/L)', color: '#ff7b72' }, grid: { color: '#30363d' }, ticks: { color: '#8b949e' } },
            yT: { type: 'linear', position: 'right', display: false, title: { display: true, text: 'Temp (°F)', color: '#58a6ff' }, grid: { drawOnChartArea: false }, ticks: { color: '#8b949e' } },
            yH: { type: 'linear', position: 'right', display: false, title: { display: true, text: 'Hum / Wind', color: '#3fb950' }, grid: { drawOnChartArea: false }, ticks: { color: '#8b949e' } },
            yP: { type: 'linear', position: 'right', display: false, title: { display: true, text: 'Press (inHg)', color: '#d2a8ff' }, grid: { drawOnChartArea: false }, ticks: { color: '#8b949e' } },
            yRain: { type: 'linear', position: 'right', display: false, title: { display: true, text: 'Rain / Storm', color: '#a371f7' }, grid: { drawOnChartArea: false }, ticks: { color: '#8b949e' } }
        };

        const showAxes = (arr) => arr.forEach(a => chartOptions.scales[a].display = true);

        // Specific Line Graph Logic
        if (idx === 0) {
            chartDatasets = [d_radon, d_inTemp, d_outTemp, d_inHum, d_outPress, d_wind, d_rain, d_storm];
            d_wind.hidden = true; d_storm.hidden = true;
            showAxes(['yT', 'yH', 'yP', 'yRain']);
        } else if (idx === 1) {
            const delta = globalData.outsideTemp.map((ot, i) => ot - globalData.sensorTemp[i]);
            chartDatasets = [d_radon, { label: 'Stack Effect Delta (Out - In)', data: delta, borderColor: '#ff7b72', yAxisID: 'yT', type: 'line' }];
            showAxes(['yT']);
        } else if (idx === 2) { chartDatasets = [d_radon, d_outPress]; showAxes(['yP']);
        } else if (idx === 3) { chartDatasets = [d_radon, d_inTemp, d_outTemp]; showAxes(['yT']);
        } else if (idx === 4) { chartDatasets = [d_radon, d_inHum, d_wind]; showAxes(['yH']);
        } else if (idx === 5) { chartDatasets = [d_radon, d_wind, d_outPress]; showAxes(['yH', 'yP']);
        } else if (idx === 6) { 
            chartDatasets = [d_radon, { label: 'Cumul Rain (in)', data: getCumul(globalData.rainfall), borderColor: '#a371f7', backgroundColor: 'rgba(163,113,247,0.2)', yAxisID: 'yRain', type: 'line', fill: true }];
            showAxes(['yRain']);
        } else if (idx === 7) { chartDatasets = [d_radon, d_storm]; showAxes(['yRain']);
        } else if (idx === 8) { chartDatasets = [d_radon, d_inTemp, d_inHum]; showAxes(['yT', 'yH']);
        } else if (idx === 9) { chartDatasets = [d_radon, d_outTemp, d_outPress, d_wind, d_rain]; showAxes(['yT', 'yP', 'yH', 'yRain']);
        } else if (idx >= 10 && idx <= 14) {
            chartDatasets = [d_radon, d_inTemp, d_outTemp, d_inHum, d_outPress, d_rain];
            if (idx === 10) chartDatasets.forEach(d => d.type = 'bar');
            if (idx === 11) chartDatasets.forEach(d => { d.fill = true; d.type = 'line'; });
            if (idx === 12) chartDatasets.forEach(d => { d.stepped = true; d.type = 'line'; });
            if (idx === 13) chartDatasets.forEach(d => { d.showLine = false; d.type = 'line'; });
            if (idx === 14) chartDatasets.forEach(d => { d.borderWidth = 4; d.type = 'line'; });
            showAxes(['yT', 'yH', 'yP', 'yRain']);
        } else if (idx === 15) {
            chartDatasets = [{ label: 'Radon Daily Volatility', data: getDelta(globalData.radon), backgroundColor: '#ff7b72', yAxisID: 'yR', type: 'bar' }];
        } else if (idx === 16) {
            chartDatasets = [d_radon, d_inTemp, d_outTemp, d_outPress];
            chartDatasets.forEach(d => {
                const mx = Math.max(...d.data), mn = Math.min(...d.data);
                d.data = d.data.map(v => mx===mn ? 0 : ((v-mn)/(mx-mn))*100);
                d.yAxisID = 'yR';
            });
            chartOptions.scales.yR.title.text = "Normalized Percentage (0-100%)";
        } else if (idx === 17) {
            chartDatasets = [d_radon, d_rain, { label: 'Cumul Rain (in)', data: getCumul(globalData.rainfall), borderColor: '#a371f7', yAxisID: 'yRain', type: 'line' }];
            showAxes(['yRain']);
        } else if (idx === 18) {
            chartDatasets = [d_radon, { label: 'Pressure Volatility', data: getDelta(globalData.outsidePressure), borderColor: '#d2a8ff', yAxisID: 'yP', type: 'line' }];
            showAxes(['yP']);
        } else if (idx === 19) { chartDatasets = [d_radon, { ...d_wind, type: 'bar' }]; showAxes(['yH']);
        } else if (idx === 28) {
            chartDatasets = [d_radon, { label: 'Deviation from 29.92 inHg', data: globalData.outsidePressure.map(p => p - 29.92), borderColor: '#d2a8ff', yAxisID: 'yP', type: 'bar' }];
            showAxes(['yP']);
        } else if (idx === 29) {
            const stack = globalData.outsideTemp.map((ot, i) => ot - globalData.sensorTemp[i]);
            chartDatasets = [d_radon, { label: 'Stack Delta', data: stack, borderColor: '#58a6ff', yAxisID: 'yT', type: 'line' }, d_outPress, d_rain];
            showAxes(['yT', 'yP', 'yRain']);
        }
    }

    // 3. Final Render Call
    const finalConfig = (idx === 27) ? doughnutConfig : {
        type: chartType,
        data: (idx >= 25 && idx <= 26) ? { labels: ['Radon', 'InTemp', 'InHum', 'Press', 'Wind'], datasets: chartDatasets } : { labels: globalData.labels, datasets: chartDatasets },
        options: chartOptions
    };

    chartInstance = new Chart(ctx, finalConfig);
}
