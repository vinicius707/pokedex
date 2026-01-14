import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { PokemonCardComponent } from '../pokemon-card/pokemon-card.component';
import { PokemonService } from '../../../../core/services/pokemon.service';

@Component({
  selector: 'app-pokemon-list',
  templateUrl: './pokemon-list.component.html',
  styleUrls: ['./pokemon-list.component.sass'],
  standalone: true,
  imports: [CommonModule, PokemonCardComponent]
})
export class PokemonListComponent {

  constructor(public pokemonService: PokemonService) {}

  getPageNumbers(): number[] {
    const total = this.pokemonService.totalPages();
    const current = this.pokemonService.currentPage();
    const maxVisible = 10;
    
    if (total <= maxVisible) {
      return Array.from({ length: total }, (_, i) => i + 1);
    }

    const half = Math.floor(maxVisible / 2);
    let start = Math.max(1, current - half);
    let end = Math.min(total, start + maxVisible - 1);

    if (end - start < maxVisible - 1) {
      start = Math.max(1, end - maxVisible + 1);
    }

    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  }

  goToPage(page: number): void {
    this.pokemonService.goToPage(page);
  }

  nextPage(): void {
    this.pokemonService.nextPage();
  }

  previousPage(): void {
    this.pokemonService.previousPage();
  }
}
