import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { CompareViewComponent } from './compare-view.component';
import { PokemonService } from 'src/app/core/services/pokemon.service';
import { Pokemon, capitalizeFirstLetter } from 'src/app/shared/models/pokemon';
import { of, throwError } from 'rxjs';
import { Type, TYPE_COLORS } from 'src/app/shared/models/type';

describe('CompareViewComponent', () => {
  let component: CompareViewComponent;
  let fixture: ComponentFixture<CompareViewComponent>;
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
    stats: [
      { name: 'HP', value: 45 },
      { name: 'Attack', value: 49 },
      { name: 'Defense', value: 49 },
      { name: 'Sp. Atk', value: 65 },
      { name: 'Sp. Def', value: 65 },
      { name: 'Speed', value: 45 },
    ],
    abilities: [{ name: 'overgrow', isHidden: false }],
    height: 7,
    weight: 69,
    speciesUrl: 'https://pokeapi.co/api/v2/pokemon-species/1/',
  };

  const mockPokemon2: Pokemon = {
    ...mockPokemon,
    id: 4,
    name: 'charmander',
    types: ['fire'] as Type[],
    stats: [
      { name: 'HP', value: 39 },
      { name: 'Attack', value: 52 },
      { name: 'Defense', value: 43 },
      { name: 'Sp. Atk', value: 60 },
      { name: 'Sp. Def', value: 50 },
      { name: 'Speed', value: 65 },
    ],
  };

  beforeEach(async () => {
    mockPokemonService = {
      searchPokemonByName: jest.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [CompareViewComponent],
      providers: [{ provide: PokemonService, useValue: mockPokemonService }],
    }).compileComponents();

    fixture = TestBed.createComponent(CompareViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('initial state', () => {
    it('should have null pokemon1', () => {
      expect(component.pokemon1()).toBeNull();
    });

    it('should have null pokemon2', () => {
      expect(component.pokemon2()).toBeNull();
    });

    it('should have empty search1', () => {
      expect(component.search1).toBe('');
    });

    it('should have empty search2', () => {
      expect(component.search2).toBe('');
    });

    it('should not be loading initially', () => {
      expect(component.loading1()).toBe(false);
      expect(component.loading2()).toBe(false);
    });

    it('should have no errors initially', () => {
      expect(component.error1()).toBeNull();
      expect(component.error2()).toBeNull();
    });

    it('should not be able to compare', () => {
      expect(component.canCompare()).toBe(false);
    });
  });

  describe('searchPokemon1', () => {
    it('should search for pokemon', fakeAsync(() => {
      (mockPokemonService.searchPokemonByName as jest.Mock).mockReturnValue(
        of(mockPokemon)
      );

      component.search1 = 'bulbasaur';
      component.searchPokemon1();

      tick();

      expect(mockPokemonService.searchPokemonByName).toHaveBeenCalledWith(
        'bulbasaur'
      );
      expect(component.pokemon1()).toEqual(mockPokemon);
      expect(component.loading1()).toBe(false);
    }));

    it('should not search with empty term', () => {
      component.search1 = '  ';
      component.searchPokemon1();

      expect(mockPokemonService.searchPokemonByName).not.toHaveBeenCalled();
    });

    it('should trim search term', fakeAsync(() => {
      (mockPokemonService.searchPokemonByName as jest.Mock).mockReturnValue(
        of(mockPokemon)
      );

      component.search1 = '  bulbasaur  ';
      component.searchPokemon1();

      tick();

      expect(mockPokemonService.searchPokemonByName).toHaveBeenCalledWith(
        'bulbasaur'
      );
    }));

    it('should set loading true during search', () => {
      (mockPokemonService.searchPokemonByName as jest.Mock).mockReturnValue(
        of(mockPokemon)
      );

      component.search1 = 'bulbasaur';
      component.searchPokemon1();

      // Loading is set true before subscribe completes
      // After tick, it will be false
    });

    it('should set error when pokemon not found', fakeAsync(() => {
      (mockPokemonService.searchPokemonByName as jest.Mock).mockReturnValue(
        of(null)
      );

      component.search1 = 'notapokemon';
      component.searchPokemon1();

      tick();

      expect(component.error1()).toBe('Pokémon não encontrado');
      expect(component.loading1()).toBe(false);
    }));

    it('should handle API error', fakeAsync(() => {
      (mockPokemonService.searchPokemonByName as jest.Mock).mockReturnValue(
        throwError(() => new Error('API Error'))
      );

      component.search1 = 'bulbasaur';
      component.searchPokemon1();

      tick();

      expect(component.error1()).toBe('Erro ao buscar Pokémon');
      expect(component.loading1()).toBe(false);
    }));

    it('should clear error before search', fakeAsync(() => {
      component.error1.set('previous error');

      (mockPokemonService.searchPokemonByName as jest.Mock).mockReturnValue(
        of(mockPokemon)
      );

      component.search1 = 'bulbasaur';
      component.searchPokemon1();

      expect(component.error1()).toBeNull();

      tick();
    }));
  });

  describe('searchPokemon2', () => {
    it('should search for second pokemon', fakeAsync(() => {
      (mockPokemonService.searchPokemonByName as jest.Mock).mockReturnValue(
        of(mockPokemon2)
      );

      component.search2 = 'charmander';
      component.searchPokemon2();

      tick();

      expect(component.pokemon2()).toEqual(mockPokemon2);
    }));

    it('should not search with empty term', () => {
      component.search2 = '';
      component.searchPokemon2();

      expect(mockPokemonService.searchPokemonByName).not.toHaveBeenCalled();
    });

    it('should set error when pokemon not found', fakeAsync(() => {
      (mockPokemonService.searchPokemonByName as jest.Mock).mockReturnValue(
        of(null)
      );

      component.search2 = 'notapokemon';
      component.searchPokemon2();

      tick();

      expect(component.error2()).toBe('Pokémon não encontrado');
    }));

    it('should handle API error', fakeAsync(() => {
      (mockPokemonService.searchPokemonByName as jest.Mock).mockReturnValue(
        throwError(() => new Error('API Error'))
      );

      component.search2 = 'charmander';
      component.searchPokemon2();

      tick();

      expect(component.error2()).toBe('Erro ao buscar Pokémon');
      expect(component.loading2()).toBe(false);
    }));
  });

  describe('clearPokemon1', () => {
    it('should clear pokemon1', fakeAsync(() => {
      (mockPokemonService.searchPokemonByName as jest.Mock).mockReturnValue(
        of(mockPokemon)
      );

      component.search1 = 'bulbasaur';
      component.searchPokemon1();
      tick();

      component.clearPokemon1();

      expect(component.pokemon1()).toBeNull();
      expect(component.search1).toBe('');
      expect(component.error1()).toBeNull();
    }));
  });

  describe('clearPokemon2', () => {
    it('should clear pokemon2', fakeAsync(() => {
      (mockPokemonService.searchPokemonByName as jest.Mock).mockReturnValue(
        of(mockPokemon2)
      );

      component.search2 = 'charmander';
      component.searchPokemon2();
      tick();

      component.clearPokemon2();

      expect(component.pokemon2()).toBeNull();
      expect(component.search2).toBe('');
      expect(component.error2()).toBeNull();
    }));
  });

  describe('canCompare', () => {
    it('should return true when both pokemon are selected', fakeAsync(() => {
      (mockPokemonService.searchPokemonByName as jest.Mock)
        .mockReturnValueOnce(of(mockPokemon))
        .mockReturnValueOnce(of(mockPokemon2));

      component.search1 = 'bulbasaur';
      component.searchPokemon1();
      tick();

      component.search2 = 'charmander';
      component.searchPokemon2();
      tick();

      expect(component.canCompare()).toBe(true);
    }));

    it('should return false when only pokemon1 is selected', fakeAsync(() => {
      (mockPokemonService.searchPokemonByName as jest.Mock).mockReturnValue(
        of(mockPokemon)
      );

      component.search1 = 'bulbasaur';
      component.searchPokemon1();
      tick();

      expect(component.canCompare()).toBe(false);
    }));

    it('should return false when only pokemon2 is selected', fakeAsync(() => {
      (mockPokemonService.searchPokemonByName as jest.Mock).mockReturnValue(
        of(mockPokemon2)
      );

      component.search2 = 'charmander';
      component.searchPokemon2();
      tick();

      expect(component.canCompare()).toBe(false);
    }));
  });

  describe('getTypeColor', () => {
    it('should return correct color for fire type', () => {
      expect(component.getTypeColor('fire' as Type)).toBe(TYPE_COLORS['fire']);
    });

    it('should return correct color for grass type', () => {
      expect(component.getTypeColor('grass' as Type)).toBe(TYPE_COLORS['grass']);
    });

    it('should return default color for unknown type', () => {
      expect(component.getTypeColor('unknown' as Type)).toBe('#A8A878');
    });
  });

  describe('capitalize', () => {
    it('should be reference to capitalizeFirstLetter', () => {
      expect(component.capitalize).toBe(capitalizeFirstLetter);
    });

    it('should capitalize first letter', () => {
      expect(component.capitalize('bulbasaur')).toBe('Bulbasaur');
      expect(component.capitalize('pikachu')).toBe('Pikachu');
    });
  });
});
