/**
 * Main Application UI Logic & Event Handlers
 */
document.addEventListener('DOMContentLoaded', () => {

    // --- State Variables ---
    let transactions = StorageManager.loadTransactions();
    const recentQueue = new RecentQueue(5);

    function syncRecentQueue() {
        recentQueue.clear();
        const start = Math.max(0, transactions.length - 5);
        for (let i = start; i < transactions.length; i++) {
            recentQueue.enqueue(transactions[i]);
        }
    }
    syncRecentQueue();

    // Currency Formatter
    const currencyFormat = new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR'
    });

    // --- DOM Elements ---
    const navItems = document.querySelectorAll('.nav-item');
    const viewPanels = document.querySelectorAll('.view-panel');

    // Dashboard Metric Labels
    const lblBalance = document.getElementById('lblBalance');
    const lblIncome = document.getElementById('lblIncome');
    const lblExpense = document.getElementById('lblExpense');
    const lblCount = document.getElementById('lblCount');
    const lblHighest = document.getElementById('lblHighest');
    const lblLowest = document.getElementById('lblLowest');
    const lblHighInc = document.getElementById('lblHighInc');
    const lblHighExp = document.getElementById('lblHighExp');

    // Queue Table Body
    const tbodyQueue = document.getElementById('tbodyQueue');

    // Add Form Elements
    const formAdd = document.getElementById('formAdd');
    const txtId = document.getElementById('txtId');
    const txtDate = document.getElementById('txtDate');
    const txtDesc = document.getElementById('txtDesc');
    const cbType = document.getElementById('cbType');
    const cbCategory = document.getElementById('cbCategory');
    const txtAmount = document.getElementById('txtAmount');
    const btnAutoId = document.getElementById('btnAutoId');
    const toastMsg = document.getElementById('toastMsg');

    // History Table Elements
    const tbodyHistory = document.getElementById('tbodyHistory');
    const lblHistoryCount = document.getElementById('lblHistoryCount');
    const btnExportCSV = document.getElementById('btnExportCSV');
    const btnRefreshHistory = document.getElementById('btnRefreshHistory');

    // Analytics Elements
    const tbodyCategory = document.getElementById('tbodyCategory');
    const lblTopCategory = document.getElementById('lblTopCategory');
    const lblTotalExpenseSummary = document.getElementById('lblTotalExpenseSummary');
    const barChartWrapper = document.getElementById('barChartWrapper');

    const btnResetData = document.getElementById('btnResetData');

    // --- Navigation Handlers ---
    navItems.forEach(item => {
        item.addEventListener('click', () => {
            const targetView = item.getAttribute('data-view');
            navItems.forEach(n => n.classList.remove('active'));
            viewPanels.forEach(p => p.classList.remove('active'));

            item.classList.add('active');
            const targetEl = document.getElementById(targetView);
            if (targetEl) targetEl.classList.add('active');

            updateAllViews();
        });
    });

    // --- Auto Generate Transaction ID ---
    function generateAutoId() {
        const nextId = "TX" + (transactions.length + 101);
        txtId.value = nextId;
    }
    if (btnAutoId) btnAutoId.addEventListener('click', generateAutoId);

    // Set today date as default
    if (txtDate) txtDate.value = new Date().toISOString().split('T')[0];
    generateAutoId();

    // --- Add Transaction Form Submission ---
    if (formAdd) {
        formAdd.addEventListener('submit', (e) => {
            e.preventDefault();

            const id = txtId.value.trim();
            const date = txtDate.value.trim();
            const description = txtDesc.value.trim();
            const type = cbType.value;
            const category = cbCategory.value;
            const amountStr = txtAmount.value.trim();

            if (!id) {
                showToast("Transaction ID cannot be empty.", "error");
                txtId.focus();
                return;
            }

            if (transactions.some(t => t.id.toLowerCase() === id.toLowerCase())) {
                showToast(`Transaction ID '${id}' already exists. Please use a unique ID.`, "error");
                return;
            }

            if (!description) {
                showToast("Description cannot be empty.", "error");
                txtDesc.focus();
                return;
            }

            const amount = parseFloat(amountStr);
            if (isNaN(amount) || amount <= 0) {
                showToast("Amount must be a valid number greater than 0.", "error");
                txtAmount.focus();
                return;
            }

            const newTx = { id, date, description, type, category, amount };

            transactions.push(newTx);
            recentQueue.enqueue(newTx);

            StorageManager.saveTransactions(transactions);

            showToast(`Success: Transaction ${id} added successfully!`, "success");

            txtDesc.value = '';
            txtAmount.value = '';
            txtDate.value = new Date().toISOString().split('T')[0];
            generateAutoId();

            updateAllViews();
        });
    }

    function showToast(msg, type) {
        if (!toastMsg) return;
        toastMsg.textContent = type === 'success' ? '✅ ' + msg : '❌ ' + msg;
        toastMsg.className = 'toast-msg ' + (type === 'success' ? 'toast-success' : 'toast-error');
    }

    // --- Delete Transaction Handler ---
    window.deleteTransaction = function(id) {
        if (confirm(`Are you sure you want to delete transaction '${id}'?`)) {
            transactions = transactions.filter(t => t.id !== id);
            syncRecentQueue();
            StorageManager.saveTransactions(transactions);
            updateAllViews();
        }
    };

    // Reset Data
    if (btnResetData) {
        btnResetData.addEventListener('click', () => {
            if (confirm("Reset transaction dataset to initial 18 sample records?")) {
                transactions = StorageManager.resetToDefault();
                syncRecentQueue();
                updateAllViews();
                alert("Dataset reset to defaults!");
            }
        });
    }

    // CSV Export
    if (btnExportCSV) {
        btnExportCSV.addEventListener('click', () => {
            StorageManager.exportCSV(transactions);
        });
    }

    if (btnRefreshHistory) {
        btnRefreshHistory.addEventListener('click', () => {
            updateAllViews();
        });
    }

    // --- Core Update View Function ---
    function updateAllViews() {
        const stats = ArrayStatsEngine.calculateTotals(transactions);
        if (lblBalance) lblBalance.textContent = currencyFormat.format(stats.balance);
        if (lblIncome) lblIncome.textContent = currencyFormat.format(stats.income);
        if (lblExpense) lblExpense.textContent = currencyFormat.format(stats.expenses);
        if (lblCount) lblCount.textContent = stats.count;

        const maxTx = ArrayStatsEngine.findHighestTransaction(transactions);
        const minTx = ArrayStatsEngine.findLowestTransaction(transactions);
        const highInc = ArrayStatsEngine.findHighestIncome(transactions);
        const highExp = ArrayStatsEngine.findHighestExpense(transactions);

        if (lblHighest) lblHighest.textContent = maxTx ? currencyFormat.format(maxTx.amount) : "₹0.00";
        if (lblLowest) lblLowest.textContent = minTx ? currencyFormat.format(minTx.amount) : "₹0.00";

        if (lblHighInc) lblHighInc.textContent = highInc ? `Highest Income: ${currencyFormat.format(highInc.amount)} (${highInc.description})` : "Highest Income: None";
        if (lblHighExp) lblHighExp.textContent = highExp ? `Highest Expense: ${currencyFormat.format(highExp.amount)} (${highExp.description})` : "Highest Expense: None";

        // Recent Queue Table
        if (tbodyQueue) {
            tbodyQueue.innerHTML = '';
            recentQueue.getItems().forEach(tx => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td><b>${tx.id}</b></td>
                    <td>${tx.date}</td>
                    <td>${tx.description}</td>
                    <td><span class="badge ${tx.type.toLowerCase() === 'income' ? 'badge-income' : 'badge-expense'}">${tx.type}</span></td>
                    <td style="font-weight: bold;">${currencyFormat.format(tx.amount)}</td>
                `;
                tbodyQueue.appendChild(tr);
            });
        }

        // Transaction History Table
        if (tbodyHistory) {
            tbodyHistory.innerHTML = '';
            transactions.forEach(tx => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td><b>${tx.id}</b></td>
                    <td>${tx.date}</td>
                    <td>${tx.description}</td>
                    <td><span class="badge ${tx.type.toLowerCase() === 'income' ? 'badge-income' : 'badge-expense'}">${tx.type}</span></td>
                    <td>${tx.category}</td>
                    <td style="font-weight: bold; text-align: right;">${currencyFormat.format(tx.amount)}</td>
                    <td style="text-align: center;">
                        <button class="btn-danger" onclick="deleteTransaction('${tx.id}')">Delete</button>
                    </td>
                `;
                tbodyHistory.appendChild(tr);
            });
        }
        if (lblHistoryCount) lblHistoryCount.textContent = `Showing ${transactions.length} total transactions`;

        // Category Analytics
        updateAnalyticsView(stats.expenses);
    }

    function updateAnalyticsView(totalExpense) {
        if (!tbodyCategory) return;
        const hashMap = CategoryHashMapEngine.getCategoryWiseExpenses(transactions);
        tbodyCategory.innerHTML = '';

        let topCat = 'None';
        let maxVal = 0;

        const colors = [
            '#ef4444', '#f59e0b', '#0ea5e9', '#8b5cf6',
            '#10b981', '#ec4899', '#64748b', '#3b82f6'
        ];

        if (barChartWrapper) barChartWrapper.innerHTML = '';

        let colorIdx = 0;
        for (const [cat, val] of Object.entries(hashMap)) {
            const pct = totalExpense > 0 ? (val / totalExpense) * 100 : 0;

            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td><b>${cat}</b></td>
                <td style="font-weight: bold;">${currencyFormat.format(val)}</td>
                <td>${pct.toFixed(1)}%</td>
            `;
            tbodyCategory.appendChild(tr);

            if (val > maxVal) {
                maxVal = val;
                topCat = cat;
            }

            if (barChartWrapper) {
                const barHeightPct = maxVal > 0 ? (val / Math.max(maxVal, 1)) * 100 : 0;
                const barCol = document.createElement('div');
                barCol.className = 'bar-col';
                barCol.innerHTML = `
                    <span class="bar-val">${val > 0 ? '₹' + Math.round(val) : '₹0'}</span>
                    <div class="bar-fill" style="height: ${Math.max(barHeightPct, 4)}%; background-color: ${colors[colorIdx % colors.length]};"></div>
                    <span class="bar-label">${cat.length > 5 ? cat.substring(0, 4) + '.' : cat}</span>
                `;
                barChartWrapper.appendChild(barCol);
            }
            colorIdx++;
        }

        if (lblTopCategory) lblTopCategory.textContent = `Highest Spending Category: ${topCat} (${currencyFormat.format(maxVal)})`;
        if (lblTotalExpenseSummary) lblTotalExpenseSummary.textContent = `Total Aggregated Expenses: ${currencyFormat.format(totalExpense)}`;
    }

    // Initial Load
    updateAllViews();
});
