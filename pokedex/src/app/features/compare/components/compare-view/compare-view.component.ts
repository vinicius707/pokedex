import { Component, signal, DestroyRef, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { PokemonService } from 'src/app/core/services/pokemon.service';
import { Pokemon, capitalizeFirstLetter } from 'src/app/shared/models/pokemon';
import { TYPE_COLORS, Type } from 'src/app/shared/models/type';
import { StatsComparisonComponent } from '../stats-comparison/stats-comparison.component';

@Component({
  selector: 'app-compare-view',
  templateUrl: './compare-view.component.html',
  styleUrls: ['./compare-view.component.sass'],
  standalone: true,
  imports: [CommonModule, FormsModule, StatsComparisonComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CompareViewComponent {
  private readonly destroyRef = inject(DestroyRef);

  public pokemon1 = signal<Pokemon | null>(null);
  public pokemon2 = signal<Pokemon | null>(null);
  public search1 = '';
  public search2 = '';
  public loading1 = signal(false);
  public loading2 = signal(false);
  public error1 = signal<string | null>(null);
  public error2 = signal<string | null>(null);

  public capitalize = capitalizeFirstLetter;

  constructor(private pokemonService: PokemonService) {}

  public searchPokemon1(): void {
    if (!this.search1.trim()) return;
    
    this.loading1.set(true);
    this.error1.set(null);
    
    this.pokemonService
      .searchPokemonByName(this.search1.trim())
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (pokemon) => {
          if (pokemon) {
            this.pokemon1.set(pokemon);
          } else {
            this.error1.set('Pokémon não encontrado');
          }
          this.loading1.set(false);
        },
        error: () => {
          this.error1.set('Erro ao buscar Pokémon');
          this.loading1.set(false);
        },
      });
  }

  public searchPokemon2(): void {
    if (!this.search2.trim()) return;
    
    this.loading2.set(true);
    this.error2.set(null);
    
    this.pokemonService
      .searchPokemonByName(this.search2.trim())
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (pokemon) => {
          if (pokemon) {
            this.pokemon2.set(pokemon);
          } else {
            this.error2.set('Pokémon não encontrado');
          }
          this.loading2.set(false);
        },
        error: () => {
          this.error2.set('Erro ao buscar Pokémon');
          this.loading2.set(false);
        },
      });
  }

  public clearPokemon1(): void {
    this.pokemon1.set(null);
    this.search1 = '';
    this.error1.set(null);
  }

  public clearPokemon2(): void {
    this.pokemon2.set(null);
    this.search2 = '';
    this.error2.set(null);
  }

  public getTypeColor(type: Type): string {
    return TYPE_COLORS[type] || '#A8A878';
  }

  public canCompare(): boolean {
    return this.pokemon1() !== null && this.pokemon2() !== null;
  }
}
