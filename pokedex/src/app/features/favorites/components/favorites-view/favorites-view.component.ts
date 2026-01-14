import { Component, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FavoritesService } from 'src/app/core/services/favorites.service';
import { PokemonService } from 'src/app/core/services/pokemon.service';
import { PokemonCardComponent } from 'src/app/features/pokedex/components/pokemon-card/pokemon-card.component';
import { PokemonListItem } from 'src/app/shared/models/pokemon';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-favorites-view',
  templateUrl: './favorites-view.component.html',
  styleUrls: ['./favorites-view.component.sass'],
  standalone: true,
  imports: [CommonModule, RouterLink, PokemonCardComponent],
})
export class FavoritesViewComponent implements OnInit {
  public favoritePokemons = signal<PokemonListItem[]>([]);
  public loading = signal(false);

  public hasFavorites = computed(() => this.favoritesService.favorites().length > 0);

  constructor(
    public favoritesService: FavoritesService,
    private pokemonService: PokemonService
  ) {}

  ngOnInit(): void {
    this.loadFavorites();
    
    // Recarregar quando favoritos mudarem
    // Note: Em uma app real, usaríamos um effect ou subscription mais sofisticada
  }

  public loadFavorites(): void {
    const favoriteIds = this.favoritesService.favorites();
    
    if (favoriteIds.length === 0) {
      this.favoritePokemons.set([]);
      return;
    }

    this.loading.set(true);
    
    const requests = favoriteIds.map(id => this.pokemonService.getPokemonById(id));
    
    forkJoin(requests).subscribe({
      next: (pokemons) => {
        const listItems: PokemonListItem[] = pokemons.map(p => ({
          id: p.id,
          name: p.name,
          image: p.image,
          types: p.types,
        }));
        this.favoritePokemons.set(listItems);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      },
    });
  }

  public onCardClick(pokemon: PokemonListItem): void {
    // Navegação será feita pelo routerLink
  }

  public onFavoriteToggle(pokemon: PokemonListItem): void {
    this.favoritesService.toggle(pokemon.id);
    // Recarregar lista após toggle
    setTimeout(() => this.loadFavorites(), 100);
  }

  public isFavorite(id: number): boolean {
    return this.favoritesService.isFavorite(id);
  }

  public clearAll(): void {
    this.favoritesService.clear();
    this.favoritePokemons.set([]);
  }
}
