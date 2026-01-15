import { Injectable, computed, signal, effect } from '@angular/core';
import { isValidPokemonId } from 'src/app/shared/utils/security.utils';

@Injectable({
  providedIn: 'root',
})
export class FavoritesService {
  private readonly storageKey = 'pokemon-favorites';
  private readonly maxFavorites = 1000;
  public readonly favorites = signal<number[]>(this.loadFromStorage());

  public readonly favoritesCount = computed(() => this.favorites().length);

  constructor() {
    // Salvar automaticamente quando favorites mudar
    effect(() => {
      this.saveToStorage(this.favorites());
    });
  }

  public toggle(id: number): void {
    if (!isValidPokemonId(id)) {
      console.warn('Invalid Pokemon ID:', id);
      return;
    }

    this.favorites.update((current) => {
      if (current.includes(id)) {
        return current.filter((fav) => fav !== id);
      } else {
        // Limita número máximo de favoritos
        if (current.length >= this.maxFavorites) {
          console.warn('Maximum favorites limit reached');
          return current;
        }
        return [...current, id];
      }
    });
  }

  public add(id: number): void {
    if (!isValidPokemonId(id)) {
      console.warn('Invalid Pokemon ID:', id);
      return;
    }

    if (!this.isFavorite(id) && this.favorites().length < this.maxFavorites) {
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
      if (!stored) {
        return [];
      }

      const parsed = JSON.parse(stored);

      // Valida que é um array
      if (!Array.isArray(parsed)) {
        console.warn('Invalid favorites data format, resetting');
        return [];
      }

      // Valida e filtra cada item
      const validated = parsed
        .filter((item): item is number => {
          return typeof item === 'number' && isValidPokemonId(item);
        })
        .slice(0, this.maxFavorites); // Limita ao máximo

      // Remove duplicatas
      return [...new Set(validated)];
    } catch (error) {
      console.error('Erro ao carregar favoritos:', error);
      return [];
    }
  }

  private saveToStorage(favorites: number[]): void {
    try {
      // Valida antes de salvar
      const validated = favorites
        .filter((id) => isValidPokemonId(id))
        .slice(0, this.maxFavorites);

      localStorage.setItem(this.storageKey, JSON.stringify(validated));
    } catch (error) {
      console.error('Erro ao salvar favoritos:', error);
    }
  }
}
