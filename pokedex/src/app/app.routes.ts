import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import(
        './features/pokedex/components/pokemon-list/pokemon-list.component'
      ).then((m) => m.PokemonListComponent),
  },
  {
    path: 'pokemon/:id',
    loadComponent: () =>
      import(
        './features/pokemon-details/components/pokemon-details/pokemon-details.component'
      ).then((m) => m.PokemonDetailsComponent),
  },
  {
    path: 'favorites',
    loadComponent: () =>
      import(
        './features/favorites/components/favorites-view/favorites-view.component'
      ).then((m) => m.FavoritesViewComponent),
  },
  {
    path: 'compare',
    loadComponent: () =>
      import(
        './features/compare/components/compare-view/compare-view.component'
      ).then((m) => m.CompareViewComponent),
  },
  {
    path: '**',
    redirectTo: '',
  },
];
