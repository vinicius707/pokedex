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
import {
  ApiPokemonListResponse,
  ApiPokemonDetailResponse,
  ApiTypeResponse,
} from 'src/app/shared/models/api-responses';
import { catchError, map, mergeMap, toArray } from 'rxjs/operators';
import {
  sanitizeSearchInput,
  isValidPokemonId,
  extractPokemonIdFromUrl,
} from 'src/app/shared/utils/security.utils';
import { LRUCache } from 'src/app/shared/utils/lru-cache';
import { retryWithBackoff } from 'src/app/shared/utils/http-retry';

interface TypeFilterData {
  pokemonIds: number[];
  totalCount: number;
}

@Injectable({
  providedIn: 'root',
})
export class PokemonService {
  private readonly API_URL = 'https://pokeapi.co/api/v2';
  private readonly pageSize = 10;
  private readonly maxConcurrentRequests = 4;

  // Caches com limite de tamanho para evitar memory leaks
  private readonly listCacheMaxSize = 200;
  private readonly detailsCacheMaxSize = 100;
  private readonly typeFilterPokemonCacheMaxSize = 500;

  private readonly listCache = new LRUCache<number, PokemonListItem>(this.listCacheMaxSize);
  private readonly detailsCache = new LRUCache<number, Pokemon>(this.detailsCacheMaxSize);
  private readonly typeFilterCache = new Map<Type, TypeFilterData>(); // 18 tipos max, não precisa de LRU
  private readonly typeFilterPokemonCache = new LRUCache<string, PokemonListItem>(
    this.typeFilterPokemonCacheMaxSize
  );

  public readonly currentPage = signal(1);
  public readonly totalPokemons = signal(0);
  public readonly loading = signal(false);

  // Filtros
  public readonly searchTerm = signal('');
  public readonly selectedType = signal<Type | null>(null);

  // Modo filtro por tipo (quando ativo, usa API /type/{type})
  public readonly typeFilterMode = signal(false);
  public readonly typeFilterPage = signal(1);
  public readonly typeFilterTotal = signal(0);

  public readonly totalPages = computed(() => {
    if (this.typeFilterMode()) {
      return Math.ceil(this.typeFilterTotal() / this.pageSize);
    }
    return Math.ceil(this.totalPokemons() / this.pageSize);
  });

  public readonly typeFilterTotalPages = computed(() =>
    Math.ceil(this.typeFilterTotal() / this.pageSize)
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

  // Pokemons paginados do filtro por tipo
  public readonly typeFilterPaginatedPokemons = computed(() => {
    const type = this.selectedType();
    if (!type || !this.typeFilterMode()) {
      return [];
    }

    const page = this.typeFilterPage();
    const typeData = this.typeFilterCache.get(type);
    if (!typeData) {
      return [];
    }

    const startIndex = (page - 1) * this.pageSize;
    const endIndex = Math.min(startIndex + this.pageSize, typeData.totalCount);
    const pokemons: PokemonListItem[] = [];

    for (let i = startIndex; i < endIndex; i++) {
      const pokemonId = typeData.pokemonIds[i];
      const cacheKey = `${type}-${pokemonId}`;
      const pokemon = this.typeFilterPokemonCache.get(cacheKey);
      if (pokemon) {
        pokemons.push(pokemon);
      }
    }

    return pokemons;
  });

  public readonly filteredPokemons = computed(() => {
    // Se estiver no modo filtro por tipo, usa os resultados do filtro
    if (this.typeFilterMode()) {
      let result = this.typeFilterPaginatedPokemons();
      const search = this.searchTerm().toLowerCase().trim();

      if (search) {
        result = result.filter(
          (p) =>
            p.name.toLowerCase().includes(search) ||
            p.id.toString().includes(search)
        );
      }

      return result;
    }

    // Modo normal
    let result = this.paginatedPokemons();
    const search = this.searchTerm().toLowerCase().trim();

    if (search) {
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(search) ||
          p.id.toString().includes(search)
      );
    }

    return result;
  });

  // Computed para página atual (considera ambos os modos)
  public readonly effectiveCurrentPage = computed(() => {
    if (this.typeFilterMode()) {
      return this.typeFilterPage();
    }
    return this.currentPage();
  });

  constructor(private httpClient: HttpClient) {
    this.initialize();
  }

  public initialize(): void {
    this.loading.set(true);
    this.httpClient
      .get<ApiPokemonListResponse>(`${this.API_URL}/pokemon/?limit=1`)
      .pipe(
        retryWithBackoff({ maxRetries: 3 }),
        map((value) => value.count)
      )
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
      .get<ApiPokemonListResponse>(pokemonsUrl)
      .pipe(
        retryWithBackoff({ maxRetries: 2 }),
        map((value) => value.results),
        map((results) =>
          results.map((result, index) => ({
            url: result.url,
            position: startPosition + index,
          }))
        ),
        mergeMap((items) => from(items)),
        mergeMap(
          (item) =>
            this.httpClient
              .get<ApiPokemonDetailResponse>(item.url)
              .pipe(
                retryWithBackoff({ maxRetries: 2 }),
                map((data) => ({ ...data, position: item.position }))
              ),
          this.maxConcurrentRequests
        )
      )
      .subscribe({
        next: (result) => {
          const pokemon: PokemonListItem = {
            id: result.id,
            name: result.name,
            image:
              result.sprites.other?.['official-artwork']?.front_default ||
              result.sprites.front_default ||
              '',
            types: result.types.map((t) => t.type.name as Type),
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
            // Pre-carrega a próxima página em background
            this.preloadAdjacentPage(page + 1);
          }
          this.loading.set(false);
        },
        error: () => {
          this.loading.set(false);
        },
      });
  }

  /**
   * Pré-carrega uma página em background sem afetar o loading state
   */
  private preloadAdjacentPage(page: number): void {
    const totalPages = Math.ceil(this.totalPokemons() / this.pageSize);
    if (page < 1 || page > totalPages) {
      return;
    }

    const startPosition = (page - 1) * this.pageSize + 1;
    const endPosition = Math.min(
      startPosition + this.pageSize - 1,
      this.totalPokemons()
    );

    // Verifica se todos os pokemons já estão em cache
    let allCached = true;
    for (let pos = startPosition; pos <= endPosition; pos++) {
      if (!this.listCache.has(pos)) {
        allCached = false;
        break;
      }
    }

    if (allCached) {
      return;
    }

    const pokemonsUrl = `${this.API_URL}/pokemon/?offset=${
      startPosition - 1
    }&limit=${this.pageSize}`;

    // Carrega em background sem afetar loading state
    this.httpClient
      .get<ApiPokemonListResponse>(pokemonsUrl)
      .pipe(
        retryWithBackoff({ maxRetries: 1 }),
        map((value) => value.results),
        map((results) =>
          results.map((result, index) => ({
            url: result.url,
            position: startPosition + index,
          }))
        ),
        mergeMap((items) => from(items)),
        mergeMap(
          (item) =>
            this.httpClient
              .get<ApiPokemonDetailResponse>(item.url)
              .pipe(
                retryWithBackoff({ maxRetries: 1 }),
                map((data) => ({ ...data, position: item.position }))
              ),
          this.maxConcurrentRequests
        )
      )
      .subscribe({
        next: (result) => {
          if (!this.listCache.has(result.position)) {
            const pokemon: PokemonListItem = {
              id: result.id,
              name: result.name,
              image:
                result.sprites.other?.['official-artwork']?.front_default ||
                result.sprites.front_default ||
                '',
              types: result.types.map((t) => t.type.name as Type),
            };
            this.listCache.set(result.position, pokemon);
          }
        },
        // Errors são silenciados para preload em background
        error: () => {},
      });
  }

  public getPokemonById(id: number): Observable<Pokemon> {
    if (!isValidPokemonId(id)) {
      throw new Error('Invalid Pokemon ID');
    }

    if (this.detailsCache.has(id)) {
      return of(this.detailsCache.get(id)!);
    }

    return this.httpClient
      .get<ApiPokemonDetailResponse>(`${this.API_URL}/pokemon/${id}`)
      .pipe(
        retryWithBackoff({ maxRetries: 2 }),
        map((result) => {
          const pokemon: Pokemon = {
            id: result.id,
            name: result.name,
            image:
              result.sprites.other?.['official-artwork']?.front_default ||
              result.sprites.front_default ||
              '',
            sprites: {
              front_default: result.sprites.front_default,
              front_shiny: result.sprites.front_shiny,
              back_default: result.sprites.back_default,
              back_shiny: result.sprites.back_shiny,
              other: result.sprites.other,
            },
            types: result.types.map((t) => t.type.name as Type),
            stats: result.stats.map(
              (s): PokemonStat => ({
                name: this.formatStatName(s.stat.name),
                value: s.base_stat,
              })
            ),
            abilities: result.abilities.map(
              (a): PokemonAbility => ({
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
    const sanitizedName = sanitizeSearchInput(name);
    if (!sanitizedName) {
      return of(null);
    }

    return this.httpClient
      .get<ApiPokemonDetailResponse>(
        `${this.API_URL}/pokemon/${sanitizedName.toLowerCase()}`
      )
      .pipe(
        map((result) => {
          const pokemon: Pokemon = {
            id: result.id,
            name: result.name,
            image:
              result.sprites.other?.['official-artwork']?.front_default ||
              result.sprites.front_default ||
              '',
            sprites: {
              front_default: result.sprites.front_default,
              front_shiny: result.sprites.front_shiny,
              back_default: result.sprites.back_default,
              back_shiny: result.sprites.back_shiny,
              other: result.sprites.other,
            },
            types: result.types.map((t) => t.type.name as Type),
            stats: result.stats.map(
              (s): PokemonStat => ({
                name: this.formatStatName(s.stat.name),
                value: s.base_stat,
              })
            ),
            abilities: result.abilities.map(
              (a): PokemonAbility => ({
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
    if (type === null) {
      // Desativa o modo filtro por tipo
      this.typeFilterMode.set(false);
      this.selectedType.set(null);
      return;
    }

    this.selectedType.set(type);
    this.loadPokemonsByType(type);
  }

  public loadPokemonsByType(type: Type): void {
    this.loading.set(true);
    this.typeFilterMode.set(true);
    this.typeFilterPage.set(1);

    // Verifica se já tem no cache
    if (this.typeFilterCache.has(type)) {
      const typeData = this.typeFilterCache.get(type)!;
      this.typeFilterTotal.set(typeData.totalCount);
      this.loadTypeFilterPage(1);
      return;
    }

    // Busca na API
    this.httpClient
      .get<ApiTypeResponse>(`${this.API_URL}/type/${type}`)
      .pipe(
        retryWithBackoff({ maxRetries: 2 }),
        map((result) => {
          const pokemonIds: number[] = result.pokemon
            .map((p) => extractPokemonIdFromUrl(p.pokemon.url))
            .filter((id): id is number => id !== null)
            .sort((a, b) => a - b);

          return {
            pokemonIds,
            totalCount: pokemonIds.length,
          };
        })
      )
      .subscribe({
        next: (typeData) => {
          this.typeFilterCache.set(type, typeData);
          this.typeFilterTotal.set(typeData.totalCount);
          this.loadTypeFilterPage(1);
        },
        error: () => {
          this.loading.set(false);
          this.typeFilterMode.set(false);
        },
      });
  }

  public loadTypeFilterPage(page: number): void {
    const type = this.selectedType();
    if (!type || !this.typeFilterMode()) {
      return;
    }

    const typeData = this.typeFilterCache.get(type);
    if (!typeData) {
      return;
    }

    const totalPages = Math.ceil(typeData.totalCount / this.pageSize);
    if (page < 1 || page > totalPages) {
      return;
    }

    const startIndex = (page - 1) * this.pageSize;
    const endIndex = Math.min(startIndex + this.pageSize, typeData.totalCount);

    // Verifica quais pokemons precisam ser carregados
    const pokemonsToLoad: number[] = [];
    for (let i = startIndex; i < endIndex; i++) {
      const pokemonId = typeData.pokemonIds[i];
      const cacheKey = `${type}-${pokemonId}`;
      if (!this.typeFilterPokemonCache.has(cacheKey)) {
        pokemonsToLoad.push(pokemonId);
      }
    }

    if (pokemonsToLoad.length === 0) {
      this.typeFilterPage.set(page);
      this.loading.set(false);
      return;
    }

    this.loading.set(true);

    // Carrega os detalhes dos pokemons com limite de concorrência
    from(pokemonsToLoad)
      .pipe(
        mergeMap(
          (pokemonId) =>
            this.httpClient
              .get<ApiPokemonDetailResponse>(
                `${this.API_URL}/pokemon/${pokemonId}`
              )
              .pipe(
                retryWithBackoff({ maxRetries: 2 }),
                map((data) => ({ data, type }))
              ),
          this.maxConcurrentRequests
        ),
        toArray()
      )
      .subscribe({
        next: (results) => {
          results.forEach(({ data, type: t }) => {
            const pokemon: PokemonListItem = {
              id: data.id,
              name: data.name,
              image:
                data.sprites.other?.['official-artwork']?.front_default ||
                data.sprites.front_default ||
                '',
              types: data.types.map((tp) => tp.type.name as Type),
            };
            const cacheKey = `${t}-${data.id}`;
            this.typeFilterPokemonCache.set(cacheKey, pokemon);
          });
        },
        complete: () => {
          this.typeFilterPage.set(page);
          this.loading.set(false);
        },
        error: () => {
          this.loading.set(false);
        },
      });
  }

  public clearFilters(): void {
    this.searchTerm.set('');
    this.selectedType.set(null);
    this.typeFilterMode.set(false);
    this.typeFilterPage.set(1);
    this.typeFilterTotal.set(0);
  }

  public goToPage(page: number): void {
    if (this.typeFilterMode()) {
      this.loadTypeFilterPage(page);
    } else {
      this.loadPage(page);
    }
  }

  public nextPage(): void {
    if (this.typeFilterMode()) {
      const currentPage = this.typeFilterPage();
      if (currentPage < this.totalPages()) {
        this.loadTypeFilterPage(currentPage + 1);
      }
    } else {
      if (this.currentPage() < this.totalPages()) {
        this.loadPage(this.currentPage() + 1);
      }
    }
  }

  public previousPage(): void {
    if (this.typeFilterMode()) {
      const currentPage = this.typeFilterPage();
      if (currentPage > 1) {
        this.loadTypeFilterPage(currentPage - 1);
      }
    } else {
      if (this.currentPage() > 1) {
        this.loadPage(this.currentPage() - 1);
      }
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
