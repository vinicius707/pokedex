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
    const startPosition = (page - 1) * this.pageSize + 1;
    const endPosition = Math.min(
      startPosition + this.pageSize - 1,
      this.totalPokemons()
    );
    const pokemons: Pokemon[] = [];

    // Cache usa posição (1-indexed) como chave, não o ID real do pokemon
    for (let pos = startPosition; pos <= endPosition; pos++) {
      const pokemon = this.pokemonsCache.get(pos);
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
    const totalPages = this.totalPages();
    if (page < 1 || page > totalPages) {
      return;
    }

    // Usar posição (1-indexed) em vez de ID real do pokemon
    const startPosition = (page - 1) * this.pageSize + 1;
    const endPosition = Math.min(
      startPosition + this.pageSize - 1,
      this.totalPokemons()
    );

    // Verificar quais posições precisam ser carregadas
    const positionsToLoad: number[] = [];
    for (let pos = startPosition; pos <= endPosition; pos++) {
      if (!this.pokemonsCache.has(pos)) {
        positionsToLoad.push(pos);
      }
    }

    // Se todos já estão no cache, apenas atualizar a página
    if (positionsToLoad.length === 0) {
      this.currentPage.set(page);
      return;
    }

    this.loading.set(true);
    const pokemonsUrl = `https://pokeapi.co/api/v2/pokemon/?offset=${
      startPosition - 1
    }&limit=${this.pageSize}`;

    this.httpClient
      .get<any>(pokemonsUrl)
      .pipe(
        map((value) => value.results),
        map((results: any[]) => {
          // Mapear resultados com suas posições
          return results.map((result, index) => ({
            url: result.url,
            position: startPosition + index,
          }));
        }),
        mergeMap((items) => from(items)),
        mergeMap((item: any) =>
          this.httpClient
            .get(item.url)
            .pipe(map((data: any) => ({ ...data, position: item.position })))
        )
      )
      .subscribe({
        next: (result: any) => {
          const pokemon: Pokemon = {
            image: result.sprites.front_default,
            number: result.id,
            name: result.name,
            types: result.types.map((t: any) => t.type.name),
          };
          // Usar posição em vez de ID real
          this.pokemonsCache.set(result.position, pokemon);
        },
        complete: () => {
          // Verificar se todos os pokemons da página foram carregados
          const startPos = (page - 1) * this.pageSize + 1;
          const endPos = Math.min(
            startPos + this.pageSize - 1,
            this.totalPokemons()
          );
          let allLoaded = true;

          for (let pos = startPos; pos <= endPos; pos++) {
            if (!this.pokemonsCache.has(pos)) {
              allLoaded = false;
              break;
            }
          }

          if (allLoaded) {
            this.currentPage.set(page);
          }
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
