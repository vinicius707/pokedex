import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { FavoritesViewComponent } from './favorites-view.component';
import { FavoritesService } from 'src/app/core/services/favorites.service';
import { PokemonService } from 'src/app/core/services/pokemon.service';
import { Pokemon, PokemonListItem } from 'src/app/shared/models/pokemon';
import { of, throwError } from 'rxjs';
import { signal, computed } from '@angular/core';
import { Type } from 'src/app/shared/models/type';

describe('FavoritesViewComponent', () => {
  let component: FavoritesViewComponent;
  let fixture: ComponentFixture<FavoritesViewComponent>;
  let mockFavoritesService: Partial<FavoritesService>;
  let mockPokemonService: Partial<PokemonService>;

  const mockPokemon: Pokemon = {
    id: 1,
    name: 'bulbasaur',
    image: 'https://example.com/bulbasaur.png',
    sprites: {
      front_default: 'https://example.com/front.png',
      front_shiny: null,
      back_default: null,
      back_shiny: null,
    },
    types: ['grass', 'poison'] as Type[],
    stats: [],
    abilities: [],
    height: 7,
    weight: 69,
    speciesUrl: 'https://pokeapi.co/api/v2/pokemon-species/1/',
  };

  const mockPokemon2: Pokemon = {
    ...mockPokemon,
    id: 4,
    name: 'charmander',
    types: ['fire'] as Type[],
  };

  beforeEach(async () => {
    const favoritesSignal = signal<number[]>([1, 4]);

    mockFavoritesService = {
      favorites: favoritesSignal,
      favoritesCount: computed(() => favoritesSignal().length),
      toggle: jest.fn(),
      isFavorite: jest.fn().mockImplementation((id: number) =>
        favoritesSignal().includes(id)
      ),
      clear: jest.fn().mockImplementation(() => {
        favoritesSignal.set([]);
      }),
    };

    mockPokemonService = {
      getPokemonById: jest.fn().mockImplementation((id: number) => {
        if (id === 1) return of(mockPokemon);
        if (id === 4) return of(mockPokemon2);
        return throwError(() => new Error('Not found'));
      }),
    };

    await TestBed.configureTestingModule({
      imports: [FavoritesViewComponent],
      providers: [
        provideRouter([]),
        { provide: FavoritesService, useValue: mockFavoritesService },
        { provide: PokemonService, useValue: mockPokemonService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(FavoritesViewComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('initialization', () => {
    it('should have empty favoritePokemons initially', () => {
      expect(component.favoritePokemons()).toEqual([]);
    });

    it('should not be loading initially', () => {
      expect(component.loading()).toBe(false);
    });

    it('should load favorites on init', fakeAsync(() => {
      fixture.detectChanges();
      tick();

      expect(mockPokemonService.getPokemonById).toHaveBeenCalledWith(1);
      expect(mockPokemonService.getPokemonById).toHaveBeenCalledWith(4);
    }));

    it('should set favoritePokemons after loading', fakeAsync(() => {
      fixture.detectChanges();
      tick();

      expect(component.favoritePokemons().length).toBe(2);
    }));
  });

  describe('hasFavorites', () => {
    it('should return true when favorites exist', () => {
      expect(component.hasFavorites()).toBe(true);
    });

    it('should return false when no favorites', () => {
      (mockFavoritesService.favorites as ReturnType<typeof signal>).set([]);
      fixture.detectChanges();

      expect(component.hasFavorites()).toBe(false);
    });
  });

  describe('loadFavorites', () => {
    it('should load all favorite pokemon', fakeAsync(() => {
      component.loadFavorites();
      tick();

      expect(mockPokemonService.getPokemonById).toHaveBeenCalled();
      expect(component.loading()).toBe(false);
    }));

    it('should set empty array when no favorites', fakeAsync(() => {
      (mockFavoritesService.favorites as ReturnType<typeof signal>).set([]);

      component.loadFavorites();
      tick();

      expect(component.favoritePokemons()).toEqual([]);
    }));

    it('should handle load error', fakeAsync(() => {
      (mockPokemonService.getPokemonById as jest.Mock).mockReturnValue(
        throwError(() => new Error('API Error'))
      );

      component.loadFavorites();
      tick();

      expect(component.loading()).toBe(false);
    }));

    it('should convert Pokemon to PokemonListItem', fakeAsync(() => {
      fixture.detectChanges();
      tick();

      const pokemons = component.favoritePokemons();
      expect(pokemons[0]).toEqual({
        id: mockPokemon.id,
        name: mockPokemon.name,
        image: mockPokemon.image,
        types: mockPokemon.types,
      });
    }));
  });

  describe('onFavoriteToggle', () => {
    it('should toggle favorite', fakeAsync(() => {
      jest.useFakeTimers();
      fixture.detectChanges();
      tick();

      const pokemon: PokemonListItem = {
        id: 1,
        name: 'bulbasaur',
        image: '',
        types: [] as Type[],
      };
      component.onFavoriteToggle(pokemon);

      expect(mockFavoritesService.toggle).toHaveBeenCalledWith(1);

      jest.advanceTimersByTime(100);
      tick();

      jest.useRealTimers();
    }));
  });

  describe('isFavorite', () => {
    it('should return true for favorite pokemon', () => {
      expect(component.isFavorite(1)).toBe(true);
    });

    it('should return false for non-favorite pokemon', () => {
      expect(component.isFavorite(999)).toBe(false);
    });

    it('should delegate to favoritesService', () => {
      component.isFavorite(1);
      expect(mockFavoritesService.isFavorite).toHaveBeenCalledWith(1);
    });
  });

  describe('clearAll', () => {
    it('should clear all favorites', () => {
      component.clearAll();

      expect(mockFavoritesService.clear).toHaveBeenCalled();
    });

    it('should set favoritePokemons to empty array', () => {
      component.favoritePokemons.set([
        { id: 1, name: 'test', image: '', types: [] as Type[] },
      ]);

      component.clearAll();

      expect(component.favoritePokemons()).toEqual([]);
    });
  });

  describe('onCardClick', () => {
    it('should be defined', () => {
      expect(component.onCardClick).toBeDefined();
    });

    it('should not throw when called', () => {
      const pokemon: PokemonListItem = {
        id: 1,
        name: 'bulbasaur',
        image: '',
        types: [] as Type[],
      };
      expect(() => component.onCardClick(pokemon)).not.toThrow();
    });
  });
});
