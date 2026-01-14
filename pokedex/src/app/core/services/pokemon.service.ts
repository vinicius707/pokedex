import { HttpClient } from '@angular/common/http';
import { Injectable, computed, signal } from '@angular/core';
import { Observable, forkJoin, from, of } from 'rxjs';
import {
  Pokemon,
  PokemonListItem,
  PokemonStat,
  PokemonAbility,
} from 'src/app/shared/models/pokemon';
import { Type } from 'src/app/shared/models/type';
import { catchError, map, mergeMap, toArray } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class PokemonService {
  private readonly API_URL = 'https://pokeapi.co/api/v2';
  private readonly listCache = new Map<number, PokemonListItem>();
  private readonly detailsCache = new Map<number, Pokemon>();
  private readonly pageSize = 10;

  public readonly currentPage = signal(1);
  public readonly totalPokemons = signal(0);
  public readonly loading = signal(false);

  // Filtros
  public readonly searchTerm = signal('');
  public readonly selectedType = signal<Type | null>(null);

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
    const pokemons: PokemonListItem[] = [];

    for (let pos = startPosition; pos <= endPosition; pos++) {
      const pokemon = this.listCache.get(pos);
      if (pokemon) {
        pokemons.push(pokemon);
      }
    }

    return pokemons;
  });

  public readonly filteredPokemons = computed(() => {
    let result = this.paginatedPokemons();
    const search = this.searchTerm().toLowerCase().trim();
    const type = this.selectedType();

    if (search) {
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(search) ||
          p.id.toString().includes(search)
      );
    }

    if (type) {
      result = result.filter((p) => p.types.includes(type));
    }

    return result;
  });

  constructor(private httpClient: HttpClient) {
    this.initialize();
  }

  public initialize(): void {
    this.loading.set(true);
    this.httpClient
      .get<any>(`${this.API_URL}/pokemon/?limit=1`)
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

    const startPosition = (page - 1) * this.pageSize + 1;
    const endPosition = Math.min(
      startPosition + this.pageSize - 1,
      this.totalPokemons()
    );

    const positionsToLoad: number[] = [];
    for (let pos = startPosition; pos <= endPosition; pos++) {
      if (!this.listCache.has(pos)) {
        positionsToLoad.push(pos);
      }
    }

    if (positionsToLoad.length === 0) {
      this.currentPage.set(page);
      return;
    }

    this.loading.set(true);
    const pokemonsUrl = `${this.API_URL}/pokemon/?offset=${
      startPosition - 1
    }&limit=${this.pageSize}`;

    this.httpClient
      .get<any>(pokemonsUrl)
      .pipe(
        map((value) => value.results),
        map((results: any[]) =>
          results.map((result, index) => ({
            url: result.url,
            position: startPosition + index,
          }))
        ),
        mergeMap((items) => from(items)),
        mergeMap((item: any) =>
          this.httpClient
            .get(item.url)
            .pipe(map((data: any) => ({ ...data, position: item.position })))
        )
      )
      .subscribe({
        next: (result: any) => {
          const pokemon: PokemonListItem = {
            id: result.id,
            name: result.name,
            image:
              result.sprites.other?.['official-artwork']?.front_default ||
              result.sprites.front_default,
            types: result.types.map((t: any) => t.type.name as Type),
          };
          this.listCache.set(result.position, pokemon);
        },
        complete: () => {
          const startPos = (page - 1) * this.pageSize + 1;
          const endPos = Math.min(
            startPos + this.pageSize - 1,
            this.totalPokemons()
          );
          let allLoaded = true;

          for (let pos = startPos; pos <= endPos; pos++) {
            if (!this.listCache.has(pos)) {
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

  public getPokemonById(id: number): Observable<Pokemon> {
    if (this.detailsCache.has(id)) {
      return of(this.detailsCache.get(id)!);
    }

    return this.httpClient.get<any>(`${this.API_URL}/pokemon/${id}`).pipe(
      map((result) => {
        const pokemon: Pokemon = {
          id: result.id,
          name: result.name,
          image:
            result.sprites.other?.['official-artwork']?.front_default ||
            result.sprites.front_default,
          sprites: {
            front_default: result.sprites.front_default,
            front_shiny: result.sprites.front_shiny,
            back_default: result.sprites.back_default,
            back_shiny: result.sprites.back_shiny,
            other: result.sprites.other,
          },
          types: result.types.map((t: any) => t.type.name as Type),
          stats: result.stats.map(
            (s: any): PokemonStat => ({
              name: this.formatStatName(s.stat.name),
              value: s.base_stat,
            })
          ),
          abilities: result.abilities.map(
            (a: any): PokemonAbility => ({
              name: a.ability.name.replace(/-/g, ' '),
              isHidden: a.is_hidden,
            })
          ),
          height: result.height,
          weight: result.weight,
          speciesUrl: result.species.url,
        };
        this.detailsCache.set(id, pokemon);
        return pokemon;
      })
    );
  }

  public searchPokemonByName(name: string): Observable<Pokemon | null> {
    return this.httpClient
      .get<any>(`${this.API_URL}/pokemon/${name.toLowerCase()}`)
      .pipe(
        map((result) => {
          const pokemon: Pokemon = {
            id: result.id,
            name: result.name,
            image:
              result.sprites.other?.['official-artwork']?.front_default ||
              result.sprites.front_default,
            sprites: {
              front_default: result.sprites.front_default,
              front_shiny: result.sprites.front_shiny,
              back_default: result.sprites.back_default,
              back_shiny: result.sprites.back_shiny,
              other: result.sprites.other,
            },
            types: result.types.map((t: any) => t.type.name as Type),
            stats: result.stats.map(
              (s: any): PokemonStat => ({
                name: this.formatStatName(s.stat.name),
                value: s.base_stat,
              })
            ),
            abilities: result.abilities.map(
              (a: any): PokemonAbility => ({
                name: a.ability.name.replace(/-/g, ' '),
                isHidden: a.is_hidden,
              })
            ),
            height: result.height,
            weight: result.weight,
            speciesUrl: result.species.url,
          };
          return pokemon;
        }),
        catchError(() => of(null))
      );
  }

  public setSearchTerm(term: string): void {
    this.searchTerm.set(term);
  }

  public setSelectedType(type: Type | null): void {
    this.selectedType.set(type);
  }

  public clearFilters(): void {
    this.searchTerm.set('');
    this.selectedType.set(null);
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

  private formatStatName(name: string): string {
    const statNames: Record<string, string> = {
      hp: 'HP',
      attack: 'Attack',
      defense: 'Defense',
      'special-attack': 'Sp. Atk',
      'special-defense': 'Sp. Def',
      speed: 'Speed',
    };
    return statNames[name] || name;
  }
}
