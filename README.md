# Bethel Radon Root Cause Investigation Website

A professional, multi-page web application built for advanced environmental analysis and root cause investigation of indoor radon fluctuations at the **Bethel Location**. 

## Features
* **30 Distinct Analytical Graph Views:** Ranging from multi-variable overlays, stack-effect differentials, barometric pressure correlations, and volatility indexes to polar radar profiles and statistical distributions.
* **External Meteorological Data Layers:** Automatically correlates local weather phenomena (outside temperature, barometric pressure, wind speed, cumulative rainfall, severe storm/tornado threat indices) against indoor sensor metrics.
* **Sensor vs. External Naming Convention:** Cleanly differentiates internal sensor logs (`Sensor Temp`, `Sensor Humidity`) from external meteorological records (`Outside Temp`, `Outside Pressure`).
* **Strict Viewport Containment:** Single-screen layout enforced via CSS flexbox. Zero default scrolling required; content scales proportionally while preserving optimal widescreen graph ratios in both portrait and landscape device orientations. Full pinch-to-zoom enabled.
* **App Health Monitor (`health.html`):** Built-in diagnostics tracking DOM element integrity, memory usage, local data payload parsing efficiency, and rendering latency.
* **Modular Multi-File Architecture:** Clean separation of concerns with dedicated HTML templates, modular JavaScript controllers, centralized CSS styling, and an external `data.csv` backend that allows effortless drop-in data updates for any location.

## Quick Start
1. Clone or download this repository.
2. Ensure `data/data.csv` is present in the root directory.
3. Open `index.html` in any modern web browser.
