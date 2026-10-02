/**
 * Sorting Engine implementing Bubble Sort O(n²), Selection Sort O(n²),
 * Merge Sort O(n log n), and Quick Sort O(n log n).
 * 
 * Tracks comparison count, swap count, and execution time to demonstrate
 * theoretical vs empirical algorithmic complexity differences in viva defense.
 */
class SortingEngine {

    /**
     * Comparator helper based on target field and order.
     */
    static compare(a, b, key, order = 'asc') {
        let valA = a[key];
        let valB = b[key];

        if (key === 'amount') {
            valA = parseFloat(valA);
            valB = parseFloat(valB);
        } else if (key === 'date' || key === 'id') {
            valA = String(valA).toLowerCase();
            valB = String(valB).toLowerCase();
        }

        if (valA === valB) return 0;
        const result = valA < valB ? -1 : 1;
        return order === 'asc' ? result : -result;
    }

    /**
     * Manual Bubble Sort O(n²)
     */
    static bubbleSort(list, key = 'amount', order = 'asc') {
        const startTime = performance.now();
        const arr = JSON.parse(JSON.stringify(list));
        let comparisons = 0;
        let swaps = 0;
        const n = arr.length;

        for (let i = 0; i < n - 1; i++) {
            let swapped = false;
            for (let j = 0; j < n - i - 1; j++) {
                comparisons++;
                if (SortingEngine.compare(arr[j], arr[j + 1], key, order) > 0) {
                    const temp = arr[j];
                    arr[j] = arr[j + 1];
                    arr[j + 1] = temp;
                    swaps++;
                    swapped = true;
                }
            }
            if (!swapped) break;
        }

        const endTime = performance.now();
        return {
            results: arr,
            algorithm: 'Bubble Sort',
            complexity: 'O(n²)',
            comparisons: comparisons,
            swaps: swaps,
            timeMs: +(endTime - startTime).toFixed(3)
        };
    }

    /**
     * Manual Selection Sort O(n²)
     */
    static selectionSort(list, key = 'amount', order = 'asc') {
        const startTime = performance.now();
        const arr = JSON.parse(JSON.stringify(list));
        let comparisons = 0;
        let swaps = 0;
        const n = arr.length;

        for (let i = 0; i < n - 1; i++) {
            let targetIdx = i;
            for (let j = i + 1; j < n; j++) {
                comparisons++;
                if (SortingEngine.compare(arr[j], arr[targetIdx], key, order) < 0) {
                    targetIdx = j;
                }
            }
            if (targetIdx !== i) {
                const temp = arr[i];
                arr[i] = arr[targetIdx];
                arr[targetIdx] = temp;
                swaps++;
            }
        }

        const endTime = performance.now();
        return {
            results: arr,
            algorithm: 'Selection Sort',
            complexity: 'O(n²)',
            comparisons: comparisons,
            swaps: swaps,
            timeMs: +(endTime - startTime).toFixed(3)
        };
    }

    /**
     * Manual Merge Sort O(n log n)
     */
    static mergeSort(list, key = 'amount', order = 'asc') {
        const startTime = performance.now();
        const arr = JSON.parse(JSON.stringify(list));
        let comparisons = 0;

        function merge(left, right) {
            const result = [];
            let i = 0, j = 0;
            while (i < left.length && j < right.length) {
                comparisons++;
                if (SortingEngine.compare(left[i], right[j], key, order) <= 0) {
                    result.push(left[i]);
                    i++;
                } else {
                    result.push(right[j]);
                    j++;
                }
            }
            return result.concat(left.slice(i)).concat(right.slice(j));
        }

        function sort(items) {
            if (items.length <= 1) return items;
            const mid = Math.floor(items.length / 2);
            const left = sort(items.slice(0, mid));
            const right = sort(items.slice(mid));
            return merge(left, right);
        }

        const sorted = sort(arr);
        const endTime = performance.now();

        return {
            results: sorted,
            algorithm: 'Merge Sort',
            complexity: 'O(n log n)',
            comparisons: comparisons,
            swaps: 0, // Divide-and-conquer merges allocations
            timeMs: +(endTime - startTime).toFixed(3)
        };
    }

    /**
     * Manual Quick Sort O(n log n)
     */
    static quickSort(list, key = 'amount', order = 'asc') {
        const startTime = performance.now();
        const arr = JSON.parse(JSON.stringify(list));
        let comparisons = 0;
        let swaps = 0;

        function sort(items, low = 0, high = items.length - 1) {
            if (low < high) {
                const pivotIdx = partition(items, low, high);
                sort(items, low, pivotIdx - 1);
                sort(items, pivotIdx + 1, high);
            }
            return items;
        }

        function partition(items, low, high) {
            const pivot = items[high];
            let i = low - 1;
            for (let j = low; j < high; j++) {
                comparisons++;
                if (SortingEngine.compare(items[j], pivot, key, order) <= 0) {
                    i++;
                    const temp = items[i];
                    items[i] = items[j];
                    items[j] = temp;
                    swaps++;
                }
            }
            const temp = items[i + 1];
            items[i + 1] = items[high];
            items[high] = temp;
            swaps++;
            return i + 1;
        }

        const sorted = sort(arr);
        const endTime = performance.now();

        return {
            results: sorted,
            algorithm: 'Quick Sort',
            complexity: 'O(n log n)',
            comparisons: comparisons,
            swaps: swaps,
            timeMs: +(endTime - startTime).toFixed(3)
        };
    }
}
