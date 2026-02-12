<h1 align="center">🚑 Disaster Resource Allocation System</h1>

<p align="center">
  <strong>Graph-Based Simulation for Intelligent Disaster Relief Distribution</strong>
</p>

<p align="center">
  A hybrid C + Web project that models and visualizes how limited relief
  supplies can be optimally allocated across disaster-affected zones.
</p>

---

## ✨ Overview

The **Disaster Resource Allocation System** is a simulation project that explores how limited relief supplies can be distributed from a central camp to multiple affected zones during a disaster scenario.

It combines:

- 🧠 A **C backend** for graph modeling and allocation algorithms  
- 🌐 A **Web dashboard frontend** for interactive visualization and strategy comparison  

---

## 🗺️ Zone Modeling

Each affected zone includes:

- Zone ID  
- Demand (units of relief)  
- Urgency score (0–100)  
- Distance from camp (Web UI)

---

## 🧠 Allocation Strategies

- **Greedy by Urgency** – Prioritizes most critical zones  
- **Greedy by Demand** – Prioritizes highest demand  
- **Round Robin (Fair Share)** – Distributes supply evenly  
- **Distance-Aware Allocation (C backend)** – Combines urgency with travel cost  

---

## ⚙️ C Backend

- Weighted directed graph representation of road networks  
- Dijkstra’s algorithm for shortest paths  
- Distance-aware scoring mechanism  
- Multi-resource allocation (food + water)  
- Binary heap priority queues  

---

## 📊 Web Dashboard

- Configure zones and total supply  
- Select allocation strategy  
- View allocation results in table format  
- Metrics:
  - Fully served zones  
  - Partially served zones  
  - Unserved zones  
  - Supply utilization  
- Chart.js bar chart (Demand vs Allocated Units)

---


---

## 🌐 Running the Web Dashboard

1. Navigate to the `web/` folder  
2. Open `index.html` in your browser  
3. Configure supply and zones  
4. Click **Run Allocation**

No build step required.

---

## 🖥️ Running the C Simulation

### Compile

```bash
gcc main.c allocation.c graph.c priority_queue.c -o allocation_sim

Run

Linux/macOS:

./allocation_sim


Windows:

allocation_sim.exe

```
## 🚀 Future Improvements

- Add additional resource types

- Introduce vehicle capacity constraints

- Add scheduling / travel time modeling

- Connect C backend with Web UI via API

- Real-time dynamic zone updates

## 🛠️ Tech Stack

- C – Core simulation & algorithms

- HTML / CSS / JavaScript – Web interface

- Chart.js – Data visualization

- GCC – Compilation

