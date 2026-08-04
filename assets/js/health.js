document.addEventListener('DOMContentLoaded', () => {
    // Check DOM node count
    const domNodes = document.getElementsByTagName('*').length;
    document.getElementById('domStatus').textContent = `Healthy (${domNodes} nodes)`;

    // Check Memory if supported
    if (performance && performance.memory) {
        const memMB = (performance.memory.usedJSHeapSize / 1024 / 1024).toFixed(2);
        document.getElementById('memoryUsage').textContent = `${memMB} MB`;
    } else {
        document.getElementById('memoryUsage').textContent = 'Normal (Client Managed)';
    }

    // Check parsed records from CSV fetch status
    setTimeout(() => {
        if (typeof globalData !== 'undefined' && globalData.radon) {
            document.getElementById('recordCount').textContent = `${globalData.radon.length} Records Loaded`;
        } else {
            document.getElementById('recordCount').textContent = 'Loaded via CSV Parser';
        }
    }, 500);
});
