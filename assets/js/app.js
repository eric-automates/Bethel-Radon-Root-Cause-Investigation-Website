let masterData = []; 
let globalData = {}; 
let currentTimeRange = 'week';
let currentTimeEnd = null; 

async function loadData() {
    try {
        const response = await fetch('data/data.csv');
        const text = await response.text();
        const lines = text.trim().split('\n');
        
        // Auto-detect delimiter based on CSV format
        const delim = lines[0].includes(';') ? ';' : ',';
        let lastRadon = 3.0; // Default fallback for the very first reading if blank

        for (let i = 1; i < lines.length; i++) {
            const cols = lines[i].split(delim);
            if (cols.length >= 4) {
                const dateObj = new Date(cols[0]);
                
                // Airthings leaves radon blank on 5-min intervals. We forward-fill the last known hourly value.
                let radonVal = parseFloat(cols[1]);
                if (isNaN(radonVal)) {
                    radonVal = lastRadon; 
                } else {
                    lastRadon = radonVal;
                }
                
                const hum = parseFloat(cols[2]) || 45;
                const temp = parseFloat(cols[3]) || 68;
                
                masterData.push({
                    date: dateObj,
                    label: cols[0].replace('T', ' '),
                    radon: radonVal,
                    sensorHumidity: hum,
                    sensorTemp: temp,
                    // Simulate correlating external parameters for the Bethel location
                    outsideTemp: temp + (Math.sin(i * 0.05) * 15), 
                    outsidePressure: 29.80 + (Math.sin(i * 0.01) * 0.5),
                    windSpeed: 5 + Math.abs(Math.cos(i * 0.02) * 15),
                    rainfall: i % 100 === 0 ? 1.5 : 0,
                    stormThreat: i % 100 === 0 ? 80 : 10
                });
            }
        }
        
        if (masterData.length > 0) {
            masterData.sort((a, b) => a.date - b.date); // Ensure chronological order
            currentTimeEnd = new Date(masterData[masterData.length - 1].date);
            updateDataSlice();
        }
    } catch (e) {
        console.error("Error loading or parsing data.csv:", e);
    }
}

function updateDataSlice() {
    if (!masterData.length) return;
    
    let sliced = [];
    
    if (currentTimeRange === 'all') {
        sliced = masterData;
    } else {
        const endMs = currentTimeEnd.getTime();
        let msRange = 0;
        if (currentTimeRange === 'hour') msRange = 60 * 60 * 1000;
        if (currentTimeRange === 'day') msRange = 24 * 60 * 60 * 1000;
        if (currentTimeRange === 'week') msRange = 7 * 24 * 60 * 60 * 1000;
        
        const startMs = endMs - msRange;
        sliced = masterData.filter(d => {
            const t = d.date.getTime();
            return t >= startMs && t <= endMs;
        });
    }
    
    // Auto-Downsample via algorithmic skipping if data points exceed comfortable rendering limit (prevents UI freeze)
    let processed = sliced;
    if (processed.length > 800) {
        const step = Math.ceil(processed.length / 500);
        processed = processed.filter((_, i) => i % step === 0);
    }
    
    // Map processed slice to global properties read by graphs.js
    globalData = {
        labels: processed.map(d => {
            if (currentTimeRange === 'hour' || currentTimeRange === 'day') {
                return d.label.split(' ')[1].substring(0, 5); // Just HH:MM
            }
            return d.label; // Full timestamp
        }),
        radon: processed.map(d => d.radon),
        sensorHumidity: processed.map(d => d.sensorHumidity),
        sensorTemp: processed.map(d => d.sensorTemp),
        outsideTemp: processed.map(d => d.outsideTemp),
        outsidePressure: processed.map(d => d.outsidePressure),
        windSpeed: processed.map(d => d.windSpeed),
        rainfall: processed.map(d => d.rainfall),
        stormThreat: processed.map(d => d.stormThreat)
    };
    
    if (window.switchGraph && document.getElementById('graphSelect')) {
        window.switchGraph(document.getElementById('graphSelect').value || 0);
    }
}

function setTimeRange(range) {
    currentTimeRange = range;
    document.querySelectorAll('.time-controls button').forEach(btn => btn.classList.remove('active'));
    document.querySelector(`.time-controls button[onclick*="${range}"]`).classList.add('active');
    
    // Always snap forward to the latest date when picking a new range
    currentTimeEnd = new Date(masterData[masterData.length - 1].date);
    updateDataSlice();
}

function stepTime(direction) {
    if (currentTimeRange === 'all') return; 
    
    let msRange = 0;
    if (currentTimeRange === 'hour') msRange = 60 * 60 * 1000;
    if (currentTimeRange === 'day') msRange = 24 * 60 * 60 * 1000;
    if (currentTimeRange === 'week') msRange = 7 * 24 * 60 * 60 * 1000;
    
    const offsetMs = msRange * direction;
    currentTimeEnd = new Date(currentTimeEnd.getTime() + offsetMs);
    
    // Clamp to bounds so users can't arrow into empty void space
    const maxDate = masterData[masterData.length - 1].date.getTime();
    const minDate = masterData[0].date.getTime() + msRange;
    
    if (currentTimeEnd.getTime() > maxDate) currentTimeEnd = new Date(maxDate);
    if (currentTimeEnd.getTime() < minDate) currentTimeEnd = new Date(minDate);
    
    updateDataSlice();
}

document.addEventListener('DOMContentLoaded', loadData);
