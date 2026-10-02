/**
 * Strict Data Validator & Sanitizer.
 * Ensures data integrity, prevents duplicate IDs, handles unknown categories,
 * and purges corrupt/malformed localStorage entries.
 */
class TransactionValidator {

    static VALID_CATEGORIES = [
        "Food", "Shopping", "Travel", "Education", "Bills", "Salary", "Entertainment", "Other"
    ];

    static VALID_TYPES = ["Income", "Expense"];

    /**
     * Validates a candidate transaction object.
     * @returns {Object} { isValid: boolean, errors: String[] }
     */
    static validate(tx, existingTransactions = []) {
        const errors = [];

        // 1. Transaction ID
        if (!tx.id || typeof tx.id !== 'string' || !tx.id.trim()) {
            errors.push("Transaction ID is required and cannot be empty.");
        } else {
            const cleanId = tx.id.trim();
            if (existingTransactions.some(e => e.id.toLowerCase() === cleanId.toLowerCase())) {
                errors.push(`Transaction ID '${cleanId}' already exists. IDs must be unique.`);
            }
        }

        // 2. Date
        if (!tx.date || !/^\d{4}-\d{2}-\d{2}$/.test(tx.date)) {
            errors.push("Date must be in valid YYYY-MM-DD format.");
        } else {
            const d = new Date(tx.date);
            if (isNaN(d.getTime())) {
                errors.push("Invalid calendar date.");
            }
        }

        // 3. Description
        if (!tx.description || typeof tx.description !== 'string' || !tx.description.trim()) {
            errors.push("Description is required and cannot be empty.");
        }

        // 4. Type
        if (!tx.type || !TransactionValidator.VALID_TYPES.includes(tx.type)) {
            errors.push("Transaction Type must be either 'Income' or 'Expense'.");
        }

        // 5. Category
        if (!tx.category || !TransactionValidator.VALID_CATEGORIES.includes(tx.category)) {
            errors.push(`Category must be one of: ${TransactionValidator.VALID_CATEGORIES.join(', ')}.`);
        }

        // 6. Amount
        const amount = parseFloat(tx.amount);
        if (isNaN(amount) || amount <= 0) {
            errors.push("Amount must be a numerical value greater than 0.");
        }

        return {
            isValid: errors.length === 0,
            errors: errors
        };
    }

    /**
     * Sanitizes raw data array loaded from localStorage or external CSV.
     * Filters out broken entries and normalizes valid records.
     */
    static sanitizeArray(rawArray) {
        if (!Array.isArray(rawArray)) return [];
        const clean = [];
        const seenIds = new Set();

        for (let i = 0; i < rawArray.length; i++) {
            const item = rawArray[i];
            if (!item || typeof item !== 'object') continue;

            const id = String(item.id || '').trim();
            const date = String(item.date || '').trim();
            const description = String(item.description || '').trim();
            const type = String(item.type || 'Expense').trim();
            let category = String(item.category || 'Other').trim();
            const amount = parseFloat(item.amount);

            // Skip invalid IDs or duplicates
            if (!id || seenIds.has(id.toLowerCase())) continue;
            if (!date || isNaN(new Date(date).getTime())) continue;
            if (!description) continue;
            if (isNaN(amount) || amount <= 0) continue;

            // Fallback for invalid categories
            if (!TransactionValidator.VALID_CATEGORIES.includes(category)) {
                category = 'Other';
            }

            const normalizedType = type.toLowerCase() === 'income' ? 'Income' : 'Expense';

            seenIds.add(id.toLowerCase());
            clean.push({
                id,
                date,
                description,
                type: normalizedType,
                category,
                amount: +amount.toFixed(2)
            });
        }

        return clean;
    }

    /**
     * Collision-free Transaction ID Generator.
     */
    static generateUniqueId(existingTransactions = []) {
        const count = existingTransactions.length + 101;
        let id = `TX${count}`;
        let suffix = 1;
        while (existingTransactions.some(t => t.id.toLowerCase() === id.toLowerCase())) {
            id = `TX${count}_${suffix++}`;
        }
        return id;
    }
}
