import { CommonModule } from '@angular/common';
import { Component, computed } from '@angular/core';
import { Router } from '@angular/router';
import { PokemonCardComponent } from '../pokemon-card/pokemon-card.component';
import { SearchFilterComponent } from '../search-filter/search-filter.component';
import { PokemonService } from '../../../../core/services/pokemon.service';
import { FavoritesService } from '../../../../core/services/favorites.service';
import { PokemonListItem } from '../../../../shared/models/pokemon';

type PageItem = number | 'ellipsis';

interface PaginationInfo {
  items: PageItem[];
  showFirst: boolean;
  showLast: boolean;
  showPrevious: boolean;
  showNext: boolean;
  currentPage: number;
  totalPages: number;
}

@Component({
  selector: 'app-pokemon-list',
  templateUrl: './pokemon-list.component.html',
  styleUrls: ['./pokemon-list.component.sass'],
  standalone: true,
  imports: [CommonModule, PokemonCardComponent, SearchFilterComponent],
})
export class PokemonListComponent {
  constructor(
    public pokemonService: PokemonService,
    public favoritesService: FavoritesService,
    private router: Router
  ) {}

  public readonly paginationInfo = computed<PaginationInfo>(() => {
    const total = this.pokemonService.totalPages();
    const current = this.pokemonService.currentPage();
    const items: PageItem[] = [];

    if (total <= 0) {
      return {
        items: [],
        showFirst: false,
        showLast: false,
        showPrevious: false,
        showNext: false,
        currentPage: current,
        totalPages: total,
      };
    }

    if (total <= 7) {
      for (let i = 1; i <= total; i++) {
        items.push(i);
      }
    } else {
      items.push(1);

      const adjacentPages = 2;
      const start = Math.max(2, current - adjacentPages);
      const end = Math.min(total - 1, current + adjacentPages);

      if (start > 2) {
        items.push('ellipsis');
      }

      const seen = new Set<number>([1]);
      for (let i = start; i <= end; i++) {
        if (!seen.has(i) && i !== total) {
          items.push(i);
          seen.add(i);
        }
      }

      if (end < total - 1) {
        items.push('ellipsis');
      }

      if (!seen.has(total)) {
        items.push(total);
      }
    }

    return {
      items,
      showFirst: current > 1,
      showLast: current < total,
      showPrevious: current > 1,
      showNext: current < total,
      currentPage: current,
      totalPages: total,
    };
  });

  isEllipsis(item: PageItem): boolean {
    return item === 'ellipsis';
  }

  isCurrentPageItem(item: PageItem, currentPage: number): boolean {
    if (this.isEllipsis(item)) {
      return false;
    }
    return item === currentPage;
  }

  getPageNumber(item: PageItem): number | null {
    if (this.isEllipsis(item)) {
      return null;
    }
    return item as number;
  }

  goToPage(page: number): void {
    this.pokemonService.goToPage(page);
  }

  onPageClick(item: PageItem): void {
    if (!this.isEllipsis(item)) {
      this.goToPage(item as number);
    }
  }

  goToFirstPage(): void {
    this.pokemonService.goToPage(1);
  }

  goToLastPage(): void {
    this.pokemonService.goToPage(this.pokemonService.totalPages());
  }

  previousPage(): void {
    this.pokemonService.previousPage();
  }

  nextPage(): void {
    this.pokemonService.nextPage();
  }

  trackByPageItem(index: number, item: PageItem): string | number {
    return item;
  }

  onCardClick(pokemon: PokemonListItem): void {
    this.router.navigate(['/pokemon', pokemon.id]);
  }

  onFavoriteToggle(pokemon: PokemonListItem): void {
    this.favoritesService.toggle(pokemon.id);
  }

  isFavorite(id: number): boolean {
    return this.favoritesService.isFavorite(id);
  }

  trackByPokemon(index: number, pokemon: PokemonListItem): number {
    return pokemon.id;
  }
}
