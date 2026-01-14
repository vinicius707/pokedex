import { HttpClient } from '@angular/common/http';
import { Injectable, computed, signal } from '@angular/core';
import { from } from 'rxjs';
import { Pokemon } from 'src/app/shared/models/pokemon';
import { map, mergeMap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class PokemonService {
  public readonly pokemons = signal<Pokemon[]>([]);
  public readonly pokemonList = computed(() =>
    this.pokemons().filter((pokemon): pokemon is Pokemon => !!pokemon)
  );

  constructor(private httpClient: HttpClient) {
    const pokemonsUrl = 'https://pokeapi.co/api/v2/pokemon/?limit=40';

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
      .subscribe((result: any) =>
        this.pokemons.update((current) => {
          const next = [...current];
          next[result.id] = {
            image: result.sprites.front_default,
            number: result.id,
            name: result.name,
            types: result.types.map((t: any) => t.type.name),
          };
          return next;
        })
      );
  }
}
