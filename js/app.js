/**
 * Central Controller & DOM Manager.
 * Orchestrates Clean Architecture layers:
 * 1. Storage Repository & Validator
 * 2. DSA Engines (Circular Queue, Multi-Predicate Search, Complexity-Aware Sorting)
 * 3. Analytics & Budget Engine
 * 4. AI Financial Assistant
 * 5. Unit Test Suite Runner
 */
document.addEventListener('DOMContentLoaded', () => {

    // --- State & Storage Initialization ---
    let transactions = TransactionRepository.loadAll();
    const recentQueue = new CircularQueue(5);

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
    const lblSavingsRate = document.getElementById('lblSavingsRate');
    const lblHighest = document.getElementById('lblHighest');
    const lblLowest = document.getElementById('lblLowest');

    const containerAlerts = document.getElementById('containerAlerts');
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

    // History Elements
    const tbodyHistory = document.getElementById('tbodyHistory');
    const lblHistoryCount = document.getElementById('lblHistoryCount');
    const btnExportCSV = document.getElementById('btnExportCSV');
    const btnRefreshHistory = document.getElementById('btnRefreshHistory');

    // Advanced Search & Sort Elements
    const cbSearchField = document.getElementById('cbSearchField');
    const txtSearchQuery = document.getElementById('txtSearchQuery');
    const txtStartDate = document.getElementById('txtStartDate');
    const txtEndDate = document.getElementById('txtEndDate');
    const txtMinAmount = document.getElementById('txtMinAmount');
    const txtMaxAmount = document.getElementById('txtMaxAmount');
    const cbSearchType = document.getElementById('cbSearchType');
    const cbSearchCategory = document.getElementById('cbSearchCategory');
    const btnRunSearch = document.getElementById('btnRunSearch');
    const btnResetSearch = document.getElementById('btnResetSearch');

    const cbSortAlgorithm = document.getElementById('cbSortAlgorithm');
    const cbSortField = document.getElementById('cbSortField');
    const cbSortOrder = document.getElementById('cbSortOrder');
    const btnRunSort = document.getElementById('btnRunSort');

    const lblAlgoMeta = document.getElementById('lblAlgoMeta');
    const badgeComplexity = document.getElementById('badgeComplexity');
    const tbodyDsaResults = document.getElementById('tbodyDsaResults');

    // Analytics Elements
    const tbodyCategory = document.getElementById('tbodyCategory');
    const lblTopCategory = document.getElementById('lblTopCategory');
    const lblTotalExpenseSummary = document.getElementById('lblTotalExpenseSummary');
    const barChartWrapper = document.getElementById('barChartWrapper');
    const containerBudgets = document.getElementById('containerBudgets');

    // AI Assistant Elements
    const aiHeadline = document.getElementById('aiHeadline');
    const aiSummary = document.getElementById('aiSummary');
    const aiActionList = document.getElementById('aiActionList');
    const txtAiQuery = document.getElementById('txtAiQuery');
    const btnAskAi = document.getElementById('btnAskAi');
    const aiQueryResponse = document.getElementById('aiQueryResponse');

    // Unit Test Elements
    const btnRunTests = document.getElementById('btnRunTests');
    const testResultsSummary = document.getElementById('testResultsSummary');
    const tbodyTestResults = document.getElementById('tbodyTestResults');

    const btnResetData = document.getElementById('btnResetData');

    // --- Navigation ---
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

    // --- Auto Generate ID ---
    function generateAutoId() {
        if (txtId) txtId.value = TransactionValidator.generateUniqueId(transactions);
    }
    if (btnAutoId) btnAutoId.addEventListener('click', generateAutoId);
    if (txtDate) txtDate.value = new Date().toISOString().split('T')[0];
    generateAutoId();

    // --- Add Form Submission ---
    if (formAdd) {
        formAdd.addEventListener('submit', (e) => {
            e.preventDefault();

            const candidateTx = {
                id: txtId.value.trim(),
                date: txtDate.value.trim(),
                description: txtDesc.value.trim(),
                type: cbType.value,
                category: cbCategory.value,
                amount: txtAmount.value.trim()
            };

            // Schema validation
            const val = TransactionValidator.validate(candidateTx, transactions);
            if (!val.isValid) {
                showToast(val.errors.join(' | '), 'error');
                return;
            }

            candidateTx.amount = parseFloat(candidateTx.amount);

            transactions.push(candidateTx);
            recentQueue.enqueue(candidateTx);

            transactions = TransactionRepository.saveAll(transactions);

            showToast(`Success: Transaction ${candidateTx.id} added!`, 'success');

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

    // --- Delete Transaction ---
    window.deleteTransaction = function(id) {
        if (confirm(`Are you sure you want to delete transaction '${id}'?`)) {
            transactions = transactions.filter(t => t.id !== id);
            syncRecentQueue();
            transactions = TransactionRepository.saveAll(transactions);
            updateAllViews();
        }
    };

    // --- Reset Data ---
    if (btnResetData) {
        btnResetData.addEventListener('click', () => {
            if (confirm("Reset transaction dataset to initial sample records?")) {
                transactions = TransactionRepository.resetToDefaults();
                syncRecentQueue();
                updateAllViews();
                alert("Dataset reset to defaults!");
            }
        });
    }

    // Export CSV
    if (btnExportCSV) btnExportCSV.addEventListener('click', () => TransactionRepository.exportCSV(transactions));
    if (btnRefreshHistory) btnRefreshHistory.addEventListener('click', updateAllViews);

    // --- Search Logic ---
    if (btnRunSearch) btnRunSearch.addEventListener('click', performSearch);
    function performSearch() {
        const filters = {
            query: txtSearchQuery.value,
            field: cbSearchField.value,
            startDate: txtStartDate.value,
            endDate: txtEndDate.value,
            minAmount: txtMinAmount.value,
            maxAmount: txtMaxAmount.value,
            type: cbSearchType.value,
            category: cbSearchCategory.value
        };

        const searchRes = SearchEngine.linearSearch(transactions, filters);
        renderDsaTable(searchRes.results);

        lblAlgoMeta.textContent = `Found ${searchRes.results.length} results (${searchRes.iterations} iterations scan, ${searchRes.timeMs}ms)`;
        badgeComplexity.textContent = `Linear Search: O(n)`;
    }

    if (btnResetSearch) {
        btnResetSearch.addEventListener('click', () => {
            txtSearchQuery.value = '';
            txtStartDate.value = '';
            txtEndDate.value = '';
            txtMinAmount.value = '';
            txtMaxAmount.value = '';
            cbSearchField.value = 'all';
            cbSearchType.value = 'All';
            cbSearchCategory.value = 'All';
            renderDsaTable(transactions);
            lblAlgoMeta.textContent = `Showing all ${transactions.length} records`;
            badgeComplexity.textContent = `O(1) Access`;
        });
    }

    // --- Sort Logic ---
    if (btnRunSort) btnRunSort.addEventListener('click', performSort);
    function performSort() {
        const algo = cbSortAlgorithm.value;
        const key = cbSortField.value;
        const order = cbSortOrder.value;

        let sortRes;
        if (algo === 'bubble') {
            sortRes = SortingEngine.bubbleSort(transactions, key, order);
        } else if (algo === 'selection') {
            sortRes = SortingEngine.selectionSort(transactions, key, order);
        } else if (algo === 'merge') {
            sortRes = SortingEngine.mergeSort(transactions, key, order);
        } else if (algo === 'quick') {
            sortRes = SortingEngine.quickSort(transactions, key, order);
        }

        renderDsaTable(sortRes.results);
        lblAlgoMeta.textContent = `${sortRes.algorithm} on '${key}' (${order.toUpperCase()}) | ${sortRes.comparisons} comparisons, ${sortRes.swaps} swaps in ${sortRes.timeMs}ms`;
        badgeComplexity.textContent = `${sortRes.algorithm}: ${sortRes.complexity}`;
    }

    // --- AI Assistant Interactive Q&A ---
    if (btnAskAi) {
        btnAskAi.addEventListener('click', () => {
            const query = txtAiQuery.value.trim();
            if (!query) return;
            const answer = AIFinancialAssistant.answerQuery(query, transactions);
            aiQueryResponse.style.display = 'block';
            aiQueryResponse.innerHTML = answer;
        });
    }

    // --- Live Unit Tests Runner ---
    if (btnRunTests) {
        btnRunTests.addEventListener('click', runUnitTests);
    }

    function runUnitTests() {
        const testRes = UnitTestRunner.runAllTests();

        testResultsSummary.innerHTML = `
            <div style="display: flex; gap: 15px; font-weight: bold; font-size: 14px;">
                <span style="color: var(--color-income);">Passed: ${testRes.passed}/${testRes.total}</span>
                <span style="color: var(--color-expense);">Failed: ${testRes.failed}</span>
                <span style="color: var(--text-muted);">Time: ${testRes.executionTimeMs}ms</span>
            </div>
        `;

        tbodyTestResults.innerHTML = '';
        testRes.results.forEach((r, idx) => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td><b>Test #${idx + 1}</b></td>
                <td>${r.name}</td>
                <td>
                    <span class="badge ${r.status === 'PASS' ? 'badge-income' : 'badge-expense'}">${r.status}</span>
                </td>
            `;
            tbodyTestResults.appendChild(tr);
        });
    }

    // --- Core Master UI Refresh ---
    function updateAllViews() {
        const metrics = InsightsEngine.calculateMetrics(transactions);

        if (lblBalance) lblBalance.textContent = currencyFormat.format(metrics.netBalance);
        if (lblIncome) lblIncome.textContent = currencyFormat.format(metrics.totalIncome);
        if (lblExpense) lblExpense.textContent = currencyFormat.format(metrics.totalExpense);
        if (lblSavingsRate) lblSavingsRate.textContent = `${metrics.savingsRate}%`;

        const maxTx = ArrayStatsEngine.findHighestTransaction(transactions);
        const minTx = ArrayStatsEngine.findLowestTransaction(transactions);

        if (lblHighest) lblHighest.textContent = maxTx ? currencyFormat.format(maxTx.amount) : "₹0.00";
        if (lblLowest) lblLowest.textContent = minTx ? currencyFormat.format(minTx.amount) : "₹0.00";

        // Render Financial Alerts
        if (containerAlerts) {
            containerAlerts.innerHTML = '';
            metrics.alerts.forEach(a => {
                const div = document.createElement('div');
                div.className = `alert-box alert-${a.type}`;
                div.innerHTML = `<strong>${a.title}</strong><br>${a.message}`;
                containerAlerts.appendChild(div);
            });
        }

        // Render Recent Queue Table (O(1) Ring Buffer)
        if (tbodyQueue) {
            tbodyQueue.innerHTML = '';
            recentQueue.toArray().forEach(tx => {
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

        // Render Transaction History
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

        // Render Search/Sort Table
        renderDsaTable(transactions);

        // Render Category Analytics & Bar Chart
        updateAnalyticsView(metrics);

        // Render AI Executive Audit
        updateAiView();

        // Render Budget Tracker
        updateBudgetView(metrics.categoryExpenses);
    }

    function renderDsaTable(list) {
        if (!tbodyDsaResults) return;
        tbodyDsaResults.innerHTML = '';
        list.forEach(tx => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td><b>${tx.id}</b></td>
                <td>${tx.date}</td>
                <td>${tx.description}</td>
                <td><span class="badge ${tx.type.toLowerCase() === 'income' ? 'badge-income' : 'badge-expense'}">${tx.type}</span></td>
                <td>${tx.category}</td>
                <td style="font-weight: bold; text-align: right;">${currencyFormat.format(tx.amount)}</td>
            `;
            tbodyDsaResults.appendChild(tr);
        });
    }

    function updateAnalyticsView(metrics) {
        if (!tbodyCategory) return;
        tbodyCategory.innerHTML = '';

        const colors = [
            '#ef4444', '#f59e0b', '#0ea5e9', '#8b5cf6',
            '#10b981', '#ec4899', '#64748b', '#3b82f6'
        ];

        if (barChartWrapper) barChartWrapper.innerHTML = '';

        let colorIdx = 0;
        for (const [cat, val] of Object.entries(metrics.categoryExpenses)) {
            const pct = metrics.totalExpense > 0 ? (val / metrics.totalExpense) * 100 : 0;

            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td><b>${cat}</b></td>
                <td style="font-weight: bold;">${currencyFormat.format(val)}</td>
                <td>${pct.toFixed(1)}%</td>
            `;
            tbodyCategory.appendChild(tr);

            if (barChartWrapper) {
                const barHeightPct = metrics.topCategoryAmount > 0 ? (val / metrics.topCategoryAmount) * 100 : 0;
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

        if (lblTopCategory) lblTopCategory.textContent = `Highest Spending Category: ${metrics.topCategory} (${currencyFormat.format(metrics.topCategoryAmount)})`;
        if (lblTotalExpenseSummary) lblTotalExpenseSummary.textContent = `Total Aggregated Expenses: ${currencyFormat.format(metrics.totalExpense)}`;
    }

    function updateAiView() {
        if (!aiHeadline) return;
        const audit = AIFinancialAssistant.generateExecutiveAudit(transactions);
        aiHeadline.textContent = "🤖 AI Executive Financial Audit: " + audit.headline;
        aiSummary.innerHTML = audit.summary;

        aiActionList.innerHTML = '';
        audit.actionItems.forEach(item => {
            const li = document.createElement('li');
            li.innerHTML = item;
            aiActionList.appendChild(li);
        });
    }

    function updateBudgetView(categoryExpenses) {
        if (!containerBudgets) return;
        const analysis = BudgetTracker.analyzeBudgets(categoryExpenses);
        containerBudgets.innerHTML = '';

        analysis.forEach(b => {
            const itemDiv = document.createElement('div');
            itemDiv.style.marginBottom = '14px';

            const statusColor = b.isOverBudget ? '#ef4444' : (b.percentage >= 80 ? '#f59e0b' : '#10b981');

            itemDiv.innerHTML = `
                <div style="display: flex; justify-content: space-between; font-size: 13px; font-weight: bold; margin-bottom: 4px;">
                    <span>${b.category}</span>
                    <span>${currencyFormat.format(b.actualSpent)} / ${currencyFormat.format(b.budgetLimit)} (${b.percentage}%)</span>
                </div>
                <div class="progress-bar-container">
                    <div class="progress-bar-fill" style="width: ${Math.min(100, b.percentage)}%; background-color: ${statusColor};"></div>
                </div>
            `;
            containerBudgets.appendChild(itemDiv);
        });
    }

    // Initial Master Refresh
    updateAllViews();

    // Auto-run tests once on load
    runUnitTests();
});
