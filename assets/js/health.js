document.addEventListener('DOMContentLoaded', () => {
    // Check DOM node count
    const domNodes = document.getElementsByTagName('*').length;
    document.getElementById('domStatus').textContent = `Healthy (${domNodes} nodes)`;

    // Check Memory if supported by the browser
    if (performance && performance.memory) {
        const memMB = (performance.memory.usedJSHeapSize / 1024 / 1024).toFixed(2);
        document.getElementById('memoryUsage').textContent = `${memMB} MB`;
    } else {
        document.getElementById('memoryUsage').textContent = 'Managed by Client';
    }

    // Periodic check to read the live variables from the app.js engine
    setInterval(() => {
        if (typeof masterData !== 'undefined' && masterData.length > 0) {
            document.getElementById('recordCount').textContent = `${masterData.length.toLocaleString()} Total`;
            
            if (typeof globalData !== 'undefined' && globalData.radon) {
                const displayed = globalData.radon.length;
                document.getElementById('downsampleStatus').textContent = `${displayed.toLocaleString()} Active`;
            }
            
            if (typeof currentTimeRange !== 'undefined') {
                document.getElementById('timeSliceInfo').textContent = currentTimeRange.toUpperCase();
            }
        } else {
            document.getElementById('recordCount').textContent = 'Parsing CSV...';
        }
    }, 1000);
});
