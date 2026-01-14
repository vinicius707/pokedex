import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import {
  EvolutionChain,
  EvolutionChainLink,
  SpeciesInfo,
} from 'src/app/shared/models/evolution';

@Injectable({
  providedIn: 'root',
})
export class EvolutionService {
  private readonly API_URL = 'https://pokeapi.co/api/v2';
  private readonly speciesCache = new Map<number, SpeciesInfo>();
  private readonly evolutionCache = new Map<number, EvolutionChain>();

  constructor(private httpClient: HttpClient) {}

  public getSpeciesInfo(pokemonId: number): Observable<SpeciesInfo | null> {
    if (this.speciesCache.has(pokemonId)) {
      return of(this.speciesCache.get(pokemonId)!);
    }

    return this.httpClient
      .get<any>(`${this.API_URL}/pokemon-species/${pokemonId}`)
      .pipe(
        map((data) => {
          const flavorTextEntry = data.flavor_text_entries.find(
            (entry: any) => entry.language.name === 'en'
          );
          const genusEntry = data.genera.find(
            (entry: any) => entry.language.name === 'en'
          );

          const speciesInfo: SpeciesInfo = {
            id: data.id,
            name: data.name,
            evolutionChainUrl: data.evolution_chain.url,
            generation: this.extractGenerationNumber(data.generation.url),
            flavorText: flavorTextEntry?.flavor_text?.replace(/\f/g, ' ') || '',
            genus: genusEntry?.genus || '',
          };

          this.speciesCache.set(pokemonId, speciesInfo);
          return speciesInfo;
        }),
        catchError(() => of(null))
      );
  }

  public getEvolutionChain(pokemonId: number): Observable<EvolutionChain | null> {
    return this.getSpeciesInfo(pokemonId).pipe(
      switchMap((speciesInfo) => {
        if (!speciesInfo) {
          return of(null);
        }

        const chainId = this.extractChainId(speciesInfo.evolutionChainUrl);
        if (this.evolutionCache.has(chainId)) {
          return of(this.evolutionCache.get(chainId)!);
        }

        return this.httpClient.get<any>(speciesInfo.evolutionChainUrl).pipe(
          map((data) => {
            const chain = this.parseEvolutionChain(data.chain);
            const evolutionChain: EvolutionChain = {
              id: chainId,
              chain,
            };
            this.evolutionCache.set(chainId, evolutionChain);
            return evolutionChain;
          }),
          catchError(() => of(null))
        );
      })
    );
  }

  private parseEvolutionChain(chain: any): EvolutionChainLink[] {
    const result: EvolutionChainLink[] = [];
    this.traverseChain(chain, result);
    return result;
  }

  private traverseChain(node: any, result: EvolutionChainLink[]): void {
    const id = this.extractPokemonId(node.species.url);
    const evolutionDetails = node.evolution_details[0];

    result.push({
      id,
      name: node.species.name,
      image: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`,
      minLevel: evolutionDetails?.min_level || null,
      trigger: evolutionDetails?.trigger?.name || null,
      item: evolutionDetails?.item?.name || null,
    });

    if (node.evolves_to && node.evolves_to.length > 0) {
      for (const evolution of node.evolves_to) {
        this.traverseChain(evolution, result);
      }
    }
  }

  private extractPokemonId(url: string): number {
    const matches = url.match(/\/pokemon-species\/(\d+)\//);
    return matches ? parseInt(matches[1], 10) : 0;
  }

  private extractChainId(url: string): number {
    const matches = url.match(/\/evolution-chain\/(\d+)\//);
    return matches ? parseInt(matches[1], 10) : 0;
  }

  private extractGenerationNumber(url: string): number {
    const matches = url.match(/\/generation\/(\d+)\//);
    return matches ? parseInt(matches[1], 10) : 0;
  }
}
