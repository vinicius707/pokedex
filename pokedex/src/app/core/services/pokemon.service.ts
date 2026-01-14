import { HttpClient } from '@angular/common/http';
import { Injectable, computed, signal } from '@angular/core';
import { from } from 'rxjs';
import { Pokemon } from 'src/app/shared/models/pokemon';
import { map, mergeMap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class PokemonService {
  private readonly pokemonsCache = new Map<number, Pokemon>();
  private readonly pageSize = 10;

  public readonly currentPage = signal(1);
  public readonly totalPokemons = signal(0);
  public readonly loading = signal(false);

  public readonly totalPages = computed(() =>
    Math.ceil(this.totalPokemons() / this.pageSize)
  );

  public readonly paginatedPokemons = computed(() => {
    const page = this.currentPage();
    const startId = (page - 1) * this.pageSize + 1;
    const endId = Math.min(startId + this.pageSize - 1, this.totalPokemons());
    const pokemons: Pokemon[] = [];
    
    for (let id = startId; id <= endId; id++) {
      const pokemon = this.pokemonsCache.get(id);
      if (pokemon) {
        pokemons.push(pokemon);
      }
    }
    
    return pokemons;
  });

  constructor(private httpClient: HttpClient) {
    this.initialize();
  }

  public initialize(): void {
    this.loading.set(true);
    this.httpClient
      .get<any>('https://pokeapi.co/api/v2/pokemon/?limit=1')
      .pipe(map((value) => value.count))
      .subscribe({
        next: (count) => {
          this.totalPokemons.set(count);
          this.loadPage(1);
        },
        error: () => {
          this.loading.set(false);
        },
      });
  }

  public loadPage(page: number): void {
    if (page < 1 || page > this.totalPages()) {
      return;
    }

    const startIndex = (page - 1) * this.pageSize + 1;
    const endIndex = Math.min(startIndex + this.pageSize - 1, this.totalPokemons());
    
    const pokemonsToLoad: number[] = [];
    for (let i = startIndex; i <= endIndex; i++) {
      if (!this.pokemonsCache.has(i)) {
        pokemonsToLoad.push(i);
      }
    }

    if (pokemonsToLoad.length === 0) {
      this.currentPage.set(page);
      return;
    }

    this.loading.set(true);
    const pokemonsUrl = `https://pokeapi.co/api/v2/pokemon/?offset=${startIndex - 1}&limit=${this.pageSize}`;

    this.httpClient
      .get<any>(pokemonsUrl)
      .pipe(
        map((value) => value.results),
        map((value: any) => {
          return from(value).pipe(
            mergeMap((v: any) => this.httpClient.get(v.url))
          );
        }),
        mergeMap((value) => value)
      )
      .subscribe({
        next: (result: any) => {
          const pokemon: Pokemon = {
            image: result.sprites.front_default,
            number: result.id,
            name: result.name,
            types: result.types.map((t: any) => t.type.name),
          };
          this.pokemonsCache.set(result.id, pokemon);
        },
        complete: () => {
          this.currentPage.set(page);
          this.loading.set(false);
        },
        error: () => {
          this.loading.set(false);
        },
      });
  }


  public goToPage(page: number): void {
    this.loadPage(page);
  }

  public nextPage(): void {
    if (this.currentPage() < this.totalPages()) {
      this.loadPage(this.currentPage() + 1);
    }
  }

  public previousPage(): void {
    if (this.currentPage() > 1) {
      this.loadPage(this.currentPage() - 1);
    }
  }
}
