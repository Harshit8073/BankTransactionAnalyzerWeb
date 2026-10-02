/**
 * Budget Tracker Manager.
 * Manages category target budgets, compares against actual expenses, and calculates usage percentages.
 */
class BudgetTracker {
    static STORAGE_KEY = 'bank_analyzer_budgets';

    static getDefaultBudgets() {
        return {
            Food: 5000,
            Shopping: 4000,
            Travel: 3000,
            Education: 15000,
            Bills: 3000,
            Entertainment: 2000,
            Other: 2000
        };
    }

    static loadBudgets() {
        const stored = localStorage.getItem(BudgetTracker.STORAGE_KEY);
        if (!stored) {
            const defaults = BudgetTracker.getDefaultBudgets();
            BudgetTracker.saveBudgets(defaults);
            return defaults;
        }
        try {
            return JSON.parse(stored);
        } catch (e) {
            return BudgetTracker.getDefaultBudgets();
        }
    }

    static saveBudgets(budgets) {
        localStorage.setItem(BudgetTracker.STORAGE_KEY, JSON.stringify(budgets));
    }

    /**
     * Calculates budget vs actual spending analysis for each category.
     */
    static analyzeBudgets(categoryExpenses) {
        const budgets = BudgetTracker.loadBudgets();
        const analysis = [];

        for (const [category, budgetLimit] of Object.entries(budgets)) {
            const actualSpent = categoryExpenses[category] || 0;
            const percentage = budgetLimit > 0 ? (actualSpent / budgetLimit) * 100 : 0;
            const remaining = budgetLimit - actualSpent;
            const isOverBudget = actualSpent > budgetLimit;

            analysis.push({
                category,
                budgetLimit,
                actualSpent,
                remaining,
                percentage: +percentage.toFixed(1),
                isOverBudget,
                status: isOverBudget ? 'over' : (percentage >= 80 ? 'warning' : 'ok')
            });
        }

        return analysis;
    }
}
