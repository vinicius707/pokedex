import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { PokemonCardComponent } from '../pokemon-card/pokemon-card.component';
import { PokemonService } from '../services/pokemon.service';

@Component({
  selector: 'app-pokemon-list',
  templateUrl: './pokemon-list.component.html',
  styleUrls: ['./pokemon-list.component.sass'],
  standalone: true,
  imports: [CommonModule, PokemonCardComponent]
})
export class PokemonListComponent {

  constructor(public pokemonService: PokemonService) {}
}
