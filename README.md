🚑 Disaster Resource Allocation System
Disaster Resource Allocation System is a small simulation project that explores how to distribute limited relief supplies from a central camp to multiple affected zones in a disaster scenario. It combines a C backend for graph-based modeling and algorithms with a web dashboard frontend for interactive visualization.

✨ Features
🗺️ Model affected zones with:

Zone ID

Demand (units of relief)

Urgency (0–100)

Distance from camp (web UI)​

🧠 Multiple allocation strategies:

Greedy by urgency

Greedy by demand

Round-robin (fair share)​

⚙️ C backend:

Weighted directed graph representation of the road network

Dijkstra’s algorithm to compute shortest paths from the camp

Distance-aware allocation combining urgency and travel cost

📦 Priority queues (binary heaps) for:

Urgency/score-based selection of zones

Min-heap for Dijkstra’s algorithm​

📊 Web dashboard:

Configure zones and total supply

Run strategies and see allocation per zone in a table

Metrics (fully / partially / not served zones, coverage, supply usage)

Chart.js bar chart comparing demand vs sent units per zone

📂 Project Structure
main.c – CLI entry point for the C simulation (graph + multi-resource allocation).

allocation.c / allocation.h – Core allocation logic (urgency-based and urgency + distance).

graph.c / graph.h – Graph representation and Dijkstra’s shortest path implementation.

priority_queue.c / priority_queue.h – Binary heap priority queue used by allocation and Dijkstra.

web/

index.html – Web dashboard UI.

style.css – Dashboard styling.

app.js – Frontend logic, allocation strategies in JavaScript, metrics and chart rendering.

🌐 How to Run (Web Dashboard)
Go to the web folder.

Open index.html in your browser (Chrome/Edge/Firefox).

Adjust:

Total supply at camp.

Zone rows (ID, demand, urgency, distance).

Allocation strategy from the dropdown.

Click Run Allocation to see:

The allocation table

Remaining supply

Metrics and the bar chart

No build step is required; everything runs directly in the browser.​

🖥️ How to Run (C Simulation)
Make sure you have a C compiler installed (e.g. gcc).

From the project root, compile:

bash
gcc main.c allocation.c graph.c priority_queue.c -o allocation_sim
Run the executable:

bash
./allocation_sim       # Linux/macOS
allocation_sim.exe     # Windows
Follow the prompts to:

Enter nodes and directed edges for the road network.

Enter zone IDs, food and water demand, and urgency.

Enter total food and water supply at the camp.

The program prints allocation plans for:

Urgency-based allocation (food + water).

Urgency + distance-aware allocation using shortest-path distances.

🚀 Possible Extensions
Add more resource types (medicine, shelters, etc.).

Introduce vehicle capacity, travel time, or scheduling constraints.

Connect the C backend to the web UI via an API for end-to-end simulations.
