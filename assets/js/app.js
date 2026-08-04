let masterData = []; 
let globalData = {}; 
let currentTimeRange = 'month'; // Default
let currentTimeEnd = null; 
let isAppInitialized = false;

async function loadData() {
    try {
        const response = await fetch('data/data.csv');
        const text = await response.text();
        
        // Strip Windows carriage returns to prevent silent parsing errors on GitHub Pages
        const lines = text.replace(/\r/g, '').trim().split('\n');

        for (let i = 1; i < lines.length; i++) {
            const cols = lines[i].split(',');
            if (cols.length >= 9) {
                // Ensure date parses correctly at exactly midnight
                const dateObj = new Date(cols[0] + "T00:00:00");
                
                masterData.push({
                    date: dateObj,
                    label: cols[0],
                    radon: parseFloat(cols[1]),
                    sensorHumidity: parseFloat(cols[2]),
                    sensorTemp: parseFloat(cols[3]),
                    outsideTemp: parseFloat(cols[4]),
                    outsidePressure: parseFloat(cols[5]),
                    windSpeed: parseFloat(cols[6]),
                    rainfall: parseFloat(cols[7]),
                    // Multiply binary threat (0 or 1) by 10 so it spikes visibly on the chart
                    stormThreat: parseFloat(cols[8]) * 10
                });
            }
        }
        
        if (masterData.length > 0) {
            masterData.sort((a, b) => a.date - b.date); 
            currentTimeEnd = new Date(masterData[masterData.length - 1].date);
            
            // Build the data slice and trigger UI population
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
        if (currentTimeRange === 'week') msRange = 7 * 24 * 60 * 60 * 1000;
        if (currentTimeRange === 'month') msRange = 30 * 24 * 60 * 60 * 1000;
        if (currentTimeRange === '3months') msRange = 90 * 24 * 60 * 60 * 1000;
        
        const startMs = endMs - msRange;
        sliced = masterData.filter(d => {
            const t = d.date.getTime();
            return t >= startMs && t <= endMs;
        });
    }
    
    globalData = {
        labels: sliced.map(d => d.label),
        radon: sliced.map(d => d.radon),
        sensorHumidity: sliced.map(d => d.sensorHumidity),
        sensorTemp: sliced.map(d => d.sensorTemp),
        outsideTemp: sliced.map(d => d.outsideTemp),
        outsidePressure: sliced.map(d => d.outsidePressure),
        windSpeed: sliced.map(d => d.windSpeed),
        rainfall: sliced.map(d => d.rainfall),
        stormThreat: sliced.map(d => d.stormThreat)
    };
    
    // First run initialization logic vs. normal graph switching
    if (!isAppInitialized) {
        if (window.initGraphs) {
            window.initGraphs(); // Populates the dropdown menu and draws graph 0
            isAppInitialized = true;
        }
    } else {
        if (window.switchGraph && document.getElementById('graphSelect')) {
            window.switchGraph(document.getElementById('graphSelect').value || 0);
        }
    }
}

function setTimeRange(range) {
    currentTimeRange = range;
    document.querySelectorAll('.time-controls button').forEach(btn => btn.classList.remove('active'));
    document.querySelector(`.time-controls button[onclick*="${range}"]`).classList.add('active');
    
    // Snap forward to the latest date when a new range is selected
    currentTimeEnd = new Date(masterData[masterData.length - 1].date);
    updateDataSlice();
}

function stepTime(direction) {
    if (currentTimeRange === 'all') return; 
    
    let msRange = 0;
    if (currentTimeRange === 'week') msRange = 7 * 24 * 60 * 60 * 1000;
    if (currentTimeRange === 'month') msRange = 30 * 24 * 60 * 60 * 1000;
    if (currentTimeRange === '3months') msRange = 90 * 24 * 60 * 60 * 1000;
    
    const offsetMs = msRange * direction;
    currentTimeEnd = new Date(currentTimeEnd.getTime() + offsetMs);
    
    // Clamp to boundaries so the user cannot navigate past the available dataset
    const maxDate = masterData[masterData.length - 1].date.getTime();
    const minDate = masterData[0].date.getTime() + msRange;
    
    if (currentTimeEnd.getTime() > maxDate) currentTimeEnd = new Date(maxDate);
    if (currentTimeEnd.getTime() < minDate) currentTimeEnd = new Date(minDate);
    
    updateDataSlice();
}

document.addEventListener('DOMContentLoaded', loadData);
