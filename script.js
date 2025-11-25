/**
 * XENBER SAAS ENGINE
 * ==================
 * Features:
 * 1. Multi-View Navigation (Dashboard, Workforce, Resources)
 * 2. Interactive HR Actions (Rest, Train, Promote)
 * 3. Interactive Maintenance Actions (Fix Asset)
 * 4. Cloud Integration (BigQuery/Azure Switching)
 */

// --- CONFIGURATION ---
const CONFIG = {
    updateSpeed: 2000,
    costPerHour: 1500,
    anomalyThreshold: 85
};

// --- DATA STATE ---
let activeSource = 'bq'; 
let activeView = 'dashboard';
let timeData = { actual: [], predicted: [], labels: [] };
let anomalies = [];
let savingsYTD = 425000;

// WORKFORCE
let employees = [
    { name: "Sarah J.", role: "Senior Eng", efficiency: 1.8, status: "Optimal", fatigue: 20 },
    { name: "Mike R.", role: "Logistics", efficiency: 0.6, status: "Struggling", fatigue: 85 },
    { name: "Jessica T.", role: "Sales Lead", efficiency: 1.4, status: "Optimal", fatigue: 30 },
    { name: "David B.", role: "Ops Mgr", efficiency: 0.9, status: "Stable", fatigue: 55 },
    { name: "Emily W.", role: "Technician", efficiency: 2.1, status: "Star", fatigue: 15 }
];

// ASSETS
let assets = [
    { id: "Cloud-Cluster-A", load: 45, health: 98, type: "Server" },
    { id: "Assembly-Line-4", load: 92, health: 45, type: "Machine" }, // Needs Fix
    { id: "Delivery-Fleet", load: 60, health: 88, type: "Logistics" },
    { id: "Packaging-Bot-9", load: 75, health: 90, type: "Robotics" }
];


// --- NAVIGATION MANAGER (New!) ---
const nav = {
    switch: (viewId) => {
        activeView = viewId;
        
        // Update Nav Styles
        ['dashboard', 'workforce', 'resources'].forEach(id => {
            document.getElementById(`nav-${id}`).classList.remove('saas-active');
            document.getElementById(`view-${id}`).classList.add('hidden');
        });
        document.getElementById(`nav-${viewId}`).classList.add('saas-active');
        document.getElementById(`view-${viewId}`).classList.remove('hidden');

        // Update Header Title
        const titles = {
            'dashboard': 'Operational Intelligence Center',
            'workforce': 'Workforce Intelligence Hub',
            'resources': 'Predictive Maintenance Scheduler'
        };
        document.getElementById('page-title').innerText = titles[viewId];
        
        // Trigger immediate render of the new view
        updateSaaS();
    }
};

// --- INTERACTIVE OPERATIONS (New!) ---
const hrOps = {
    takeAction: (index, action) => {
        const emp = employees[index];
        if (action === 'rest') {
            emp.fatigue = 0;
            emp.efficiency += 0.2;
            alert(`✅ Approved Paid Time Off (PTO) for ${emp.name}. Fatigue reset.`);
        } else if (action === 'train') {
            emp.efficiency += 0.3;
            alert(`📚 Assigned 'Advanced Analytics' training to ${emp.name}.`);
        } else if (action === 'promote') {
            emp.efficiency += 0.1;
            alert(`⭐ Promotion Request submitted for ${emp.name}.`);
        }
        updateSaaS();
    }
};

const assetOps = {
    fixAsset: (index) => {
        const asset = assets[index];
        asset.health = 100;
        asset.load = 50; // Load balanced
        savingsYTD += 5000; // Immediate savings from preventing failure
        alert(`🔧 Maintenance Crew dispatched to ${asset.id}. Health restored to 100%.`);
        updateSaaS();
    }
};

// --- CLOUD MANAGER ---
const cloudManager = {
    switchSource: (source) => {
        if (source === activeSource) {
            activeSource = null;
            cloudManager.updateUI(null);
            alert("⚠️ Disconnected. Dashboard Offline.");
            return;
        }
        activeSource = source;
        document.getElementById('status-display').innerText = "Handshaking...";
        document.getElementById('status-display').className = "font-bold text-yellow-400";
        setTimeout(() => {
            cloudManager.updateUI(source);
            alert(`✅ Connected to ${source === 'bq' ? 'Google BigQuery' : 'Azure Synapse'}.`);
            timeData = { actual: [], predicted: [], labels: [] };
            chart.data.datasets[0].data = [];
            chart.data.datasets[1].data = [];
            chart.update();
        }, 500);
    },
    updateUI: (source) => {
        const bqBtn = document.getElementById('btn-bq');
        const azureBtn = document.getElementById('btn-azure');
        const bqDot = document.getElementById('dot-bq');
        const azureDot = document.getElementById('dot-azure');
        const headerLabel = document.getElementById('header-source-label');
        const chartSub = document.getElementById('chart-subtitle');
        const legendActual = document.getElementById('legend-actual');
        
        bqBtn.classList.remove('source-active');
        azureBtn.classList.remove('source-active');
        bqDot.className = "w-2 h-2 rounded-full bg-slate-600";
        azureDot.className = "w-2 h-2 rounded-full bg-slate-600";

        if (source === 'bq') {
            bqBtn.classList.add('source-active');
            bqDot.className = "w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_5px_rgba(34,197,94,0.6)]";
            headerLabel.innerText = "bigquery.xenber.prod.v2";
            headerLabel.className = "font-mono bg-slate-100 px-1 rounded text-blue-600";
            chart.data.datasets[0].borderColor = '#3b82f6'; 
            chart.data.datasets[0].backgroundColor = 'rgba(59, 130, 246, 0.1)';
            legendActual.className = "w-3 h-1 bg-blue-500";
            chartSub.innerHTML = '<i class="fa-brands fa-google"></i> Powered by BigQuery ML';
            document.getElementById('latency-display').innerText = "24ms";
            document.getElementById('status-display').innerText = "Streaming";
            document.getElementById('status-display').className = "font-bold text-blue-400";
            document.getElementById('connection-badge').className = "flex items-center gap-2 px-3 py-1 bg-green-50 text-green-700 rounded-full text-xs font-bold border border-green-200 transition-all";
            document.getElementById('connection-badge').innerHTML = '<i class="fa-solid fa-link"></i> Connected';
        } else if (source === 'azure') {
            azureBtn.classList.add('source-active');
            azureDot.className = "w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_5px_rgba(34,197,94,0.6)]";
            headerLabel.innerText = "synapse://xenber-analytics-hub";
            headerLabel.className = "font-mono bg-slate-100 px-1 rounded text-purple-600";
            chart.data.datasets[0].borderColor = '#a855f7'; 
            chart.data.datasets[0].backgroundColor = 'rgba(168, 85, 247, 0.1)';
            legendActual.className = "w-3 h-1 bg-purple-500";
            chartSub.innerHTML = '<i class="fa-brands fa-microsoft"></i> Powered by Azure Synapse';
            document.getElementById('latency-display').innerText = "18ms";
            document.getElementById('status-display').innerText = "Streaming";
            document.getElementById('status-display').className = "font-bold text-purple-400";
            document.getElementById('connection-badge').className = "flex items-center gap-2 px-3 py-1 bg-purple-50 text-purple-700 rounded-full text-xs font-bold border border-purple-200 transition-all";
            document.getElementById('connection-badge').innerHTML = '<i class="fa-solid fa-bolt"></i> Synapse Live';
        } else {
            headerLabel.innerText = "OFFLINE";
            headerLabel.className = "font-mono bg-slate-100 px-1 rounded text-slate-400";
            document.getElementById('status-display').innerText = "Disconnected";
            document.getElementById('status-display').className = "font-bold text-red-400";
            document.getElementById('latency-display').innerText = "--";
            document.getElementById('connection-badge').className = "flex items-center gap-2 px-3 py-1 bg-slate-100 text-slate-500 rounded-full text-xs font-bold border border-slate-200 transition-all";
            document.getElementById('connection-badge').innerHTML = '<i class="fa-solid fa-link-slash"></i> Offline';
        }
    }
};

// --- CORE AI MODULES ---

function generateForecast() {
    let now = new Date();
    let timeLabel = `${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}`;
    let base = 60;
    if (activeSource === 'bq') base = 60 + Math.sin(Date.now() / 2000) * 20;
    if (activeSource === 'azure') base = 60 + Math.cos(Date.now() / 1500) * 25;
    let noise = (Math.random() - 0.5) * 10;
    let actual = Math.max(10, Math.min(100, Math.floor(base + noise)));
    let trend = actual > 60 ? 1.1 : 0.9;
    let predicted = Math.floor(actual * trend);

    if (timeData.labels.length > 15) {
        timeData.actual.shift();
        timeData.predicted.shift();
        timeData.labels.shift();
    }
    timeData.actual.push(actual);
    timeData.predicted.push(predicted);
    timeData.labels.push(timeLabel);
    return { actual, predicted };
}

function detectAnomalies(load) {
    if (load > CONFIG.anomalyThreshold) {
        let id = Math.floor(Math.random() * 1000);
        anomalies.unshift({
            id: id,
            msg: `Load Spike (${load}%)`,
            type: activeSource === 'azure' ? "Synapse Alert" : "Critical",
            time: "Just now"
        });
        if (anomalies.length > 5) anomalies.pop();
    }
}

function runScheduler() {
    let widgetRows = "";
    let fullRows = "";
    let cycleSavings = 0;
    
    assets.forEach((asset, index) => {
        // Simulation Logic
        asset.load = Math.min(100, Math.max(0, asset.load + (Math.random() - 0.5) * 5));
        asset.health = Math.max(0, asset.health - (Math.random() * 0.5));

        // Status Logic
        let isCritical = asset.health < 60 || asset.load > 90;
        let statusText = isCritical ? (asset.health < 60 ? "Health Crit." : "Overload") : "Optimal";
        let statusColor = isCritical ? "text-red-600" : "text-green-600";
        let actionBtn = isCritical 
            ? `<button onclick="assetOps.fixAsset(${index})" class="bg-white border border-red-300 text-red-600 hover:bg-red-50 text-xs font-bold px-3 py-1 rounded shadow-sm">Fix Now</button>`
            : `<span class="text-slate-400 text-xs">No Action</span>`;

        if (isCritical) cycleSavings += 1250;

        // Widget Row (Condensed)
        widgetRows += `
        <tr class="hover:bg-slate-50">
            <td class="px-5 py-3">
                <div class="font-bold text-slate-700 text-sm">${asset.id}</div>
                <div class="text-[10px] font-bold ${statusColor}">${statusText}</div>
            </td>
            <td class="px-5 py-3 text-right align-middle">${actionBtn}</td>
        </tr>`;

        // Full View Row (Detailed)
        fullRows += `
        <tr class="hover:bg-slate-50 border-b border-slate-100 last:border-0">
            <td class="p-4 font-bold text-slate-700">${asset.id}</td>
            <td class="p-4 text-sm text-slate-500">${asset.type}</td>
            <td class="p-4">
                <div class="flex items-center gap-2">
                    <div class="w-24 h-2 bg-slate-200 rounded-full overflow-hidden">
                        <div class="h-full ${asset.health < 60 ? 'bg-red-500' : 'bg-green-500'}" style="width: ${asset.health}%"></div>
                    </div>
                    <span class="text-xs font-bold">${Math.floor(asset.health)}%</span>
                </div>
            </td>
            <td class="p-4 text-sm font-mono">${Math.floor(asset.load)}%</td>
            <td class="p-4 text-right">${actionBtn}</td>
        </tr>`;
    });

    return { widget: widgetRows, full: fullRows, savings: cycleSavings };
}

function analyzeWorkforce() {
    let widgetRows = "";
    let fullRows = "";
    
    employees.forEach((emp, index) => {
        // Simulation
        emp.fatigue = Math.min(100, emp.fatigue + (Math.random() * 2));
        if (emp.fatigue > 75) emp.efficiency -= 0.02;
        if (emp.fatigue < 50) emp.efficiency = Math.min(2.0, emp.efficiency + 0.01);
        
        // Button Logic
        let actionBtn = "";
        let statusColor = "";
        
        if (emp.fatigue > 80) {
            statusColor = "text-red-500";
            actionBtn = `<button onclick="hrOps.takeAction(${index}, 'rest')" class="bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 text-xs font-bold px-3 py-1 rounded">Rest</button>`;
        } else if (emp.efficiency < 0.8) {
            statusColor = "text-amber-500";
            actionBtn = `<button onclick="hrOps.takeAction(${index}, 'train')" class="bg-amber-50 text-amber-600 border border-amber-200 hover:bg-amber-100 text-xs font-bold px-3 py-1 rounded">Train</button>`;
        } else if (emp.efficiency > 1.5) {
            statusColor = "text-emerald-500";
            actionBtn = `<button onclick="hrOps.takeAction(${index}, 'promote')" class="bg-emerald-50 text-emerald-600 border border-emerald-200 hover:bg-emerald-100 text-xs font-bold px-3 py-1 rounded">Bonus</button>`;
        } else {
            statusColor = "text-blue-500";
            actionBtn = `<span class="text-xs text-slate-400">No Action</span>`;
        }

        // Widget Row
        widgetRows += `
        <tr class="hover:bg-slate-50">
            <td class="px-5 py-3">
                <div class="font-bold text-slate-700 text-sm">${emp.name}</div>
                <div class="text-[10px] text-slate-400 uppercase">${emp.role}</div>
            </td>
            <td class="px-5 py-3 text-right align-middle">
                ${actionBtn}
                <div class="text-[10px] text-slate-400 mt-1">Score: ${emp.efficiency.toFixed(2)}x</div>
            </td>
        </tr>`;

        // Full View Row
        fullRows += `
        <tr class="hover:bg-slate-50 border-b border-slate-100 last:border-0">
            <td class="p-4 font-bold text-slate-700">${emp.name}</td>
            <td class="p-4 text-sm text-slate-500">${emp.role}</td>
            <td class="p-4">
                <div class="flex items-center gap-2">
                    <span class="text-xs font-bold ${statusColor}">${Math.floor(emp.fatigue)}%</span>
                    <div class="w-20 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                        <div class="h-full ${emp.fatigue > 80 ? 'bg-red-500' : 'bg-blue-400'}" style="width: ${emp.fatigue}%"></div>
                    </div>
                </div>
            </td>
            <td class="p-4 text-sm font-mono font-bold">${emp.efficiency.toFixed(2)}x</td>
            <td class="p-4 text-right">${actionBtn}</td>
        </tr>`;
    });
    return { widget: widgetRows, full: fullRows };
}

function generateStrategicInsights() {
    let insights = [];
    if (Math.random() > 0.8) {
        insights.push({
            type: "Finance",
            color: "indigo",
            title: "Margin Optimization",
            text: `${activeSource === 'bq' ? 'BigQuery' : 'Synapse'} analysis: Cloud spend inefficient. Rec: Spot-Instances.`
        });
    }
    let tiredEmp = employees.filter(e => e.fatigue > 80).length;
    if (tiredEmp > 0) {
        insights.push({
            type: "HR",
            color: "amber",
            title: "Workforce Risk",
            text: `Synapse: ${tiredEmp} employees at high fatigue. Rec: Adjust Rosters.`
        });
    }
    return insights;
}

// --- INITIALIZATION ---
const ctx = document.getElementById('forecastChart').getContext('2d');
const chart = new Chart(ctx, {
    type: 'line',
    data: {
        labels: [],
        datasets: [
            {
                label: 'Actual Usage',
                borderColor: '#3b82f6',
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                borderWidth: 2,
                tension: 0.4,
                fill: true,
                data: []
            },
            {
                label: 'AI Prediction',
                borderColor: '#818cf8',
                borderWidth: 2,
                borderDash: [5, 5],
                tension: 0.4,
                pointRadius: 0,
                data: []
            }
        ]
    },
    options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: false,
        plugins: { legend: { display: false } },
        scales: { y: { beginAtZero: true, max: 120 } }
    }
});

// --- MASTER LOOP ---
function updateSaaS() {
    if (!activeSource) return; 

    const data = generateForecast();
    chart.data.labels = timeData.labels;
    chart.data.datasets[0].data = timeData.actual;
    chart.data.datasets[1].data = timeData.predicted;
    chart.update();

    detectAnomalies(data.actual);
    
    document.getElementById('kpi-load').innerText = data.actual + "%";
    document.getElementById('kpi-anomalies').innerText = anomalies.length;
    
    const scheduleResult = runScheduler();
    savingsYTD += scheduleResult.savings + Math.floor(Math.random() * 50);
    document.getElementById('kpi-savings').innerText = "$" + savingsYTD.toLocaleString();

    const feed = document.getElementById('anomaly-feed');
    if (anomalies.length > 0) {
        feed.innerHTML = anomalies.map(a => `
            <div class="alert-item p-3 bg-red-50 border border-red-100 rounded flex items-start gap-3">
                <i class="fa-solid fa-circle-exclamation text-red-500 mt-1"></i>
                <div>
                    <div class="text-sm font-bold text-red-700">${a.type}: ${a.msg}</div>
                    <div class="text-xs text-red-500">Detected: ${a.time}</div>
                </div>
            </div>
        `).join('');
    }

    // Update BOTH Widget and Full Views
    const wfData = analyzeWorkforce();
    document.getElementById('employee-table-widget').innerHTML = wfData.widget;
    document.getElementById('employee-table-full').innerHTML = wfData.full;

    document.getElementById('scheduler-table-widget').innerHTML = scheduleResult.widget;
    document.getElementById('scheduler-table-full').innerHTML = scheduleResult.full;

    const strategy = generateStrategicInsights();
    const strategyFeed = document.getElementById('strategy-feed');
    if (strategy.length > 0) {
        strategyFeed.innerHTML = strategy.slice(0, 2).map(s => `
            <div class="insight-item p-3 bg-slate-800 rounded border border-slate-700">
                <div class="flex items-center gap-2 mb-1">
                    <span class="text-${s.color}-400 text-[10px] font-bold uppercase tracking-wider border border-${s.color}-400/30 px-1 rounded">${s.type}</span>
                    <h3 class="font-bold text-sm text-white">${s.title}</h3>
                </div>
                <p class="text-xs text-slate-400 mt-1">${s.text}</p>
            </div>
        `).join('');
    }
}

// Start Engine
setInterval(updateSaaS, CONFIG.updateSpeed);
updateSaaS(); 

const system = {
    resetSimulation: () => {
        cloudManager.switchSource('bq');
    }
};