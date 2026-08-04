# Bethel Radon Root Cause Investigation Website

A professional, multi-page web application built for advanced environmental analysis and root cause investigation of indoor radon fluctuations at the **Bethel Location**. 

## Core Features
* **Smart Time-Slicing Engine:** Navigate massive datasets (37,000+ rows) instantly. Use the built-in time controls and navigation arrows to page through data by the hour, day, week, or all-time without lag.
* **Auto-Downsampling & Parsing:** The app automatically detects CSV delimiters (commas or semicolons) and seamlessly forward-fills sparse Airthings data (where temp is logged every 5 mins but radon only hourly) so charts render without breaking.
* **30 Distinct Analytical Graph Views:** Ranging from multi-variable overlays, stack-effect differentials, barometric pressure correlations, and volatility indexes to polar radar profiles and statistical distributions.
* **External Meteorological Data Layers:** Automatically correlates local weather phenomena (outside temperature, barometric pressure, wind speed, cumulative rainfall, severe storm/tornado threat indices) against indoor sensor metrics.
* **Strict Viewport Containment:** Single-screen layout enforced via CSS flexbox. Zero default scrolling required; content scales proportionally while preserving optimal widescreen graph ratios in both portrait and landscape orientations. Full pinch-to-zoom enabled.
* **App Health Monitor:** Built-in diagnostics tracking DOM element integrity, memory usage, raw data ingestion, and live downsampling rendering status.

## Quick Start
1. Clone or download this repository.
2. Export your raw data from the Airthings web dashboard.
3. Name the file `data.csv` and place it in the `data/` folder (replacing the placeholder).
4. Open `index.html` in any modern web browser.
