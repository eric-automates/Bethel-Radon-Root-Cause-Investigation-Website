let masterData = []; 
let globalData = {}; 
let currentTimeRange = 'month'; 
let currentTimeEnd = null; 
let isAppInitialized = false;
let currentChartRatio = null; // Global tracker for active ratio

async function loadData() {
    try {
        const timestamp = new Date().getTime();
        const response = await fetch(`data/data.csv?v=${timestamp}`);
        const text = await response.text();
        
        const lines = text.replace(/\r/g, '').trim().split('\n');

        for (let i = 1; i < lines.length; i++) {
            const cols = lines[i].split(',');
            if (cols.length >= 9) {
                const dateObj = new Date(cols[0] + "T00:00:00");
                masterData.push({
                    date: dateObj, label: cols[0],
                    radon: parseFloat(cols[1]), sensorHumidity: parseFloat(cols[2]), sensorTemp: parseFloat(cols[3]),
                    outsideTemp: parseFloat(cols[4]), outsidePressure: parseFloat(cols[5]), windSpeed: parseFloat(cols[6]),
                    rainfall: parseFloat(cols[7]), stormThreat: parseFloat(cols[8]) * 10
                });
            }
        }
        
        if (masterData.length > 0) {
            masterData.sort((a, b) => a.date - b.date); 
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
        labels: sliced.map(d => d.label), radon: sliced.map(d => d.radon),
        sensorHumidity: sliced.map(d => d.sensorHumidity), sensorTemp: sliced.map(d => d.sensorTemp),
        outsideTemp: sliced.map(d => d.outsideTemp), outsidePressure: sliced.map(d => d.outsidePressure),
        windSpeed: sliced.map(d => d.windSpeed), rainfall: sliced.map(d => d.rainfall), stormThreat: sliced.map(d => d.stormThreat)
    };
    
    if (!isAppInitialized) {
        if (window.initGraphs) { window.initGraphs(); isAppInitialized = true; }
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
    
    const maxDate = masterData[masterData.length - 1].date.getTime();
    const minDate = masterData[0].date.getTime() + msRange;
    if (currentTimeEnd.getTime() > maxDate) currentTimeEnd = new Date(maxDate);
    if (currentTimeEnd.getTime() < minDate) currentTimeEnd = new Date(minDate);
    
    updateDataSlice();
}

/* --- NEW: Mathematical Trickery for Absolute Ratio Control --- */
function applyRatioConstraints() {
    const viewport = document.querySelector('.chart-viewport');
    const wrapper = document.getElementById('canvasWrapper');
    if (!viewport || !wrapper) return;

    if (!currentChartRatio) {
        wrapper.style.width = '100%';
        wrapper.style.height = '100%';
        return;
    }

    // Get the exact usable pixel area (subtracting the 10px padding on all sides)
    const vpWidth = viewport.clientWidth - 20;
    const vpHeight = viewport.clientHeight - 20;
    
    const [rW, rH] = currentChartRatio.split('/').map(Number);
    const targetRatio = rW / rH;
    const actualRatio = vpWidth / vpHeight;

    // Force exact pixel dimensions onto the wrapper, bypassing browser flex rules
    if (actualRatio > targetRatio) {
        wrapper.style.height = vpHeight + 'px';
        wrapper.style.width = (vpHeight * targetRatio) + 'px';
    } else {
        wrapper.style.width = vpWidth + 'px';
        wrapper.style.height = (vpWidth / targetRatio) + 'px';
    }
}

// Watch for screen rotation/resizes to instantly recalculate bounds
window.addEventListener('resize', () => {
    applyRatioConstraints();
    if (typeof chartInstance !== 'undefined' && chartInstance) chartInstance.resize();
});

function setRatio(ratio, element) {
    if (element && element.classList.contains('active')) {
        element.classList.remove('active');
        currentChartRatio = null; // Toggles off (back to auto-fill)
    } else {
        document.querySelectorAll('.ratio-btn').forEach(btn => btn.classList.remove('active'));
        if (element) element.classList.add('active');
        currentChartRatio = ratio;
    }
    
    applyRatioConstraints();
    if (typeof chartInstance !== 'undefined' && chartInstance) chartInstance.resize();
}

document.addEventListener('DOMContentLoaded', loadData);
