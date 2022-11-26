import { Component } from '@angular/core';
import { IPokemon } from 'src/model/pokemon';
import { Type } from 'src/model/type';

@Component({
  selector: 'app-pokemon-list',
  templateUrl: './pokemon-list.component.html',
  styleUrls: ['./pokemon-list.component.sass'],
})
export class PokemonListComponent {
  public pokemons: IPokemon[] = [
    {
      image: 'https://assets.pokemon.com/assets/cms2/img/pokedex/detail/001.png',
      number: 1,
      name: 'Bulbassaur',
      types: [
        Type.Grass,
        Type.Poison
      ]
    },
    {
      image: 'https://assets.pokemon.com/assets/cms2/img/pokedex/detail/002.png',
      number: 2,
      name: 'Ivysaur',
      types: [
        Type.Grass,
        Type.Poison
      ]
    },
    {
      image: 'https://assets.pokemon.com/assets/cms2/img/pokedex/detail/003.png',
      number: 3,
      name: 'Venosaur',
      types: [
        Type.Grass,
        Type.Poison
      ]
    },
    {
      image: 'https://assets.pokemon.com/assets/cms2/img/pokedex/detail/004.png',
      number: 4,
      name: 'Charmander',
      types: [
        Type.Fire
      ]
    },
  ];
}



