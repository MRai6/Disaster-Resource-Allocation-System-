// app_two_resources.js

// Zone object shape:
// { id: number, foodDemand: number, waterDemand: number, urgency: number, distance: number }

// -------- Zone row creation & reading --------

function createZoneRow(idValue = "", foodValue = "", waterValue = "", urgencyValue = "") {
  const row = document.createElement("div");
  row.className = "zone-row";

  row.innerHTML = `
    <label>
      Zone ID
      <input type="number" class="zone-id" value="${idValue}">
    </label>
    <label>
      Food demand
      <input type="number" class="zone-food" value="${foodValue}" min="0" max="100">
    </label>
    <label>
      Water demand
      <input type="number" class="zone-water" value="${waterValue}" min="0" max="100">
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
    const foodInput = row.querySelector(".zone-food");
    const waterInput = row.querySelector(".zone-water");
    const urgencyInput = row.querySelector(".zone-urgency");
    const distInput = row.querySelector(".zone-distance");

    const id = Number(idInput.value);
    const foodDemand = Number(foodInput.value);
    const waterDemand = Number(waterInput.value);
    const urgency = Number(urgencyInput.value);
    const distance = distInput ? Number(distInput.value) : 0;

    if (
      !Number.isFinite(id) ||
      !Number.isFinite(foodDemand) ||
      !Number.isFinite(waterDemand) ||
      !Number.isFinite(urgency) ||
      !Number.isFinite(distance)
    ) {
      console.warn(`Invalid data in zone row ${index + 1}, skipping`);
      return;
    }

    zones.push({ id, foodDemand, waterDemand, urgency, distance });
  });

  return zones;
}

// -------- Allocation: urgency-based, two resources --------

function allocateUrgencyTwoResources(zones, totalFood, totalWater) {
  const zonesCopy = zones.map(z => ({ ...z }));
  zonesCopy.sort((a, b) => b.urgency - a.urgency);

  let remainingFood = totalFood;
  let remainingWater = totalWater;
  const results = [];

  for (const z of zonesCopy) {
    const foodSent = Math.min(z.foodDemand, remainingFood);
    const waterSent = Math.min(z.waterDemand, remainingWater);

    remainingFood -= foodSent;
    remainingWater -= waterSent;

    results.push({
      id: z.id,
      foodDemand: z.foodDemand,
      waterDemand: z.waterDemand,
      urgency: z.urgency,
      distance: z.distance,
      foodSent,
      waterSent
    });
  }

  return { results, remainingFood, remainingWater };
}

// -------- Rendering & metrics --------

function renderResults(results, remainingFood, remainingWater) {
  const tbody = document.querySelector("#resultsTable tbody");
  tbody.innerHTML = "";

  results.forEach(r => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${r.id}</td>
      <td>${r.foodDemand}</td>
      <td>${r.waterDemand}</td>
      <td>${r.urgency}</td>
      <td>${r.foodSent}</td>
      <td>${r.waterSent}</td>
    `;

    if (r.urgency >= 80) tr.classList.add("row-critical");
    else if (r.urgency >= 50) tr.classList.add("row-high");
    else tr.classList.add("row-normal");

    tbody.appendChild(tr);
  });

  const remainingText = document.getElementById("remainingSupplyText");
  remainingText.textContent =
    `Remaining at camp – Food: ${remainingFood}, Water: ${remainingWater}`;
}

function computeMetrics(results) {
  let fullyFood = 0, partialFood = 0, noneFood = 0;
  let fullyWater = 0, partialWater = 0, noneWater = 0;
  let totalFoodDemand = 0, totalWaterDemand = 0;
  let totalFoodSent = 0, totalWaterSent = 0;

  results.forEach(r => {
    totalFoodDemand += r.foodDemand;
    totalWaterDemand += r.waterDemand;
    totalFoodSent += r.foodSent;
    totalWaterSent += r.waterSent;

    if (r.foodSent === 0) noneFood++;
    else if (r.foodSent === r.foodDemand) fullyFood++;
    else partialFood++;

    if (r.waterSent === 0) noneWater++;
    else if (r.waterSent === r.waterDemand) fullyWater++;
    else partialWater++;
  });

  const foodCoverage = totalFoodDemand > 0 ? (totalFoodSent / totalFoodDemand) * 100 : 0;
  const waterCoverage = totalWaterDemand > 0 ? (totalWaterSent / totalWaterDemand) * 100 : 0;

  return {
    fullyFood, partialFood, noneFood,
    fullyWater, partialWater, noneWater,
    totalFoodDemand, totalWaterDemand,
    totalFoodSent, totalWaterSent,
    foodCoverage, waterCoverage
  };
}

function renderMetrics(results) {
  const metricsBox = document.getElementById("metricsBox");
  if (!metricsBox) return;

  const m = computeMetrics(results);

  metricsBox.innerHTML = `
    Zones: ${results.length} |
    Food – Fully: ${m.fullyFood}, Partial: ${m.partialFood}, None: ${m.noneFood},
    Coverage: ${m.totalFoodSent}/${m.totalFoodDemand} (${m.foodCoverage.toFixed(1)}%) |
    Water – Fully: ${m.fullyWater}, Partial: ${m.partialWater}, None: ${m.noneWater},
    Coverage: ${m.totalWaterSent}/${m.totalWaterDemand} (${m.waterCoverage.toFixed(1)}%)
  `;
}

// -------- Chart (two resources) --------

let allocationChartInstance = null;

function renderChart(results) {
  const canvas = document.getElementById("allocationChart");
  if (!canvas || typeof Chart === "undefined") return;

  const ctx = canvas.getContext("2d");
  const labels = results.map(r => `Zone ${r.id}`);
  const foodDemandData = results.map(r => r.foodDemand);
  const waterDemandData = results.map(r => r.waterDemand);
  const foodSentData = results.map(r => r.foodSent);
  const waterSentData = results.map(r => r.waterSent);

  if (allocationChartInstance) {
    allocationChartInstance.destroy();
  }

  allocationChartInstance = new Chart(ctx, {
    type: "bar",
    data: {
      labels,
      datasets: [
        {
          label: "Food demand",
          data: foodDemandData,
          backgroundColor: "rgba(59, 130, 246, 0.6)"
        },
        {
          label: "Food sent",
          data: foodSentData,
          backgroundColor: "rgba(37, 99, 235, 0.8)"
        },
        {
          label: "Water demand",
          data: waterDemandData,
          backgroundColor: "rgba(16, 185, 129, 0.5)"
        },
        {
          label: "Water sent",
          data: waterSentData,
          backgroundColor: "rgba(5, 150, 105, 0.8)"
        }
      ]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          labels: { color: "#e5e7eb" }
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

// -------- Road network drawing --------

function drawRoadNetwork(zones) {
  const canvas = document.getElementById("roadCanvas");
  if (!canvas) return;

  const ctx = canvas.getContext("2d");
  const w = canvas.width;
  const h = canvas.height;

  ctx.clearRect(0, 0, w, h);

  const nodes = [
    { id: 0, x: 60, y: h / 2, label: "Camp 0" }
  ];

  const n = zones.length;
  const radius = 55;
  const centerX = 220;
  const centerY = h / 2;

  zones.forEach((z, idx) => {
    const angle = (Math.PI * (idx + 1)) / (n + 1);
    const x = centerX + radius * Math.cos(angle);
    const y = centerY + radius * Math.sin(angle);
    nodes.push({ id: z.id, x, y, label: "Z" + z.id, distance: z.distance });
  });

  const camp = nodes[0];

  ctx.strokeStyle = "#4b5563";
  ctx.fillStyle = "#e5e7eb";
  ctx.lineWidth = 1.5;
  ctx.font = "10px system-ui";

  nodes.slice(1).forEach(nNode => {
    ctx.beginPath();
    ctx.moveTo(camp.x, camp.y);
    ctx.lineTo(nNode.x, nNode.y);
    ctx.stroke();

    const mx = (camp.x + nNode.x) / 2;
    const my = (camp.y + nNode.y) / 2;
    const d = nNode.distance ?? 0;
    ctx.fillText(d.toString(), mx + 4, my - 4);
  });

  nodes.forEach(nNode => {
    ctx.beginPath();
    ctx.arc(nNode.x, nNode.y, 10, 0, Math.PI * 2);
    ctx.fillStyle = nNode.id === 0 ? "#2563eb" : "#16a34a";
    ctx.fill();
    ctx.strokeStyle = "#0f172a";
    ctx.stroke();

    ctx.fillStyle = "#e5e7eb";
    ctx.fillText(nNode.label, nNode.x - 12, nNode.y - 14);
  });
}

// -------- Setup --------

function setup() {
  const zonesContainer = document.getElementById("zonesContainer");
  const addZoneBtn = document.getElementById("addZoneBtn");
  const runBtn = document.getElementById("runBtn");
  const totalFoodInput = document.getElementById("totalFood");
  const totalWaterInput = document.getElementById("totalWater");

  drawRoadNetwork([]);

  zonesContainer.appendChild(createZoneRow(1, 40, 20, 90));
  zonesContainer.appendChild(createZoneRow(2, 30, 30, 60));
  zonesContainer.appendChild(createZoneRow(3, 50, 10, 80));

  addZoneBtn.addEventListener("click", () => {
    zonesContainer.appendChild(createZoneRow());
    const zones = getZonesFromUI();
    drawRoadNetwork(zones);
  });

  runBtn.addEventListener("click", () => {
    const MAX_SUPPLY = 100;
    const totalFood = Number(totalFoodInput.value);
    const totalWater = Number(totalWaterInput.value);

    if (
      !Number.isFinite(totalFood) || totalFood < 0 || totalFood > MAX_SUPPLY ||
      !Number.isFinite(totalWater) || totalWater < 0 || totalWater > MAX_SUPPLY
    ) {
      alert("Food and water supply must be between 0 and " + MAX_SUPPLY + ".");
      return;
    }

    const zones = getZonesFromUI();
    if (zones.length === 0) {
      alert("Please add at least one zone.");
      return;
    }

    // validate urgency, food, water in 0–100
    for (const z of zones) {
      if (z.urgency < 0 || z.urgency > 100) {
        alert(`Urgency for zone ${z.id} must be between 0 and 100.`);
        return;
      }
      if (z.foodDemand < 0 || z.foodDemand > 100) {
        alert(`Food demand for zone ${z.id} must be between 0 and 100.`);
        return;
      }
      if (z.waterDemand < 0 || z.waterDemand > 100) {
        alert(`Water demand for zone ${z.id} must be between 0 and 100.`);
        return;
      }
    }

    drawRoadNetwork(zones);

    const { results, remainingFood, remainingWater } =
      allocateUrgencyTwoResources(zones, totalFood, totalWater);

    renderResults(results, remainingFood, remainingWater);
    renderMetrics(results);
    renderChart(results);
  });
}

document.addEventListener("DOMContentLoaded", setup);
