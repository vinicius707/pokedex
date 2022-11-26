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
      image: '',
      number: 1,
      name: 'Bulbassaur',
      types: [
        Type.Grass,
        Type.Poison
      ]
    },
  ];
}



