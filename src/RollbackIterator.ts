class RollbackIterator<T> implements Iterable<T> {

    private rollbacks: number[] = []
    private iteratedValues: T[] = []
    private currentIndex: number = 0
    private iterator: Iterator<T>

    constructor(iterator: Iterable<T>) {
        this.iterator = iterator[Symbol.iterator]()
    }

    [Symbol.iterator](): Iterator<T> {
        return this
    }

    next(): IteratorResult<T> {
        let next: IteratorResult<T>;
        if (this.currentIndex < this.iteratedValues.length) { // @ts-ignore
            next = { value: this.iteratedValues[this.currentIndex], done: false}
        }
        else {
            next = this.iterator.next()
        }
        if (!next.done) {
            this.iteratedValues.push(next.value)
            this.currentIndex++
        }
        return next
    }

    createRollbackPoint(): void {
        this.rollbacks.push(this.currentIndex)
    }

    rollback(): void {
        const rollback = this.rollbacks.pop()
        if (rollback === undefined) throw new Error("Cannot rollback when no rollback points are present.")
        this.currentIndex = rollback
    }

    removeRollback(): void {
        this.rollbacks.pop()
    }

}

export default RollbackIterator