/**
 * Lightweight In-Browser Unit Test Runner.
 * Executes live unit tests on DSA structures, search & sort algorithms, validator, and analytics.
 */
class UnitTestRunner {

    static runAllTests() {
        const results = [];
        let passed = 0;
        let failed = 0;

        function assert(condition, message) {
            if (condition) {
                passed++;
                results.push({ name: message, status: 'PASS' });
            } else {
                failed++;
                results.push({ name: message, status: 'FAIL' });
            }
        }

        const startTime = performance.now();

        // --- Group 1: CircularQueue O(1) Tests ---
        try {
            const q = new CircularQueue(3);
            assert(q.isEmpty(), "CircularQueue initializes empty");

            q.enqueue("A");
            q.enqueue("B");
            q.enqueue("C");
            assert(q.isFull(), "CircularQueue reaches full capacity (3/3)");
            assert(q.peek() === "A", "CircularQueue peek returns head element 'A'");

            // Overflow eviction test
            q.enqueue("D"); // Should evict 'A', queue is now B, C, D
            assert(q.getSize() === 3, "CircularQueue capacity remains bounded at 3");
            assert(q.peek() === "B", "CircularQueue FIFO eviction removed 'A', new head is 'B'");

            const arr = q.toArray();
            assert(arr.join(',') === "B,C,D", "CircularQueue toArray returns true FIFO order ['B', 'C', 'D']");
        } catch (e) {
            assert(false, `CircularQueue Test Error: ${e.message}`);
        }

        // --- Group 2: Linear Search & Range Filter Tests ---
        try {
            const sampleData = [
                { id: "TX01", date: "2026-08-01", description: "Food Grocery", type: "Expense", category: "Food", amount: 500 },
                { id: "TX02", date: "2026-08-10", description: "Salary Deposit", type: "Income", category: "Salary", amount: 20000 },
                { id: "TX03", date: "2026-08-15", description: "Shopping Mall", type: "Expense", category: "Shopping", amount: 3000 }
            ];

            const searchRes = SearchEngine.linearSearch(sampleData, { query: "Food" });
            assert(searchRes.results.length === 1 && searchRes.results[0].id === "TX01", "LinearSearch text query 'Food' returns TX01");

            const rangeRes = SearchEngine.linearSearch(sampleData, { minAmount: 1000, maxAmount: 5000 });
            assert(rangeRes.results.length === 1 && rangeRes.results[0].id === "TX03", "LinearSearch range filter (1000-5000) matches TX03");
        } catch (e) {
            assert(false, `LinearSearch Test Error: ${e.message}`);
        }

        // --- Group 3: Sorting Algorithms Comparison Tests ---
        try {
            const unsorted = [
                { id: "C", amount: 300, date: "2026-08-03" },
                { id: "A", amount: 100, date: "2026-08-01" },
                { id: "B", amount: 200, date: "2026-08-02" }
            ];

            const bubbleRes = SortingEngine.bubbleSort(unsorted, 'amount', 'asc');
            assert(bubbleRes.results[0].amount === 100 && bubbleRes.results[2].amount === 300, "BubbleSort sorts amounts ascending [100, 200, 300]");

            const mergeRes = SortingEngine.mergeSort(unsorted, 'amount', 'asc');
            assert(mergeRes.results[0].amount === 100 && mergeRes.results[2].amount === 300, "MergeSort sorts amounts ascending [100, 200, 300]");
            assert(mergeRes.algorithm === "Merge Sort" && mergeRes.complexity === "O(n log n)", "MergeSort reports O(n log n) complexity metadata");
        } catch (e) {
            assert(false, `SortingEngine Test Error: ${e.message}`);
        }

        // --- Group 4: Financial Insights & Savings Rate Tests ---
        try {
            const finData = [
                { type: "Income", category: "Salary", amount: 10000 },
                { type: "Expense", category: "Food", amount: 3000 },
                { type: "Expense", category: "Bills", amount: 2000 }
            ];

            const metrics = InsightsEngine.calculateMetrics(finData);
            assert(metrics.totalIncome === 10000, "InsightsEngine calculates total income (10,000)");
            assert(metrics.totalExpense === 5000, "InsightsEngine calculates total expense (5,000)");
            assert(metrics.savingsRate === 50.0, "InsightsEngine computes savings rate = 50.0%");
        } catch (e) {
            assert(false, `InsightsEngine Test Error: ${e.message}`);
        }

        // --- Group 5: Validator & Security Tests ---
        try {
            const invalidTx = { id: "", date: "invalid-date", description: "", type: "Invalid", amount: -50 };
            const valRes = TransactionValidator.validate(invalidTx, []);
            assert(!valRes.isValid && valRes.errors.length >= 4, "TransactionValidator rejects empty ID, bad date, bad type, and negative amount");

            const duplicateRes = TransactionValidator.validate(
                { id: "TX100", date: "2026-08-01", description: "Valid", type: "Expense", category: "Food", amount: 100 },
                [{ id: "TX100" }]
            );
            assert(!duplicateRes.isValid && duplicateRes.errors[0].includes("already exists"), "TransactionValidator rejects duplicate IDs");
        } catch (e) {
            assert(false, `TransactionValidator Test Error: ${e.message}`);
        }

        const endTime = performance.now();

        return {
            total: passed + failed,
            passed: passed,
            failed: failed,
            results: results,
            executionTimeMs: +(endTime - startTime).toFixed(3)
        };
    }
}
