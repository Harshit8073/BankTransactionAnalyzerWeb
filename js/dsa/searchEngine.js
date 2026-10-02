/**
 * Search Engine providing multi-predicate Linear Search O(n).
 * Tracks comparison iterations for educational & algorithmic evaluation.
 */
class SearchEngine {

    /**
     * Executes multi-predicate Linear Search with full range & field filtering.
     * @param {Array} transactions List of transaction objects
     * @param {Object} filters Filter options { query, field, startDate, endDate, minAmount, maxAmount, type, category }
     * @returns {Object} { results: Array, iterations: number, timeMs: number }
     */
    static linearSearch(transactions, filters = {}) {
        const startTime = performance.now();
        const results = [];
        let iterations = 0;

        const query = (filters.query || '').trim().toLowerCase();
        const field = filters.field || 'all';
        const startDate = filters.startDate ? new Date(filters.startDate) : null;
        const endDate = filters.endDate ? new Date(filters.endDate) : null;
        const minAmount = filters.minAmount !== undefined && filters.minAmount !== '' ? parseFloat(filters.minAmount) : null;
        const maxAmount = filters.maxAmount !== undefined && filters.maxAmount !== '' ? parseFloat(filters.maxAmount) : null;
        const typeFilter = filters.type && filters.type !== 'All' ? filters.type.toLowerCase() : null;
        const catFilter = filters.category && filters.category !== 'All' ? filters.category.toLowerCase() : null;

        for (let i = 0; i < transactions.length; i++) {
            iterations++;
            const tx = transactions[i];

            // 1. Text Query Matching
            let matchesText = true;
            if (query) {
                if (field === 'id') {
                    matchesText = tx.id.toLowerCase().includes(query);
                } else if (field === 'desc') {
                    matchesText = tx.description.toLowerCase().includes(query);
                } else if (field === 'category') {
                    matchesText = tx.category.toLowerCase().includes(query);
                } else { // 'all'
                    matchesText = tx.id.toLowerCase().includes(query) ||
                                  tx.description.toLowerCase().includes(query) ||
                                  tx.category.toLowerCase().includes(query);
                }
            }

            if (!matchesText) continue;

            // 2. Type Filter
            if (typeFilter && tx.type.toLowerCase() !== typeFilter) continue;

            // 3. Category Filter
            if (catFilter && tx.category.toLowerCase() !== catFilter) continue;

            // 4. Date Range Filter
            if (startDate || endDate) {
                const txDate = new Date(tx.date);
                if (startDate && txDate < startDate) continue;
                if (endDate && txDate > endDate) continue;
            }

            // 5. Amount Range Filter
            const amount = parseFloat(tx.amount);
            if (minAmount !== null && !isNaN(minAmount) && amount < minAmount) continue;
            if (maxAmount !== null && !isNaN(maxAmount) && amount > maxAmount) continue;

            results.push(tx);
        }

        const endTime = performance.now();

        return {
            results: results,
            iterations: iterations,
            totalItems: transactions.length,
            timeMs: +(endTime - startTime).toFixed(3)
        };
    }
}
