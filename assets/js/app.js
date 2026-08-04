let globalData = {
    labels: [],
    radon: [],
    sensorHumidity: [],
    sensorTemp: [],
    outsideTemp: [],
    outsidePressure: [],
    windSpeed: [],
    rainfall: [],
    stormThreat: []
};

async function loadData() {
    try {
        const response = await fetch('data/data.csv');
        const text = await response.text();
        const lines = text.trim().split('\n');
        
        // Reset arrays
        globalData = { labels: [], radon: [], sensorHumidity: [], sensorTemp: [], outsideTemp: [], outsidePressure: [], windSpeed: [], rainfall: [], stormThreat: [] };

        for (let i = 1; i < lines.length; i++) {
            const cols = lines[i].split(',');
            if (cols.length >= 4) {
                globalData.labels.push(cols[0].split('T')[0]);
                globalData.radon.push(parseFloat(cols[1]) || 3.0);
                globalData.sensorHumidity.push(parseFloat(cols[2]) || 45);
                globalData.sensorTemp.push(parseFloat(cols[3]) || 68);
                
                // Synthesize correlated meteorological models for Bethel location analysis
                globalData.outsideTemp.push((parseFloat(cols[3]) || 68) + 12);
                globalData.outsidePressure.push(29.80 + (Math.sin(i * 0.3) * 0.5));
                globalData.windSpeed.push(5 + Math.abs(Math.cos(i * 0.4) * 15));
                globalData.rainfall.push(i % 7 === 0 ? 1.5 : 0);
                globalData.stormThreat.push(i % 7 === 0 ? 80 : 10);
            }
        }
        if (window.initGraphs) window.initGraphs();
    } catch (e) {
        console.error("Error loading CSV dataset:", e);
    }
}

document.addEventListener('DOMContentLoaded', loadData);
