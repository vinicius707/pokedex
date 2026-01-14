import { Injectable, computed, signal, effect } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class FavoritesService {
  private readonly storageKey = 'pokemon-favorites';
  public readonly favorites = signal<number[]>(this.loadFromStorage());

  public readonly favoritesCount = computed(() => this.favorites().length);

  constructor() {
    // Salvar automaticamente quando favorites mudar
    effect(() => {
      this.saveToStorage(this.favorites());
    });
  }

  public toggle(id: number): void {
    this.favorites.update((current) => {
      if (current.includes(id)) {
        return current.filter((fav) => fav !== id);
      } else {
        return [...current, id];
      }
    });
  }

  public add(id: number): void {
    if (!this.isFavorite(id)) {
      this.favorites.update((current) => [...current, id]);
    }
  }

  public remove(id: number): void {
    this.favorites.update((current) => current.filter((fav) => fav !== id));
  }

  public isFavorite(id: number): boolean {
    return this.favorites().includes(id);
  }

  public clear(): void {
    this.favorites.set([]);
  }

  private loadFromStorage(): number[] {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.error('Erro ao carregar favoritos:', error);
    }
    return [];
  }

  private saveToStorage(favorites: number[]): void {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(favorites));
    } catch (error) {
      console.error('Erro ao salvar favoritos:', error);
    }
  }
}
