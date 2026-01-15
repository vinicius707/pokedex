import { LRUCache } from './lru-cache';

describe('LRUCache', () => {
  describe('constructor', () => {
    it('should create cache with default size of 100', () => {
      const cache = new LRUCache<string, number>();
      expect(cache.size).toBe(0);
    });

    it('should create cache with custom size', () => {
      const cache = new LRUCache<string, number>(50);
      expect(cache.size).toBe(0);
    });
  });

  describe('set and get', () => {
    it('should store and retrieve values', () => {
      const cache = new LRUCache<string, number>(5);

      cache.set('a', 1);
      cache.set('b', 2);

      expect(cache.get('a')).toBe(1);
      expect(cache.get('b')).toBe(2);
    });

    it('should return undefined for non-existent keys', () => {
      const cache = new LRUCache<string, number>(5);

      expect(cache.get('nonexistent')).toBeUndefined();
    });

    it('should update existing key', () => {
      const cache = new LRUCache<string, number>(5);

      cache.set('a', 1);
      cache.set('a', 10);

      expect(cache.get('a')).toBe(10);
      expect(cache.size).toBe(1);
    });
  });

  describe('LRU eviction', () => {
    it('should evict least recently used item when full', () => {
      const cache = new LRUCache<string, number>(3);

      cache.set('a', 1);
      cache.set('b', 2);
      cache.set('c', 3);

      // Cache is now full
      expect(cache.size).toBe(3);

      // Add one more, should evict 'a'
      cache.set('d', 4);

      expect(cache.size).toBe(3);
      expect(cache.get('a')).toBeUndefined();
      expect(cache.get('b')).toBe(2);
      expect(cache.get('c')).toBe(3);
      expect(cache.get('d')).toBe(4);
    });

    it('should update LRU order on get', () => {
      const cache = new LRUCache<string, number>(3);

      cache.set('a', 1);
      cache.set('b', 2);
      cache.set('c', 3);

      // Access 'a' to make it most recently used
      cache.get('a');

      // Add 'd', should evict 'b' (now LRU)
      cache.set('d', 4);

      expect(cache.get('a')).toBe(1);
      expect(cache.get('b')).toBeUndefined();
      expect(cache.get('c')).toBe(3);
      expect(cache.get('d')).toBe(4);
    });

    it('should update LRU order on set for existing key', () => {
      const cache = new LRUCache<string, number>(3);

      cache.set('a', 1);
      cache.set('b', 2);
      cache.set('c', 3);

      // Update 'a' to make it most recently used
      cache.set('a', 10);

      // Add 'd', should evict 'b' (now LRU)
      cache.set('d', 4);

      expect(cache.get('a')).toBe(10);
      expect(cache.get('b')).toBeUndefined();
    });
  });

  describe('has', () => {
    it('should return true for existing keys', () => {
      const cache = new LRUCache<string, number>(5);

      cache.set('a', 1);

      expect(cache.has('a')).toBe(true);
    });

    it('should return false for non-existent keys', () => {
      const cache = new LRUCache<string, number>(5);

      expect(cache.has('nonexistent')).toBe(false);
    });
  });

  describe('delete', () => {
    it('should delete existing key', () => {
      const cache = new LRUCache<string, number>(5);

      cache.set('a', 1);
      expect(cache.has('a')).toBe(true);

      const result = cache.delete('a');

      expect(result).toBe(true);
      expect(cache.has('a')).toBe(false);
      expect(cache.size).toBe(0);
    });

    it('should return false for non-existent key', () => {
      const cache = new LRUCache<string, number>(5);

      const result = cache.delete('nonexistent');

      expect(result).toBe(false);
    });
  });

  describe('clear', () => {
    it('should clear all entries', () => {
      const cache = new LRUCache<string, number>(5);

      cache.set('a', 1);
      cache.set('b', 2);
      cache.set('c', 3);

      expect(cache.size).toBe(3);

      cache.clear();

      expect(cache.size).toBe(0);
      expect(cache.get('a')).toBeUndefined();
    });
  });

  describe('size', () => {
    it('should return correct size', () => {
      const cache = new LRUCache<string, number>(5);

      expect(cache.size).toBe(0);

      cache.set('a', 1);
      expect(cache.size).toBe(1);

      cache.set('b', 2);
      expect(cache.size).toBe(2);

      cache.delete('a');
      expect(cache.size).toBe(1);
    });
  });

  describe('iterators', () => {
    it('should iterate over keys', () => {
      const cache = new LRUCache<string, number>(5);

      cache.set('a', 1);
      cache.set('b', 2);

      const keys = Array.from(cache.keys());

      expect(keys).toContain('a');
      expect(keys).toContain('b');
    });

    it('should iterate over values', () => {
      const cache = new LRUCache<string, number>(5);

      cache.set('a', 1);
      cache.set('b', 2);

      const values = Array.from(cache.values());

      expect(values).toContain(1);
      expect(values).toContain(2);
    });

    it('should iterate over entries', () => {
      const cache = new LRUCache<string, number>(5);

      cache.set('a', 1);
      cache.set('b', 2);

      const entries = Array.from(cache.entries());

      expect(entries).toContainEqual(['a', 1]);
      expect(entries).toContainEqual(['b', 2]);
    });
  });

  describe('edge cases', () => {
    it('should handle cache with size 1', () => {
      const cache = new LRUCache<string, number>(1);

      cache.set('a', 1);
      expect(cache.get('a')).toBe(1);

      cache.set('b', 2);
      expect(cache.get('a')).toBeUndefined();
      expect(cache.get('b')).toBe(2);
    });

    it('should work with different key/value types', () => {
      const cache = new LRUCache<number, { name: string }>(5);

      cache.set(1, { name: 'bulbasaur' });
      cache.set(2, { name: 'ivysaur' });

      expect(cache.get(1)?.name).toBe('bulbasaur');
      expect(cache.get(2)?.name).toBe('ivysaur');
    });
  });
});
