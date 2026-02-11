// app.js

// { id: number, demand: number, urgency: number }

function createZoneRow(idValue = "", demandValue = "", urgencyValue = "") {
  const row = document.createElement("div");
  row.className = "zone-row";

  row.innerHTML = `
    <label>
      Zone ID
      <input type="number" class="zone-id" value="${idValue}">
    </label>
    <label>
      Demand
      <input type="number" class="zone-demand" value="${demandValue}">
    </label>
    <label>
      Urgency
      <input type="number" class="zone-urgency" value="${urgencyValue}" min="0" max="100">
    </label>
    <label>
      Distance from Camp
      <input type="number" class="zone-distance" value="10">
    </label>

    <button type="button" class="remove-zone-btn">Remove</button>
  `;

  row.querySelector(".remove-zone-btn").addEventListener("click", () => {
    row.remove();
  });

  return row;
}

function getZonesFromUI() {
  const rows = document.querySelectorAll("#zonesContainer .zone-row");
  const zones = [];

  rows.forEach((row, index) => {
    const idInput = row.querySelector(".zone-id");
    const demandInput = row.querySelector(".zone-demand");
    const urgencyInput = row.querySelector(".zone-urgency");
    const distInput = row.querySelector(".zone-distance");

    const id = Number(idInput.value);
    const demand = Number(demandInput.value);
    const urgency = Number(urgencyInput.value);
    const distance = distInput ? Number(distInput.value) : 0;

    if (!Number.isFinite(id) || !Number.isFinite(demand) || !Number.isFinite(urgency) || !Number.isFinite(distance)) {
      console.warn(`Invalid data in zone row ${index + 1}, skipping`);
      return;
    }

    zones.push({ id, demand, urgency, distance });
  });

  return zones;
}

// -------- Allocation strategies --------

function allocateGreedyByUrgency(zones, totalSupply) {
  const zonesCopy = zones.map(z => ({ ...z }));
  zonesCopy.sort((a, b) => b.urgency - a.urgency);

  let remaining = totalSupply;
  const results = [];

  for (const z of zonesCopy) {
    if (remaining <= 0) {
      results.push({ ...z, sent: 0 });
      continue;
    }

    const requested = z.demand;
    const sent = Math.min(requested, remaining);

    results.push({ ...z, sent });
    remaining -= sent;
  }

  return { results, remaining };
}

function allocateGreedyByDemand(zones, totalSupply) {
  const zonesCopy = zones.map(z => ({ ...z }));
  zonesCopy.sort((a, b) => b.demand - a.demand);

  let remaining = totalSupply;
  const results = [];

  for (const z of zonesCopy) {
    const sent = remaining > 0 ? Math.min(z.demand, remaining) : 0;
    remaining -= sent;
    results.push({ ...z, sent });
  }
  return { results, remaining };
}

function allocateRoundRobin(zones, totalSupply) {
  const zonesCopy = zones.map(z => ({ ...z, remainingDemand: z.demand }));
  const resultsMap = new Map();
  zonesCopy.forEach(z => resultsMap.set(z.id, 0));

  let remaining = totalSupply;
  let index = 0;

  while (remaining > 0 && zonesCopy.some(z => z.remainingDemand > 0)) {
    const z = zonesCopy[index];

    if (z.remainingDemand > 0) {
      z.remainingDemand--;
      remaining--;
      resultsMap.set(z.id, resultsMap.get(z.id) + 1);
    }

    index = (index + 1) % zonesCopy.length;
  }

  const results = zones.map(z => ({
    id: z.id,
    demand: z.demand,
    urgency: z.urgency,
    sent: resultsMap.get(z.id) || 0
  }));

  return { results, remaining };
}

// -------- Rendering & metrics --------

function renderResults(results, remaining) {
  const tbody = document.querySelector("#resultsTable tbody");
  tbody.innerHTML = "";

  results.forEach(r => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${r.id}</td>
      <td>${r.demand}</td>
      <td>${r.urgency}</td>
      <td>${r.sent}</td>
    `;

    // urgency-based row colors
    if (r.urgency >= 80) tr.classList.add("row-critical");
    else if (r.urgency >= 50) tr.classList.add("row-high");
    else tr.classList.add("row-normal");

    tbody.appendChild(tr);
  });

  const remainingText = document.getElementById("remainingSupplyText");
  remainingText.textContent = `Remaining supply at camp: ${remaining}`;
}

function computeMetrics(results, totalSupply) {
  let fully = 0, partial = 0, none = 0;
  let totalDemand = 0, totalSent = 0;

  results.forEach(r => {
    totalDemand += r.demand;
    totalSent += r.sent;
    if (r.sent === 0) none++;
    else if (r.sent === r.demand) fully++;
    else partial++;
  });

  const coverage = totalDemand > 0 ? (totalSent / totalDemand) * 100 : 0;
  return { fully, partial, none, totalDemand, totalSent, coverage, totalSupply };
}

function renderMetrics(results, remaining, totalSupply) {
  const metricsBox = document.getElementById("metricsBox");
  if (!metricsBox) return;

  const totalSent = results.reduce((s, r) => s + r.sent, 0);
  const m = computeMetrics(results, totalSupply);

  metricsBox.innerHTML = `
    Zones: ${results.length} |
    Fully served: ${m.fully} |
    Partially served: ${m.partial} |
    Not served: ${m.none} |
    Demand met: ${m.totalSent}/${m.totalDemand} (${m.coverage.toFixed(1)}%) |
    Supply used: ${totalSent}/${totalSupply}
  `;
}

// Optional: simple bar chart if Chart.js is loaded
let allocationChartInstance = null;

function renderChart(results) {
  const canvas = document.getElementById("allocationChart");
  if (!canvas || typeof Chart === "undefined") return;

  const ctx = canvas.getContext("2d");
  const labels = results.map(r => `Zone ${r.id}`);
  const demandData = results.map(r => r.demand);
  const sentData = results.map(r => r.sent);

  if (allocationChartInstance) {
    allocationChartInstance.destroy();
  }

  allocationChartInstance = new Chart(ctx, {
    type: "bar",
    data: {
      labels,
      datasets: [
        {
          label: "Demand",
          data: demandData,
          backgroundColor: "rgba(59, 130, 246, 0.6)"
        },
        {
          label: "Sent",
          data: sentData,
          backgroundColor: "rgba(16, 185, 129, 0.7)"
        }
      ]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          labels: {
            color: "#e5e7eb"
          }
        }
      },
      scales: {
        x: {
          ticks: { color: "#e5e7eb" },
          grid: { display: false }
        },
        y: {
          ticks: { color: "#e5e7eb" },
          grid: { color: "rgba(55,65,81,0.5)" },
          beginAtZero: true
        }
      }
    }
  });
}

// -------- Setup --------

function setup() {
  const zonesContainer = document.getElementById("zonesContainer");
  const addZoneBtn = document.getElementById("addZoneBtn");
  const runBtn = document.getElementById("runBtn");
  const strategySelect = document.getElementById("strategySelect");
  const totalSupplyInput = document.getElementById("totalSupply");

  // Optional: start with no zones in the drawing
  drawRoadNetwork([]);

  zonesContainer.appendChild(createZoneRow(1, 40, 90));
  zonesContainer.appendChild(createZoneRow(2, 30, 60));
  zonesContainer.appendChild(createZoneRow(3, 50, 80));

  addZoneBtn.addEventListener("click", () => {
    zonesContainer.appendChild(createZoneRow());
    const zones = getZonesFromUI();
    drawRoadNetwork(zones);
  });

  runBtn.addEventListener("click", () => {
    // ... existing run logic ...
  });

  runBtn.addEventListener("click", () => {
    const MAX_SUPPLY = 100;
    const totalSupply = Number(totalSupplyInput.value);
    if (!Number.isFinite(totalSupply) || totalSupply < 0 || totalSupply > MAX_SUPPLY) {
      alert("Total supply must be between 0 and " + MAX_SUPPLY + ".");
      return;
    }

    const zones = getZonesFromUI();
    if (zones.length === 0) {
      alert("Please add at least one zone.");
      return;
    }

    //Urgency validation0-100
    for(const z of zones){
        if(z.urgency < 0 || z.urgency > 100){
            alert(`Urgency for zone ${z.id} must be between 0 and 100.`);
            return
        }
    }

    const strategy = strategySelect.value;
    let allocation;

    if (strategy === "demand") {
      allocation = allocateGreedyByDemand(zones, totalSupply);
    } else if (strategy === "roundrobin") {
      allocation = allocateRoundRobin(zones, totalSupply);
    } else {
      allocation = allocateGreedyByUrgency(zones, totalSupply);
    }

    const { results, remaining } = allocation;

    renderResults(results, remaining);
    renderMetrics(results, remaining, totalSupply);
    renderChart(results);
  });
}


function drawRoadNetwork(zones) {
    const canvas = document.getElementById("roadCanvas");
  if (!canvas) return;

  const ctx = canvas.getContext("2d");
  const w = canvas.width;
  const h = canvas.height;

  ctx.clearRect(0, 0, w, h);

  // Camp node at left
  const nodes = [
    { id: 0, x: 60, y: h / 2, label: "Camp 0" }
  ];

  // Place zones around in a circle/arc for visibility
  const n = zones.length;
  const radius = 55;
  const centerX = 220;
  const centerY = h / 2;

  zones.forEach((z, idx) => {
    const angle = (Math.PI * (idx + 1)) / (n + 1); // spread along semicircle
    const x = centerX + radius * Math.cos(angle);
    const y = centerY + radius * Math.sin(angle);
    nodes.push({ id: z.id, x, y, label: "Z" + z.id, distance: z.distance });
  });

  const camp = nodes[0];

  ctx.strokeStyle = "#4b5563";
  ctx.fillStyle = "#e5e7eb";
  ctx.lineWidth = 1.5;
  ctx.font = "10px system-ui";

  // Draw edges camp -> each zone with distance label
  nodes.slice(1).forEach(n => {
    ctx.beginPath();
    ctx.moveTo(camp.x, camp.y);
    ctx.lineTo(n.x, n.y);
    ctx.stroke();

    const mx = (camp.x + n.x) / 2;
    const my = (camp.y + n.y) / 2;
    const d = n.distance ?? 0;
    ctx.fillText(d.toString(), mx + 4, my - 4);
  });

  // Draw nodes
  nodes.forEach(n => {
    ctx.beginPath();
    ctx.arc(n.x, n.y, 10, 0, Math.PI * 2);
    ctx.fillStyle = n.id === 0 ? "#2563eb" : "#16a34a";
    ctx.fill();
    ctx.strokeStyle = "#0f172a";
    ctx.stroke();

    ctx.fillStyle = "#e5e7eb";
    ctx.fillText(n.label, n.x - 12, n.y - 14);
  });
  

}

document.addEventListener("DOMContentLoaded", setup);
