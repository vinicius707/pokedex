import { Component } from '@angular/core';
import { PokemonListComponent } from './features/pokedex/components/pokemon-list/pokemon-list.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.sass'],
  standalone: true,
  imports: [PokemonListComponent]
})
export class AppComponent {
  title = 'pokedex';
}
