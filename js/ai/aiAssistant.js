/**
 * AI Financial Assistant.
 * Combines deterministic financial data extraction with natural language strategy synthesis.
 * Explicitly designed for viva defense:
 * - Deterministic Layer: Computes exact math, savings rate, overbudget flags.
 * - Recommendation Layer: Synthesizes intelligent natural language insights.
 */
class AIFinancialAssistant {

    /**
     * Generates a comprehensive AI Financial Executive Audit.
     */
    static generateExecutiveAudit(transactions) {
        const metrics = InsightsEngine.calculateMetrics(transactions);
        const budgetAnalysis = BudgetTracker.analyzeBudgets(metrics.categoryExpenses);
        const overBudgets = budgetAnalysis.filter(b => b.isOverBudget);

        const summaryParts = [];
        const actionItems = [];

        // 1. Overview Synthesis
        if (metrics.netBalance >= 0) {
            summaryParts.push(`Your net cash flow is positive at **₹${metrics.netBalance.toLocaleString('en-IN')}** with a **${metrics.savingsRate}% savings rate**.`);
        } else {
            summaryParts.push(`⚠️ You are currently operating at a financial deficit of **₹${Math.abs(metrics.netBalance).toLocaleString('en-IN')}**.`);
        }

        // 2. Spending Pattern Analysis
        if (metrics.topCategory !== 'None') {
            const topPct = metrics.totalExpense > 0 ? ((metrics.topCategoryAmount / metrics.totalExpense) * 100).toFixed(1) : 0;
            summaryParts.push(`Your primary spending driver is **${metrics.topCategory}**, accounting for **₹${metrics.topCategoryAmount.toLocaleString('en-IN')} (${topPct}% of expenses)**.`);
        }

        // 3. Budget Audit
        if (overBudgets.length > 0) {
            const overCats = overBudgets.map(b => b.category).join(', ');
            summaryParts.push(`🚨 You have exceeded your target budget limits in **${overBudgets.length} category(ies)**: ${overCats}.`);
            overBudgets.forEach(b => {
                actionItems.push(`Reduce spending on **${b.category}** by at least ₹${Math.abs(b.remaining).toLocaleString('en-IN')} to get back on budget.`);
            });
        } else {
            summaryParts.push(`✅ All category expenditures are within your defined target budget allocations.`);
        }

        // 4. Strategic Recommendations
        if (metrics.savingsRate < 20) {
            const targetSave = metrics.totalIncome * 0.20;
            const diff = targetSave - (metrics.totalIncome - metrics.totalExpense);
            actionItems.push(`To reach a healthy 20% savings rate (₹${Math.round(targetSave).toLocaleString('en-IN')}), reduce total non-essential expenses by **₹${Math.round(diff).toLocaleString('en-IN')}**.`);
        } else {
            actionItems.push(`Maintain your current savings discipline! Consider putting excess savings into automated low-risk investments.`);
        }

        if (metrics.topDay !== 'None') {
            actionItems.push(`Peak spending occurred on **${metrics.topDay}** (₹${metrics.topDayAmount.toLocaleString('en-IN')}). Audit transactions on this date for impulse purchases.`);
        }

        return {
            headline: metrics.netBalance >= 0 ? "Solid Financial Health Overview" : "Action Required: Financial Deficit",
            summary: summaryParts.join(' '),
            actionItems: actionItems,
            metrics: metrics
        };
    }

    /**
     * Answers interactive user queries about finances deterministically.
     */
    static answerQuery(queryStr, transactions) {
        const query = queryStr.toLowerCase();
        const metrics = InsightsEngine.calculateMetrics(transactions);
        const budgetAnalysis = BudgetTracker.analyzeBudgets(metrics.categoryExpenses);

        if (query.includes('savings') || query.includes('save')) {
            return `💡 **Savings Analysis**: Your current savings rate is **${metrics.savingsRate}%** (₹${(metrics.totalIncome - metrics.totalExpense).toLocaleString('en-IN')}). Standard financial guidelines recommend saving at least 20% of total income.`;
        } else if (query.includes('highest') || query.includes('top') || query.includes('most')) {
            return `🏷️ **Top Spending Category**: You spent the most on **${metrics.topCategory}** (₹${metrics.topCategoryAmount.toLocaleString('en-IN')}). Your highest single spending day was **${metrics.topDay}** (₹${metrics.topDayAmount.toLocaleString('en-IN')}).`;
        } else if (query.includes('budget') || query.includes('limit')) {
            const over = budgetAnalysis.filter(b => b.isOverBudget);
            if (over.length > 0) {
                const details = over.map(b => `${b.category} (Spent ₹${b.actualSpent} vs Limit ₹${b.budgetLimit})`).join(', ');
                return `⚠️ **Budget Overruns**: You are over budget in ${over.length} category(ies): ${details}.`;
            } else {
                return `✅ **Budget Status**: Great news! You are currently within budget limits across all categories.`;
            }
        } else if (query.includes('summary') || query.includes('overview') || query.includes('status')) {
            return `📊 **Financial Summary**: Income: ₹${metrics.totalIncome.toLocaleString('en-IN')}, Expenses: ₹${metrics.totalExpense.toLocaleString('en-IN')}, Net Balance: ₹${metrics.netBalance.toLocaleString('en-IN')}.`;
        } else {
            return `🤖 **AI Assistant Insight**: Total transactions analyzed: ${transactions.length}. Net balance is ₹${metrics.netBalance.toLocaleString('en-IN')} with ${metrics.savingsRate}% savings rate. You can ask me about "savings rate", "highest spending", "budget status", or "financial summary".`;
        }
    }
}
