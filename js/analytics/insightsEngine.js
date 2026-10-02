/**
 * Financial Insights Engine.
 * Calculates savings rate, monthly income/expense breakdowns, highest/lowest transactions,
 * highest spending day/category, and generates deterministic financial health alerts.
 */
class InsightsEngine {

    /**
     * Calculates comprehensive financial metrics.
     */
    static calculateMetrics(transactions) {
        let totalIncome = 0;
        let totalExpense = 0;

        let maxTx = null;
        let minTx = null;

        const categoryExpenses = {};
        const dailyExpenses = {};
        const monthlySummary = {}; // { "2026-08": { income: 0, expense: 0 } }

        for (let i = 0; i < transactions.length; i++) {
            const tx = transactions[i];
            const amount = parseFloat(tx.amount) || 0;
            const dateStr = tx.date;
            const monthStr = dateStr ? dateStr.substring(0, 7) : 'Unknown';

            // Track highest and lowest transaction overall
            if (!maxTx || amount > maxTx.amount) maxTx = tx;
            if (!minTx || amount < minTx.amount) minTx = tx;

            if (!monthlySummary[monthStr]) {
                monthlySummary[monthStr] = { income: 0, expense: 0 };
            }

            if (tx.type.toLowerCase() === 'income') {
                totalIncome += amount;
                monthlySummary[monthStr].income += amount;
            } else if (tx.type.toLowerCase() === 'expense') {
                totalExpense += amount;
                monthlySummary[monthStr].expense += amount;

                // Category tracking
                const cat = tx.category || 'Other';
                categoryExpenses[cat] = (categoryExpenses[cat] || 0) + amount;

                // Daily tracking
                dailyExpenses[dateStr] = (dailyExpenses[dateStr] || 0) + amount;
            }
        }

        const netBalance = totalIncome - totalExpense;
        const savings = totalIncome - totalExpense;
        const savingsRate = totalIncome > 0 ? Math.max(0, (savings / totalIncome) * 100) : 0;

        // Highest spending category
        let topCategory = 'None';
        let topCategoryAmount = 0;
        for (const [cat, amt] of Object.entries(categoryExpenses)) {
            if (amt > topCategoryAmount) {
                topCategoryAmount = amt;
                topCategory = cat;
            }
        }

        // Highest spending day
        let topDay = 'None';
        let topDayAmount = 0;
        for (const [day, amt] of Object.entries(dailyExpenses)) {
            if (amt > topDayAmount) {
                topDayAmount = amt;
                topDay = day;
            }
        }

        return {
            totalIncome,
            totalExpense,
            netBalance,
            savingsRate: +savingsRate.toFixed(1),
            highestTransaction: maxTx,
            lowestTransaction: minTx,
            categoryExpenses,
            dailyExpenses,
            monthlySummary,
            topCategory,
            topCategoryAmount,
            topDay,
            topDayAmount,
            alerts: InsightsEngine.generateAlerts({
                totalIncome,
                totalExpense,
                netBalance,
                savingsRate,
                topCategory,
                topCategoryAmount,
                transactions
            })
        };
    }

    /**
     * Generates deterministic financial health alerts.
     */
    static generateAlerts({ totalIncome, totalExpense, netBalance, savingsRate, topCategory, topCategoryAmount, transactions }) {
        const alerts = [];

        // Alert 1: Negative Balance
        if (netBalance < 0) {
            alerts.push({
                type: 'danger',
                title: '⚠️ Deficit / Negative Balance Alert',
                message: `Your total expenses exceed your income by ₹${Math.abs(netBalance).toLocaleString('en-IN')}. Immediate spending cuts are required.`
            });
        }

        // Alert 2: High Expense Ratio (> 80%)
        const expenseRatio = totalIncome > 0 ? (totalExpense / totalIncome) * 100 : 100;
        if (expenseRatio > 80 && netBalance >= 0) {
            alerts.push({
                type: 'warning',
                title: '⚡ High Expense Ratio Warning',
                message: `You are spending ${expenseRatio.toFixed(1)}% of your income. Financial experts recommend keeping expenses below 70%.`
            });
        }

        // Alert 3: Category Concentration (> 35% of total expenses in 1 category)
        if (totalExpense > 0 && (topCategoryAmount / totalExpense) > 0.35) {
            const pct = ((topCategoryAmount / totalExpense) * 100).toFixed(1);
            alerts.push({
                type: 'info',
                title: `📌 Concentration in ${topCategory}`,
                message: `${topCategory} accounts for ${pct}% of your total spending (₹${topCategoryAmount.toLocaleString('en-IN')}).`
            });
        }

        // Alert 4: Healthy Savings Praise
        if (savingsRate >= 20) {
            alerts.push({
                type: 'success',
                title: '🌟 Healthy Savings Rate',
                message: `Great job! Your savings rate is ${savingsRate}%, exceeding the 20% benchmark.`
            });
        }

        return alerts;
    }
}
