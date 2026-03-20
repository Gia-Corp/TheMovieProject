export class PosterCache {
  #cache;
  #maxSize;

  constructor(maxSize = 100) {
    this.#cache = new Map();
    this.#maxSize = maxSize;
  }

  get(key) {
    return this.#cache.get(key);
  }

  has(key) {
    return this.#cache.has(key);
  }

  set(key, value) {
    if (this.#cache.size >= this.#maxSize) {
      const firstKey = this.#cache.keys().next().value;
      this.#cache.delete(firstKey);
    }
    this.#cache.set(key, value);
  }

  clear() {
    this.#cache.clear();
  }

  size() {
    return this.#cache.size;
  }
}

export const posterCache = new PosterCache();
