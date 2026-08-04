// --- NEW: Aspect Ratio Controller ---
function setRatio(ratio, element) {
    const wrapper = document.getElementById('canvasWrapper');
    
    // If clicking the currently active button, toggle it off (return to auto-fill screen mode)
    if (element && element.classList.contains('active')) {
        element.classList.remove('active');
        wrapper.style.aspectRatio = 'auto';
        if (typeof chartInstance !== 'undefined' && chartInstance) chartInstance.resize();
        return;
    }

    // Clear active states from all ratio buttons
    document.querySelectorAll('.ratio-btn').forEach(btn => btn.classList.remove('active'));
    if (element) element.classList.add('active');
    
    // Enforce the new mathematical boundary constraints via CSS
    wrapper.style.aspectRatio = ratio;
    
    // Tell Chart.js to recalculate its internal canvas bounds
    if (typeof chartInstance !== 'undefined' && chartInstance) {
        chartInstance.resize();
    }
}
