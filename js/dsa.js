/**
 * Manual Data Structures and Algorithms (DSA) Engine written in pure JavaScript.
 * Implements:
 * 1. Bounded FIFO Queue (Recent Transactions)
 * 2. Manual Linear Search O(n)
 * 3. Manual Bubble Sort O(n²)
 * 4. Manual Selection Sort O(n²)
 * 5. HashMap Aggregation O(1) avg
 * 6. Linear Array Scans O(n) for Max/Min stats
 */

// --- 1. Bounded FIFO Queue ---
class RecentQueue {
    constructor(maxCapacity = 5) {
        this.capacity = maxCapacity;
        this.queue = [];
    }

    enqueue(item) {
        if (this.queue.length >= this.capacity) {
            this.queue.shift(); // Remove oldest item (FIFO)
        }
        this.queue.push(item);
    }

    getItems() {
        return [...this.queue];
    }

    clear() {
        this.queue = [];
    }
}

// --- 2. Manual Linear Search Engine O(n) ---
class LinearSearchEngine {
    static searchById(transactions, targetId) {
        if (!targetId || !targetId.trim()) return [...transactions];
        const searchKey = targetId.trim().toLowerCase();
        const results = [];
        for (let i = 0; i < transactions.length; i++) {
            const tx = transactions[i];
            if (tx.id.toLowerCase().includes(searchKey)) {
                results.push(tx);
            }
        }
        return results;
    }

    static searchByDesc(transactions, query) {
        if (!query || !query.trim()) return [...transactions];
        const searchKey = query.trim().toLowerCase();
        const results = [];
        for (let i = 0; i < transactions.length; i++) {
            const tx = transactions[i];
            if (tx.description.toLowerCase().includes(searchKey)) {
                results.push(tx);
            }
        }
        return results;
    }

    static searchByCategory(transactions, category) {
        if (!category || category === 'All') return [...transactions];
        const searchKey = category.trim().toLowerCase();
        const results = [];
        for (let i = 0; i < transactions.length; i++) {
            const tx = transactions[i];
            if (tx.category.toLowerCase() === searchKey) {
                results.push(tx);
            }
        }
        return results;
    }

    static searchMulti(transactions, query) {
        if (!query || !query.trim()) return [...transactions];
        const searchKey = query.trim().toLowerCase();
        const results = [];
        for (let i = 0; i < transactions.length; i++) {
            const tx = transactions[i];
            const matchId = tx.id.toLowerCase().includes(searchKey);
            const matchDesc = tx.description.toLowerCase().includes(searchKey);
            const matchCat = tx.category.toLowerCase().includes(searchKey);
            if (matchId || matchDesc || matchCat) {
                results.push(tx);
            }
        }
        return results;
    }
}

// --- 3. Manual Sorting Engine O(n²) ---
class SortingEngine {
    /**
     * Bubble Sort by Amount (Ascending)
     */
    static bubbleSortAmountAsc(list) {
        const arr = JSON.parse(JSON.stringify(list));
        const n = arr.length;
        for (let i = 0; i < n - 1; i++) {
            let swapped = false;
            for (let j = 0; j < n - i - 1; j++) {
                if (arr[j].amount > arr[j + 1].amount) {
                    const temp = arr[j];
                    arr[j] = arr[j + 1];
                    arr[j + 1] = temp;
                    swapped = true;
                }
            }
            if (!swapped) break;
        }
        return arr;
    }

    /**
     * Bubble Sort by Amount (Descending)
     */
    static bubbleSortAmountDesc(list) {
        const arr = JSON.parse(JSON.stringify(list));
        const n = arr.length;
        for (let i = 0; i < n - 1; i++) {
            let swapped = false;
            for (let j = 0; j < n - i - 1; j++) {
                if (arr[j].amount < arr[j + 1].amount) {
                    const temp = arr[j];
                    arr[j] = arr[j + 1];
                    arr[j + 1] = temp;
                    swapped = true;
                }
            }
            if (!swapped) break;
        }
        return arr;
    }

    /**
     * Selection Sort by Date (Ascending)
     */
    static selectionSortDate(list) {
        const arr = JSON.parse(JSON.stringify(list));
        const n = arr.length;
        for (let i = 0; i < n - 1; i++) {
            let minIdx = i;
            for (let j = i + 1; j < n; j++) {
                if (arr[j].date < arr[minIdx].date) {
                    minIdx = j;
                }
            }
            if (minIdx !== i) {
                const temp = arr[i];
                arr[i] = arr[minIdx];
                arr[minIdx] = temp;
            }
        }
        return arr;
    }

    /**
     * Selection Sort by Transaction ID (Ascending)
     */
    static selectionSortId(list) {
        const arr = JSON.parse(JSON.stringify(list));
        const n = arr.length;
        for (let i = 0; i < n - 1; i++) {
            let minIdx = i;
            for (let j = i + 1; j < n; j++) {
                if (arr[j].id.localeCompare(arr[minIdx].id) < 0) {
                    minIdx = j;
                }
            }
            if (minIdx !== i) {
                const temp = arr[i];
                arr[i] = arr[minIdx];
                arr[minIdx] = temp;
            }
        }
        return arr;
    }
}

// --- 4. HashMap Category Aggregation ---
class CategoryHashMapEngine {
    static getCategoryWiseExpenses(transactions) {
        const categories = ["Food", "Shopping", "Travel", "Education", "Bills", "Salary", "Entertainment", "Other"];
        const hashMap = {};
        categories.forEach(cat => hashMap[cat] = 0.0);

        for (let i = 0; i < transactions.length; i++) {
            const tx = transactions[i];
            if (tx.type.toLowerCase() === 'expense') {
                const cat = tx.category;
                hashMap[cat] = (hashMap[cat] || 0.0) + parseFloat(tx.amount);
            }
        }
        return hashMap;
    }
}

// --- 5. Linear Array Scans & Stats ---
class ArrayStatsEngine {
    static calculateTotals(transactions) {
        let income = 0;
        let expenses = 0;
        for (let i = 0; i < transactions.length; i++) {
            const tx = transactions[i];
            if (tx.type.toLowerCase() === 'income') {
                income += parseFloat(tx.amount);
            } else if (tx.type.toLowerCase() === 'expense') {
                expenses += parseFloat(tx.amount);
            }
        }
        return {
            income: income,
            expenses: expenses,
            balance: income - expenses,
            count: transactions.length
        };
    }

    static findHighestTransaction(transactions) {
        if (!transactions.length) return null;
        let maxTx = transactions[0];
        for (let i = 1; i < transactions.length; i++) {
            if (parseFloat(transactions[i].amount) > parseFloat(maxTx.amount)) {
                maxTx = transactions[i];
            }
        }
        return maxTx;
    }

    static findLowestTransaction(transactions) {
        if (!transactions.length) return null;
        let minTx = transactions[0];
        for (let i = 1; i < transactions.length; i++) {
            if (parseFloat(transactions[i].amount) < parseFloat(minTx.amount)) {
                minTx = transactions[i];
            }
        }
        return minTx;
    }

    static findHighestIncome(transactions) {
        let maxInc = null;
        for (let i = 0; i < transactions.length; i++) {
            if (transactions[i].type.toLowerCase() === 'income') {
                if (!maxInc || parseFloat(transactions[i].amount) > parseFloat(maxInc.amount)) {
                    maxInc = transactions[i];
                }
            }
        }
        return maxInc;
    }

    static findHighestExpense(transactions) {
        let maxExp = null;
        for (let i = 0; i < transactions.length; i++) {
            if (transactions[i].type.toLowerCase() === 'expense') {
                if (!maxExp || parseFloat(transactions[i].amount) > parseFloat(maxExp.amount)) {
                    maxExp = transactions[i];
                }
            }
        }
        return maxExp;
    }
}
