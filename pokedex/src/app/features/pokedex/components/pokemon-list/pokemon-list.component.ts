import { CommonModule } from '@angular/common';
import { Component, computed } from '@angular/core';
import { PokemonCardComponent } from '../pokemon-card/pokemon-card.component';
import { PokemonService } from '../../../../core/services/pokemon.service';

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
  imports: [CommonModule, PokemonCardComponent]
})
export class PokemonListComponent {
  
  constructor(public pokemonService: PokemonService) {}

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
        totalPages: total
      };
    }

    // Para poucas páginas (7 ou menos), mostrar todas
    if (total <= 7) {
      for (let i = 1; i <= total; i++) {
        items.push(i);
      }
    } else {
      // Sempre mostrar primeira página
      items.push(1);

      // Calcular páginas adjacentes (2 antes e 2 depois)
      const adjacentPages = 2;
      const start = Math.max(2, current - adjacentPages);
      const end = Math.min(total - 1, current + adjacentPages);

      // Adicionar ellipsis antes se necessário
      if (start > 2) {
        items.push('ellipsis');
      }

      // Adicionar páginas adjacentes (evitando duplicatas)
      const seen = new Set<number>([1]);
      for (let i = start; i <= end; i++) {
        if (!seen.has(i) && i !== total) {
          items.push(i);
          seen.add(i);
        }
      }

      // Adicionar ellipsis depois se necessário
      if (end < total - 1) {
        items.push('ellipsis');
      }

      // Sempre mostrar última página
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
      totalPages: total
    };
  });

  getPageInfo(): string {
    const current = this.pokemonService.currentPage();
    const total = this.pokemonService.totalPages();
    return `Página ${current} de ${total}`;
  }

  isEllipsis(item: PageItem): boolean {
    return item === 'ellipsis';
  }

  isCurrentPage(item: PageItem): boolean {
    if (this.isEllipsis(item)) {
      return false;
    }
    return item === this.pokemonService.currentPage();
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
}
