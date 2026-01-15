/**
 * Implementação de um cache LRU (Least Recently Used)
 * Remove automaticamente os itens menos usados quando o limite é atingido
 */
export class LRUCache<K, V> {
  private cache: Map<K, V>;
  private readonly maxSize: number;

  constructor(maxSize: number = 100) {
    this.cache = new Map();
    this.maxSize = maxSize;
  }

  /**
   * Obtém um valor do cache
   * Move o item para o final (mais recente) se encontrado
   */
  get(key: K): V | undefined {
    if (!this.cache.has(key)) {
      return undefined;
    }

    // Move para o final (mais recente)
    const value = this.cache.get(key)!;
    this.cache.delete(key);
    this.cache.set(key, value);

    return value;
  }

  /**
   * Adiciona um valor ao cache
   * Remove o item mais antigo se o limite for atingido
   */
  set(key: K, value: V): void {
    // Se a chave já existe, remove para atualizar a posição
    if (this.cache.has(key)) {
      this.cache.delete(key);
    }
    // Se atingiu o limite, remove o mais antigo (primeiro)
    else if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      if (firstKey !== undefined) {
        this.cache.delete(firstKey);
      }
    }

    this.cache.set(key, value);
  }

  /**
   * Verifica se uma chave existe no cache
   */
  has(key: K): boolean {
    return this.cache.has(key);
  }

  /**
   * Remove um item do cache
   */
  delete(key: K): boolean {
    return this.cache.delete(key);
  }

  /**
   * Limpa todo o cache
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Retorna o tamanho atual do cache
   */
  get size(): number {
    return this.cache.size;
  }

  /**
   * Retorna todas as chaves do cache
   */
  keys(): IterableIterator<K> {
    return this.cache.keys();
  }

  /**
   * Retorna todos os valores do cache
   */
  values(): IterableIterator<V> {
    return this.cache.values();
  }

  /**
   * Retorna todas as entradas do cache
   */
  entries(): IterableIterator<[K, V]> {
    return this.cache.entries();
  }
}
