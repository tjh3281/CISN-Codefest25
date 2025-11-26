/**
 * XENBER ENTERPRISE OPS LOGIC
 * ===========================
 * * TABLE OF CONTENTS:
 * 1. CSV Data & Math (Linear Regression)
 * 2. Database State (The "Brain" of the app)
 * 3. Charts & Rendering (Drawing the screen)
 * 4. User Actions (BUTTONS with PROMPTS)
 * 5. Simulation Loop (The Heartbeat)
 * 6. Intelligent Business Chatbot (The "Advisor")
 */

// ==========================================
// PART 1: CSV DATA & MATH HELPERS
// ==========================================
const csvRawData = `Date,Daily_Revenue,New_Leads,Active_Users,Avg_Employee_Mood_Score,Overtime_Hours_Logged,Code_Commits,System_Error_Rate,Cloud_Cost,Risk_Flag
2025-11-01,15400,45,1250,8.5,12,85,0.02%,450,Low
2025-11-02,16200,52,1310,8.4,15,92,0.02%,465,Low
2025-11-03,15800,48,1290,8.2,18,88,0.05%,460,Low
2025-11-04,14500,41,1200,7.9,25,110,0.12%,510,Medium
2025-11-05,13200,35,1150,7.1,42,145,2.50%,850,High
2025-11-06,12800,30,1100,6.5,55,160,3.20%,920,Critical
2025-11-07,13500,38,1180,6.8,48,130,1.80%,780,High
2025-11-08,14900,44,1240,7.2,30,105,0.50%,600,Medium
2025-11-09,15600,50,1295,7.8,20,95,0.15%,490,Low
2025-11-10,16500,55,1350,8.1,14,90,0.05%,470,Low
2025-11-11,17100,58,1380,8.3,12,88,0.04%,475,Low
2025-11-12,16800,56,1370,8.2,16,92,0.08%,480,Low
2025-11-13,17500,62,1420,8.0,22,100,0.10%,520,Medium
2025-11-14,18200,65,1450,7.6,35,125,0.45%,610,Medium
2025-11-15,19000,70,1500,7.4,40,135,0.90%,700,High`;

function parseCSV(csv) {
    const lines = csv.trim().split('\n');
    const headers = lines[0].trim().split(',');
    return lines.slice(1).map(line => {
        const values = line.trim().split(',');
        let obj = {};
        headers.forEach((header, i) => {
            let val = values[i];
            if (!isNaN(val)) val = Number(val);
            obj[header.trim()] = val;
        });
        return obj;
    });
}

function calculateTrendAndForecast(dataArray, daysToPredict) {
    const n = dataArray.length;
    let sumX = 0, sumY = 0, sumXY = 0, sumXX = 0;
    for (let i = 0; i < n; i++) {
        sumX += i; sumY += dataArray[i]; sumXY += i * dataArray[i]; sumXX += i * i;
    }
    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;
    let predictions = [];
    for (let i = 1; i <= daysToPredict; i++) {
        let val = (slope * (n - 1 + i)) + intercept;
        let randomVariance = (Math.random() * val * 0.05) - (val * 0.025);
        predictions.push(Math.round(val + randomVariance));
    }
    return predictions;
}

const historicalData = parseCSV(csvRawData);
const pastRevenue = historicalData.map(d => d.Daily_Revenue);
const pastLeads = historicalData.map(d => d.New_Leads * 300); 
const pastDates = historicalData.map(d => d.Date.slice(5)); 
const futureRevenue = calculateTrendAndForecast(pastRevenue, 7);
const futureLeads = calculateTrendAndForecast(pastLeads, 7);

let lastDate = new Date("2025-11-15");
let futureDates = [];
for(let i=1; i<=7; i++) {
    let d = new Date(lastDate);
    d.setDate(d.getDate() + i);
    futureDates.push((d.getMonth()+1) + "-" + d.getDate());
}

// ==========================================
// PART 2: THE DATABASE (STATE)
// ==========================================
const database = {
    currentCloud: 'Google BigQuery',
    companySavings: 450000,
    timeLabels: ['09:00', '10:00', '11:00', '12:00', '13:00'], 
    loadHistory: [45, 50, 48, 55, 60],
    nextSimulatedHour: 14, 
    
    employees: [
        { name: "Sarah J.", role: "Engineer", fatigue: 20, score: 95 },
        { name: "Mike R.", role: "Logistics", fatigue: 85, score: 60 }, 
        { name: "Jessica T.", role: "Sales", fatigue: 40, score: 88 },
        { name: "David B.", role: "Manager", fatigue: 55, score: 75 }
    ],
    machines: [
        { name: "Server Cluster A", type: "IT", health: 98 },
        { name: "Assembly Line 1", type: "Factory", health: 45 }, 
        { name: "Delivery Truck 4", type: "Fleet", health: 80 }
    ]
};

// ==========================================
// PART 3: SETUP (CHARTS & DISPLAY)
// ==========================================

const chartContext = document.getElementById('mainChart').getContext('2d');
const dashboardChart = new Chart(chartContext, {
    type: 'line',
    data: {
        labels: database.timeLabels,
        datasets: [{ 
            label: 'Actual Load', 
            data: database.loadHistory, 
            borderColor: '#3b82f6', 
            backgroundColor: 'rgba(59, 130, 246, 0.1)', 
            fill: true, 
            tension: 0.4 
        }]
    },
    options: { responsive: true, maintainAspectRatio: false, animation: { duration: 500 } }
});

const allLabels = [...pastDates, ...futureDates];
const chartDataRevPast = [...pastRevenue, ...Array(7).fill(null)];
const chartDataRevFuture = [...Array(14).fill(null), pastRevenue[pastRevenue.length-1], ...futureRevenue];
const chartDataLeadsPast = [...pastLeads, ...Array(7).fill(null)];
const chartDataLeadsFuture = [...Array(14).fill(null), pastLeads[pastLeads.length-1], ...futureLeads];

const ctxForecast = document.getElementById('forecastChart').getContext('2d');
const forecastChart = new Chart(ctxForecast, {
    type: 'line',
    data: {
        labels: allLabels,
        datasets: [
            { label: 'Revenue (Actual)', data: chartDataRevPast, borderColor: '#10b981', backgroundColor: 'rgba(16, 185, 129, 0.1)', fill: true, tension: 0.3 },
            { label: 'Revenue (Forecast)', data: chartDataRevFuture, borderColor: '#10b981', borderDash: [5, 5], pointStyle: 'rectRot', tension: 0.3 },
            { label: 'Leads (Indicator)', data: chartDataLeadsPast, borderColor: '#f59e0b', tension: 0.3 },
            { label: 'Leads (Forecast)', data: chartDataLeadsFuture, borderColor: '#f59e0b', borderDash: [5, 5], tension: 0.3 }
        ]
    },
    options: { responsive: true, maintainAspectRatio: false, interaction: { mode: 'index', intersect: false } }
});

function updateScreen() {
    const currentLoad = database.loadHistory[database.loadHistory.length - 1];
    document.getElementById('kpi-load').innerText = currentLoad + "%";
    document.getElementById('kpi-savings').innerText = "$" + database.companySavings.toLocaleString();
    
    let riskCount = 0;
    database.employees.forEach(e => { if(e.fatigue > 70) riskCount++; });
    database.machines.forEach(m => { if(m.health < 60) riskCount++; });
    document.getElementById('kpi-alerts').innerText = riskCount;

    const latest = historicalData[historicalData.length - 1];
    if(document.getElementById('blk-date')) {
        document.getElementById('blk-date').innerText = latest.Date;
        document.getElementById('blk-revenue').innerText = "$" + latest.Daily_Revenue.toLocaleString();
        document.getElementById('blk-leads').innerText = latest.New_Leads;
        document.getElementById('blk-users').innerText = latest.Active_Users.toLocaleString();
        document.getElementById('blk-errors').innerText = latest.System_Error_Rate;
        document.getElementById('blk-risk').innerText = latest.Risk_Flag;

        const riskCard = document.getElementById('blk-risk-card');
        const riskIcon = document.getElementById('blk-risk-icon');
        const riskDetails = document.getElementById('blk-risk-details');
        
        let riskReasons = [];
        if (parseFloat(latest.System_Error_Rate) > 1.0) riskReasons.push("High Error Rate");
        if (latest.Overtime_Hours_Logged > 30) riskReasons.push("High Overtime");
        if (latest.Avg_Employee_Mood_Score < 7.0) riskReasons.push("Low Morale");
        let riskText = riskReasons.length > 0 ? "Causes: " + riskReasons.join(", ") : "System Stable";

        if (latest.Risk_Flag === "Critical") {
            riskCard.style.borderLeftColor = "#ef4444"; 
            riskIcon.className = "fa-solid fa-triangle-exclamation text-red-500 animate-pulse";
            riskDetails.className = "mt-2 text-xs font-bold text-red-600 bg-red-50 p-2 rounded border border-red-100 block";
        } else if (latest.Risk_Flag === "High") {
            riskCard.style.borderLeftColor = "#f97316"; 
            riskIcon.className = "fa-solid fa-circle-exclamation text-orange-500";
            riskDetails.className = "mt-2 text-xs font-bold text-orange-600 bg-orange-50 p-2 rounded border border-orange-100 block";
        } else {
            riskCard.style.borderLeftColor = "#10b981"; 
            riskIcon.className = "fa-solid fa-circle-check text-green-500";
            riskDetails.className = "hidden";
        }
        riskDetails.innerText = riskText;
    }

    const projRev = futureRevenue[6];
    const currRev = pastRevenue[pastRevenue.length-1];
    const diff = projRev - currRev;
    if(document.getElementById('forecast-insight')) {
        document.getElementById('forecast-insight').innerHTML = `
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            <div class="p-4 bg-white rounded border"><div class="text-xs text-slate-400 uppercase">Last Revenue</div><div class="font-black text-2xl text-slate-700">$${currRev.toLocaleString()}</div></div>
            <div class="p-4 bg-white rounded border border-purple-200"><div class="text-xs text-slate-400 uppercase">7-Day Prediction</div><div class="font-black text-2xl text-purple-600">$${projRev.toLocaleString()}</div></div>
            <div class="p-4 bg-white rounded border"><div class="text-xs text-slate-400 uppercase">Trend</div><div class="font-black text-2xl ${diff > 0 ? 'text-green-500' : 'text-red-500'}">${diff > 0 ? '▲ UP' : '▼ DOWN'} $${Math.abs(diff).toLocaleString()}</div></div>
        </div>`;
    }

    dashboardChart.data.labels = database.timeLabels; 
    dashboardChart.data.datasets[0].data = database.loadHistory;
    dashboardChart.update();
    
    // REDRAW TABLES EVERY UPDATE
    drawTables();
    
    const advisorBox = document.getElementById('advisor-feed');
    if (latest.Risk_Flag === "Critical" || riskCount > 0) {
        advisorBox.innerHTML = `<div class="bg-red-900/50 p-3 rounded border border-red-500 text-red-200 text-xs"><i class="fa-solid fa-triangle-exclamation mr-2"></i><b>CRITICAL:</b> Risk Flag is ${latest.Risk_Flag}. ${riskCount} active risks detected.</div>`;
    } else {
        advisorBox.innerHTML = `<div class="bg-green-900/30 p-3 rounded border border-green-500 text-green-200 text-xs"><i class="fa-solid fa-check-circle mr-2"></i><b>OPTIMAL:</b> Systems stable. Forecast suggests growth.</div>`;
    }
}

// Generate HTML for buttons
function drawTables() {
    let fullW = "", dashW = "", fullR = "", dashR = "";
    
    // Employees
    database.employees.forEach((e, i) => {
        let btn = "", bg = "";
        
        // LOGIC FOR BUTTON TYPES
        if (e.fatigue > 80) { 
            // CRITICAL -> RED BUTTON
            btn = `<button onclick="actionRest(${i})" class="btn-action btn-red px-3 py-1 rounded text-xs font-bold w-full"><i class="fa-solid fa-bed"></i> URGENT REST</button>`; 
            bg = "bg-red-50"; 
        } else if (e.fatigue > 50) { 
            // WARNING -> AMBER BUTTON
            btn = `<button onclick="actionRest(${i})" class="btn-action btn-amber px-3 py-1 rounded text-xs font-bold w-full"><i class="fa-solid fa-coffee"></i> BREAK</button>`; 
        } else {
            // HEALTHY -> BLUE BUTTON
            btn = `<button onclick="actionTrain(${i})" class="btn-action btn-blue px-3 py-1 rounded text-xs font-bold w-full"><i class="fa-solid fa-book-open"></i> UPSKILL</button>`; 
        }
        
        // ADD TO FULL TABLE
        fullW += `<tr class="border-b ${bg}"><td class="p-4 font-bold">${e.name}</td><td class="p-4">${e.role}</td><td class="p-4">${e.fatigue}%</td><td class="p-4">${e.score}</td><td class="p-4 text-right w-32">${btn}</td></tr>`;

        // ADD TO DASHBOARD WIDGET (ALL ROWS ARE VISIBLE AND PRESSABLE)
        dashW += `<tr class="border-b"><td class="p-3 font-bold text-xs">${e.name} <span class="text-slate-400 text-[10px] ml-1">(${e.fatigue}%)</span></td><td class="p-3 text-right">${btn}</td></tr>`;
    });

    // Machines
    database.machines.forEach((m, i) => {
        let btn = "", bg = "";
        
        // LOGIC FOR BUTTON TYPES
        if (m.health < 50) { 
            // BROKEN -> RED BUTTON
            btn = `<button onclick="actionFix(${i})" class="btn-action btn-red px-3 py-1 rounded text-xs font-bold w-full"><i class="fa-solid fa-wrench"></i> FIX NOW</button>`; 
            bg = "bg-red-50"; 
        } else if (m.health < 80) {
            // NEEDS SERVICE -> AMBER BUTTON
            btn = `<button onclick="actionFix(${i})" class="btn-action btn-amber px-3 py-1 rounded text-xs font-bold w-full"><i class="fa-solid fa-oil-can"></i> SERVICE</button>`; 
        } else {
            // OPTIMIZED -> GREEN BUTTON
            btn = `<button onclick="actionFix(${i})" class="btn-action btn-green px-3 py-1 rounded text-xs font-bold w-full"><i class="fa-solid fa-sliders"></i> TUNE UP</button>`; 
        }
        
        // ADD TO FULL TABLE
        fullR += `<tr class="border-b ${bg}"><td class="p-4 font-bold">${m.name}</td><td class="p-4">${m.type}</td><td class="p-4">${Math.floor(m.health)}%</td><td class="p-4 text-right w-32">${btn}</td></tr>`;
        
        // ADD TO DASHBOARD WIDGET (ALL ROWS ARE VISIBLE AND PRESSABLE)
        dashR += `<tr class="border-b"><td class="p-3 font-bold text-xs">${m.name} <span class="text-slate-400 text-[10px] ml-1">(${m.health}%)</span></td><td class="p-3 text-right">${btn}</td></tr>`;
    });

    if(document.getElementById('full-workforce-table')) document.getElementById('full-workforce-table').innerHTML = fullW;
    if(document.getElementById('dash-workforce-table')) document.getElementById('dash-workforce-table').innerHTML = dashW;
    if(document.getElementById('full-resource-table')) document.getElementById('full-resource-table').innerHTML = fullR;
    if(document.getElementById('dash-resource-table')) document.getElementById('dash-resource-table').innerHTML = dashR;
}

// ==========================================
// PART 4: USER ACTIONS (PRESSABLE + PROMPTS)
// ==========================================

function switchView(viewName) {
    ['dashboard', 'forecast', 'workforce', 'maintenance'].forEach(v => {
        document.getElementById('view-' + v).classList.add('hidden');
        document.getElementById('btn-' + v).classList.remove('nav-active');
    });
    document.getElementById('view-' + viewName).classList.remove('hidden');
    document.getElementById('btn-' + viewName).classList.add('nav-active');
    
    const titles = { 'dashboard': 'Operational Dashboard', 'forecast': 'AI KPI Forecast', 'workforce': 'Workforce Hub', 'maintenance': 'Maintenance Scheduler' };
    document.getElementById('header-title').innerText = titles[viewName];
}

function toggleCloud() {
    database.currentCloud = (database.currentCloud === 'Google BigQuery') ? 'Azure Synapse' : 'Google BigQuery';
    if(document.getElementById('cloud-name')) document.getElementById('cloud-name').innerText = database.currentCloud;
    alert("System Notification: Data Source switched to " + database.currentCloud);
}

// ----------------------------------------------------
// DYNAMIC PROMPT LOGIC
// ----------------------------------------------------

function actionRest(index) {
    const emp = database.employees[index];
    let msg = "";
    
    if (emp.fatigue > 80) {
        msg = `⚠️ CRITICAL AUTHORIZATION:\n\n${emp.name} is dangerously fatigued (${emp.fatigue}%). \nAuthorize URGENT PAID LEAVE immediately?`;
    } else {
        msg = `☕ Break Request:\n\nApprove standard 15-min break for ${emp.name}? \n(Fatigue: ${emp.fatigue}%)`;
    }
    
    if (confirm(msg)) {
        emp.fatigue = 0; // Reset fatigue
        emp.score += 5;  // Morale boost
        updateScreen(); // INSTANTLY REFRESH UI
    }
}

function actionRestAll() {
    let userChoice = confirm(`⚠️ EXECUTIVE ORDER:\n\nSend ENTIRE STAFF on break? \nThis will reset all fatigue to 0% but halt production for 1 hour.`);
    if (userChoice) {
        database.employees.forEach(e => e.fatigue = 0);
        updateScreen();
    }
}

function actionTrain(index) {
    const emp = database.employees[index];
    let userChoice = confirm(`📚 Professional Development:\n\nPurchase "Advanced AI Workflow" course for ${emp.name}? \n\nCost: $200 \nProjected Score Gain: +10`);
    
    if (userChoice == true) {
        emp.score += 10;
        database.companySavings -= 200;
        updateScreen(); // INSTANTLY REFRESH UI
    }
}

function actionFix(index) {
    const machine = database.machines[index];
    let cost, type, msg;

    if (machine.health < 50) {
        cost = 1000; type = "EMERGENCY REPAIR";
        msg = `🚨 PRIORITY ALERT:\n\n${machine.name} is failing (${machine.health}%). \nAuthorize Emergency Repair Crew? \n\nCost: $${cost}`;
    } else if (machine.health < 80) {
        cost = 500; type = "Standard Service";
        msg = `🔧 Maintenance Request:\n\nSchedule standard service for ${machine.name}. \n\nCost: $${cost}`;
    } else {
        cost = 100; type = "Optimization Tune Up"; 
        msg = `✨ Optimization:\n\nPerform high-performance tuning on ${machine.name}? \n\nCost: $${cost}`;
    }
    
    if (confirm(msg)) {
        machine.health = 100;
        database.companySavings -= cost;
        updateScreen(); // INSTANTLY REFRESH UI
    }
}

function resetSimulation() { location.reload(); }

// ==========================================
// PART 5: SIMULATION LOOP
// ==========================================

setInterval(() => {
    const now = new Date();
    if(document.getElementById('live-clock')) {
        document.getElementById('live-clock').innerText = now.toLocaleTimeString('en-US', { hour12: false });
    }
}, 1000);

setInterval(() => {
    let newLoad = Math.floor(Math.random() * 30) + 50; 
    let nextTime = database.nextSimulatedHour + ":00";
    database.nextSimulatedHour++;
    if (database.nextSimulatedHour > 23) database.nextSimulatedHour = 0;

    database.loadHistory.push(newLoad);
    database.loadHistory.shift(); 
    database.timeLabels.push(nextTime);
    database.timeLabels.shift();

    // Degrade health over time to create problems to fix
    database.machines.forEach(machine => {
        if(machine.health > 0) machine.health -= 2; 
    });
    database.employees.forEach(emp => {
        if(emp.fatigue < 100) emp.fatigue += 1;
    });

    updateScreen();
}, 2000);

// ==========================================
// PART 6: INTELLIGENT ADVISOR (Chatbot)
// ==========================================

let isChatVisible = false;

function toggleChatVisibility() {
    isChatVisible = !isChatVisible;
    const windowEl = document.getElementById('chat-window');
    if (isChatVisible) {
        windowEl.classList.remove('chat-hidden');
        windowEl.classList.add('chat-visible');
    } else {
        windowEl.classList.remove('chat-visible');
        windowEl.classList.add('chat-hidden');
    }
}

function checkEnterKey(event) { if (event.key === 'Enter') handleUserMessage(); }

function handleUserMessage() {
    const inputField = document.getElementById('chat-input');
    const userText = inputField.value.trim();
    if (!userText) return;

    displayMessage(userText, 'user');
    inputField.value = '';

    setTimeout(() => {
        const aiReply = generateSmartAnswer(userText.toLowerCase());
        displayMessage(aiReply, 'ai');
    }, 800);
}

function displayMessage(text, sender) {
    const chatContainer = document.getElementById('chat-messages');
    const messageWrapper = document.createElement('div');
    if (sender === 'user') {
        messageWrapper.className = "flex justify-end";
        messageWrapper.innerHTML = `<div class="bg-blue-600 text-white p-3 rounded-2xl rounded-tr-none max-w-[85%] shadow-md text-sm">${text}</div>`;
    } else {
        messageWrapper.className = "flex justify-start";
        messageWrapper.innerHTML = `<div class="bg-slate-100 text-slate-800 p-3 rounded-2xl rounded-tl-none max-w-[85%] shadow-md border border-slate-200 text-sm leading-relaxed">${text}</div>`;
    }
    chatContainer.appendChild(messageWrapper);
    chatContainer.scrollTop = chatContainer.scrollHeight;
}

function generateSmartAnswer(question) {
    const latest = historicalData[historicalData.length-1];
    const brokenMachine = database.machines.find(m => m.health < 50);
    const tiredEmp = database.employees.find(e => e.fatigue > 80);
    
    if (question.includes("hello") || question.includes("hi")) {
        return "Hello. I'm ready to review the Q4 numbers or discuss operational risks. Where should we start?";
    }

    if (question.includes("kpi") || question.includes("performance") || question.includes("numbers")) {
        const growth = ((futureRevenue[6] - latest.Daily_Revenue) / latest.Daily_Revenue * 100).toFixed(1);
        const sentiment = growth > 0 ? "positive" : "concerning";
        return `<b>Executive Summary:</b><br>
                1. <b>Revenue:</b> $${latest.Daily_Revenue.toLocaleString()} (Daily)<br>
                2. <b>Forecast:</b> Tracking for ${growth}% growth over 7 days.<br>
                3. <b>Efficiency:</b> Error rates are at ${latest.System_Error_Rate}.<br>
                <i>Assessment: The trend is ${sentiment}, but watch the error rate closely.</i>`;
    }

    if (question.includes("alert") || question.includes("problem") || question.includes("status")) {
        if (brokenMachine) return `🚨 <b>Priority One:</b> We have a hardware failure in <b>${brokenMachine.name}</b>. This is costing us approx $100/hour in potential downtime. Please deploy the maintenance team immediately via the Dashboard.`;
        if (tiredEmp) return `⚠️ <b>HR Notice:</b> ${tiredEmp.name} is showing fatigue signs (>80%). This is a liability. Recommend immediate rotation or rest.`;
        return "✅ <b>Operational Status:</b> All systems are nominal. No immediate interventions required.";
    }

    if (question.includes("cost") || question.includes("money")) {
        return `I've reviewed the P&L. We have accumulated <b>$${database.companySavings.toLocaleString()}</b> in efficiency savings. <br><br>However, cloud costs are creeping up ($${latest.Cloud_Cost}). I suggest auditing our BigQuery usage patterns to keep margins healthy.`;
    }
    
    if (question.includes("staff") || question.includes("team")) {
        return `The team's average mood score is <b>${latest.Avg_Employee_Mood_Score}/10</b>. <br><br><b>Advice:</b> Keep overtime below 20 hours. Burnout is the #1 killer of productivity in this sector.`;
    }

    if (question.includes("strategy") || question.includes("advice")) {
        return `<b>Strategic Recommendation:</b><br>
                Given the high lead volume (${latest.New_Leads}), we should pivot to <b>Aggressive Scaling</b>. <br>
                1. Fix all machines.<br>
                2. Train staff to handle the load.<br>
                3. Monitor the Forecast chart for revenue dips.`;
    }

    return "I can provide a <b>KPI Breakdown</b>, conduct a <b>Risk Assessment</b>, or review <b>Financials</b>. What do you need?";
}

// Start
updateScreen();