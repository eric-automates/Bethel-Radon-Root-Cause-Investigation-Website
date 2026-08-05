// ... (Keep existing loadData, updateDataSlice, setTimeRange, stepTime logic) ...

function toggleCompactMode() {
    document.body.classList.toggle('compact-mode');
    
    // Force Chart.js to recalculate its canvas size immediately to fill the new space
    if (typeof chartInstance !== 'undefined' && chartInstance) {
        chartInstance.resize();
    }
}

// Ensure resize events keep the chart flush with the fluid container
window.addEventListener('resize', () => {
    if (typeof chartInstance !== 'undefined' && chartInstance) {
        chartInstance.resize();
    }
});

document.addEventListener('DOMContentLoaded', loadData);
