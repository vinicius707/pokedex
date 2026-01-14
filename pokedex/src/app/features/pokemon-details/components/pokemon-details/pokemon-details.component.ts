import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { PokemonService } from 'src/app/core/services/pokemon.service';
import { FavoritesService } from 'src/app/core/services/favorites.service';
import { EvolutionService } from 'src/app/core/services/evolution.service';
import {
  Pokemon,
  capitalizeFirstLetter,
  formatHeight,
  formatWeight,
  getPokemonNumber,
} from 'src/app/shared/models/pokemon';
import { TYPE_COLORS, Type } from 'src/app/shared/models/type';
import { EvolutionChain, SpeciesInfo } from 'src/app/shared/models/evolution';
import { StatsChartComponent } from '../stats-chart/stats-chart.component';
import { EvolutionChainComponent } from '../evolution-chain/evolution-chain.component';

@Component({
  selector: 'app-pokemon-details',
  templateUrl: './pokemon-details.component.html',
  styleUrls: ['./pokemon-details.component.sass'],
  standalone: true,
  imports: [CommonModule, RouterLink, StatsChartComponent, EvolutionChainComponent],
})
export class PokemonDetailsComponent implements OnInit {
  public pokemon = signal<Pokemon | null>(null);
  public speciesInfo = signal<SpeciesInfo | null>(null);
  public evolutionChain = signal<EvolutionChain | null>(null);
  public loading = signal(true);
  public error = signal<string | null>(null);

  public isFavorite = computed(() => {
    const p = this.pokemon();
    return p ? this.favoritesService.isFavorite(p.id) : false;
  });

  public capitalize = capitalizeFirstLetter;
  public formatHeight = formatHeight;
  public formatWeight = formatWeight;
  public getPokemonNumber = getPokemonNumber;

  constructor(
    private route: ActivatedRoute,
    private pokemonService: PokemonService,
    public favoritesService: FavoritesService,
    private evolutionService: EvolutionService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      const id = parseInt(params['id'], 10);
      if (id) {
        this.loadPokemon(id);
      }
    });
  }

  private loadPokemon(id: number): void {
    this.loading.set(true);
    this.error.set(null);

    this.pokemonService.getPokemonById(id).subscribe({
      next: (pokemon) => {
        this.pokemon.set(pokemon);
        this.loadSpeciesInfo(id);
      },
      error: () => {
        this.error.set('Pokémon não encontrado');
        this.loading.set(false);
      },
    });
  }

  private loadSpeciesInfo(id: number): void {
    this.evolutionService.getSpeciesInfo(id).subscribe({
      next: (info) => {
        this.speciesInfo.set(info);
        this.loadEvolutionChain(id);
      },
      error: () => {
        this.loading.set(false);
      },
    });
  }

  private loadEvolutionChain(id: number): void {
    this.evolutionService.getEvolutionChain(id).subscribe({
      next: (chain) => {
        this.evolutionChain.set(chain);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      },
    });
  }

  public getTypeColor(type: Type): string {
    return TYPE_COLORS[type] || '#A8A878';
  }

  public toggleFavorite(): void {
    const p = this.pokemon();
    if (p) {
      this.favoritesService.toggle(p.id);
    }
  }

  public getGenerationLabel(gen: number): string {
    const romans = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX'];
    return `Generation ${romans[gen - 1] || gen}`;
  }
}
