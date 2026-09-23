/**
 * Data Storage Manager using browser localStorage.
 * Pre-populates 18 realistic sample transactions if storage is empty.
 */
class StorageManager {
    static STORAGE_KEY = 'bank_analyzer_transactions';

    /**
     * Gets initial sample transactions dataset.
     */
    static getSampleTransactions() {
        return [
            { id: "TX101", date: "2026-08-01", description: "Monthly Salary Credit", type: "Income", category: "Salary", amount: 45000.00 },
            { id: "TX102", date: "2026-08-02", description: "Supermarket Grocery Shopping", type: "Expense", category: "Food", amount: 1850.00 },
            { id: "TX103", date: "2026-08-03", description: "Electricity & Water Bill", type: "Expense", category: "Bills", amount: 1420.00 },
            { id: "TX104", date: "2026-08-04", description: "College Semester Tuition Fee", type: "Expense", category: "Education", amount: 12500.00 },
            { id: "TX105", date: "2026-08-05", description: "Uber Metro & Cab Pass", type: "Expense", category: "Travel", amount: 850.00 },
            { id: "TX106", date: "2026-08-06", description: "Weekend Cinema & Snacks", type: "Expense", category: "Entertainment", amount: 650.00 },
            { id: "TX107", date: "2026-08-07", description: "Freelance Web Design Project", type: "Income", category: "Salary", amount: 8500.00 },
            { id: "TX108", date: "2026-08-08", description: "New Sneakers Purchase", type: "Expense", category: "Shopping", amount: 3200.00 },
            { id: "TX109", date: "2026-08-09", description: "Restaurant Dinner with Friends", type: "Expense", category: "Food", amount: 1450.00 },
            { id: "TX110", date: "2026-08-10", description: "High Speed Broadband Internet", type: "Expense", category: "Bills", amount: 999.00 },
            { id: "TX111", date: "2026-08-12", description: "DSA Textbook & Lab Notebooks", type: "Expense", category: "Education", amount: 1800.00 },
            { id: "TX112", date: "2026-08-14", description: "Train Tickets for Holiday Trip", type: "Expense", category: "Travel", amount: 2400.00 },
            { id: "TX113", date: "2026-08-15", description: "Cash Cashback Bonus", type: "Income", category: "Other", amount: 500.00 },
            { id: "TX114", date: "2026-08-16", description: "Online Shopping Electronics", type: "Expense", category: "Shopping", amount: 4999.00 },
            { id: "TX115", date: "2026-08-17", description: "Coffee Shop & Bakery", type: "Expense", category: "Food", amount: 340.00 },
            { id: "TX116", date: "2026-08-18", description: "Mobile Recharge Plan", type: "Expense", category: "Bills", amount: 479.00 },
            { id: "TX117", date: "2026-08-19", description: "Gaming Subscription", type: "Expense", category: "Entertainment", amount: 799.00 },
            { id: "TX118", date: "2026-08-20", description: "Second-hand Scooter Maintenance", type: "Expense", category: "Other", amount: 1100.00 }
        ];
    }

    /**
     * Loads transactions from localStorage or populates defaults.
     */
    static loadTransactions() {
        const stored = localStorage.getItem(StorageManager.STORAGE_KEY);
        if (!stored) {
            const defaults = StorageManager.getSampleTransactions();
            StorageManager.saveTransactions(defaults);
            return defaults;
        }
        try {
            return JSON.parse(stored);
        } catch (e) {
            console.error("Error parsing stored transactions, resetting to defaults:", e);
            const defaults = StorageManager.getSampleTransactions();
            StorageManager.saveTransactions(defaults);
            return defaults;
        }
    }

    /**
     * Saves list of transactions into localStorage.
     */
    static saveTransactions(transactions) {
        localStorage.setItem(StorageManager.STORAGE_KEY, JSON.stringify(transactions));
    }

    /**
     * Resets storage to initial sample dataset.
     */
    static resetToDefault() {
        const defaults = StorageManager.getSampleTransactions();
        StorageManager.saveTransactions(defaults);
        return defaults;
    }

    /**
     * Exports transactions as downloadable CSV.
     */
    static exportCSV(transactions) {
        let csvContent = "data:text/csv;charset=utf-8,ID,Date,Description,Type,Category,Amount\n";
        transactions.forEach(t => {
            csvContent += `${t.id},${t.date},"${t.description.replace(/"/g, '""')}",${t.type},${t.category},${t.amount.toFixed(2)}\n`;
        });
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "bank_transactions_export.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
}
