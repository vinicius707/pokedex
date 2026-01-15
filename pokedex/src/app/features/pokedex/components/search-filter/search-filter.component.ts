import { Component, OnInit, OnDestroy, computed, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, debounceTime, distinctUntilChanged, takeUntil } from 'rxjs';
import { PokemonService } from 'src/app/core/services/pokemon.service';
import { ALL_TYPES, TYPE_COLORS, Type } from 'src/app/shared/models/type';

@Component({
  selector: 'app-search-filter',
  templateUrl: './search-filter.component.html',
  styleUrls: ['./search-filter.component.sass'],
  standalone: true,
  imports: [CommonModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SearchFilterComponent implements OnInit, OnDestroy {
  public searchValue = '';
  public allTypes = ALL_TYPES;
  
  private searchSubject = new Subject<string>();
  private destroy$ = new Subject<void>();

  // Computed para mostrar informações do filtro
  public readonly filterInfo = computed(() => {
    const isTypeFilterActive = this.pokemonService.typeFilterMode();
    const selectedType = this.pokemonService.selectedType();
    const totalResults = isTypeFilterActive
      ? this.pokemonService.typeFilterTotal()
      : this.pokemonService.totalPokemons();
    const isLoading = this.pokemonService.loading();

    return {
      isTypeFilterActive,
      selectedType,
      totalResults,
      isLoading,
    };
  });

  constructor(public pokemonService: PokemonService) {}

  ngOnInit(): void {
    this.searchSubject
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        takeUntil(this.destroy$)
      )
      .subscribe((term) => {
        this.pokemonService.setSearchTerm(term);
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onSearchChange(): void {
    this.searchSubject.next(this.searchValue);
  }

  onTypeSelect(type: Type | null): void {
    this.pokemonService.setSelectedType(type);
  }

  isTypeSelected(type: Type): boolean {
    return this.pokemonService.selectedType() === type;
  }

  isTypeLoading(type: Type): boolean {
    return (
      this.pokemonService.loading() &&
      this.pokemonService.selectedType() === type
    );
  }

  getTypeColor(type: Type): string {
    return TYPE_COLORS[type];
  }

  clearFilters(): void {
    this.searchValue = '';
    this.pokemonService.clearFilters();
  }

  hasActiveFilters(): boolean {
    return this.pokemonService.searchTerm() !== '' || 
           this.pokemonService.selectedType() !== null;
  }
}
