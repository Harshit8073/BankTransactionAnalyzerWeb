/**
 * Circular Array / Ring Buffer Queue Implementation.
 * 
 * Efficiency:
 * - enqueue(item): O(1) time complexity (no array shift re-indexing)
 * - dequeue(): O(1) time complexity
 * - peek(): O(1) time complexity
 * - Space: O(k) fixed bounded capacity space
 */
class CircularQueue {
    constructor(capacity = 5) {
        this.capacity = capacity;
        this.buffer = new Array(capacity);
        this.head = 0;
        this.tail = 0;
        this.size = 0;
    }

    /**
     * Enqueues an item into the circular buffer.
     * If the queue is full, overwrites the oldest item (FIFO eviction) and advances head in O(1).
     */
    enqueue(item) {
        if (this.size === this.capacity) {
            // Queue is full: overwrite at head position and advance head
            this.buffer[this.head] = item;
            this.head = (this.head + 1) % this.capacity;
            this.tail = (this.tail + 1) % this.capacity;
        } else {
            this.buffer[this.tail] = item;
            this.tail = (this.tail + 1) % this.capacity;
            this.size++;
        }
        return item;
    }

    /**
     * Dequeues the oldest item in O(1) time.
     */
    dequeue() {
        if (this.isEmpty()) return null;
        const item = this.buffer[this.head];
        this.buffer[this.head] = null; // Free reference
        this.head = (this.head + 1) % this.capacity;
        this.size--;
        return item;
    }

    /**
     * Returns the head element without removing it in O(1) time.
     */
    peek() {
        if (this.isEmpty()) return null;
        return this.buffer[this.head];
    }

    isEmpty() {
        return this.size === 0;
    }

    isFull() {
        return this.size === this.capacity;
    }

    getSize() {
        return this.size;
    }

    clear() {
        this.buffer = new Array(this.capacity);
        this.head = 0;
        this.tail = 0;
        this.size = 0;
    }

    /**
     * Returns array representation in true FIFO order without mutating internal indices.
     */
    toArray() {
        const result = [];
        for (let i = 0; i < this.size; i++) {
            const index = (this.head + i) % this.capacity;
            result.push(this.buffer[index]);
        }
        return result;
    }
}
