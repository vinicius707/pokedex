import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { SearchFilterComponent } from './search-filter.component';
import { PokemonService } from 'src/app/core/services/pokemon.service';
import { Type, ALL_TYPES, TYPE_COLORS } from 'src/app/shared/models/type';
import { signal } from '@angular/core';

describe('SearchFilterComponent', () => {
  let component: SearchFilterComponent;
  let fixture: ComponentFixture<SearchFilterComponent>;
  let mockPokemonService: Partial<PokemonService>;

  beforeEach(async () => {
    mockPokemonService = {
      searchTerm: signal(''),
      selectedType: signal<Type | null>(null),
      typeFilterMode: signal(false),
      typeFilterTotal: signal(0),
      totalPokemons: signal(1350),
      loading: signal(false),
      setSearchTerm: jest.fn(),
      setSelectedType: jest.fn(),
      clearFilters: jest.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [SearchFilterComponent],
      providers: [{ provide: PokemonService, useValue: mockPokemonService }],
    }).compileComponents();

    fixture = TestBed.createComponent(SearchFilterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('initialization', () => {
    it('should have empty searchValue initially', () => {
      expect(component.searchValue).toBe('');
    });

    it('should have allTypes array', () => {
      expect(component.allTypes).toEqual(ALL_TYPES);
    });

    it('should set up search observable on init', () => {
      expect(component['searchSubject']).toBeDefined();
    });
  });

  describe('onSearchChange', () => {
    it('should emit search value to subject', fakeAsync(() => {
      component.searchValue = 'pika';
      component.onSearchChange();

      tick(300);

      expect(mockPokemonService.setSearchTerm).toHaveBeenCalledWith('pika');
    }));

    it('should debounce search term updates', fakeAsync(() => {
      component.searchValue = 'pi';
      component.onSearchChange();

      expect(mockPokemonService.setSearchTerm).not.toHaveBeenCalled();

      tick(299);
      expect(mockPokemonService.setSearchTerm).not.toHaveBeenCalled();

      tick(1);
      expect(mockPokemonService.setSearchTerm).toHaveBeenCalledWith('pi');
    }));

    it('should use distinctUntilChanged', fakeAsync(() => {
      component.searchValue = 'test';
      component.onSearchChange();
      tick(300);

      component.searchValue = 'test';
      component.onSearchChange();
      tick(300);

      expect(mockPokemonService.setSearchTerm).toHaveBeenCalledTimes(1);
    }));

    it('should handle multiple rapid changes', fakeAsync(() => {
      component.searchValue = 'a';
      component.onSearchChange();
      tick(100);

      component.searchValue = 'ab';
      component.onSearchChange();
      tick(100);

      component.searchValue = 'abc';
      component.onSearchChange();
      tick(300);

      expect(mockPokemonService.setSearchTerm).toHaveBeenCalledTimes(1);
      expect(mockPokemonService.setSearchTerm).toHaveBeenCalledWith('abc');
    }));
  });

  describe('onTypeSelect', () => {
    it('should call setSelectedType with type', () => {
      component.onTypeSelect('fire' as Type);

      expect(mockPokemonService.setSelectedType).toHaveBeenCalledWith('fire');
    });

    it('should call setSelectedType with null', () => {
      component.onTypeSelect(null);

      expect(mockPokemonService.setSelectedType).toHaveBeenCalledWith(null);
    });
  });

  describe('isTypeSelected', () => {
    it('should return true when type matches selectedType', () => {
      (mockPokemonService.selectedType as ReturnType<typeof signal>).set('fire');

      expect(component.isTypeSelected('fire' as Type)).toBe(true);
    });

    it('should return false when type does not match selectedType', () => {
      (mockPokemonService.selectedType as ReturnType<typeof signal>).set('fire');

      expect(component.isTypeSelected('water' as Type)).toBe(false);
    });

    it('should return false when no type is selected', () => {
      (mockPokemonService.selectedType as ReturnType<typeof signal>).set(null);

      expect(component.isTypeSelected('fire' as Type)).toBe(false);
    });
  });

  describe('getTypeColor', () => {
    it('should return correct color for fire type', () => {
      expect(component.getTypeColor('fire' as Type)).toBe(TYPE_COLORS['fire']);
    });

    it('should return correct color for water type', () => {
      expect(component.getTypeColor('water' as Type)).toBe(TYPE_COLORS['water']);
    });

    it('should return correct color for grass type', () => {
      expect(component.getTypeColor('grass' as Type)).toBe(TYPE_COLORS['grass']);
    });

    it('should return color for all types', () => {
      ALL_TYPES.forEach((type) => {
        expect(component.getTypeColor(type)).toBe(TYPE_COLORS[type]);
      });
    });
  });

  describe('clearFilters', () => {
    it('should reset searchValue', () => {
      component.searchValue = 'test';
      component.clearFilters();

      expect(component.searchValue).toBe('');
    });

    it('should call pokemonService clearFilters', () => {
      component.clearFilters();

      expect(mockPokemonService.clearFilters).toHaveBeenCalled();
    });
  });

  describe('hasActiveFilters', () => {
    it('should return true when searchTerm is set', () => {
      (mockPokemonService.searchTerm as ReturnType<typeof signal>).set('test');

      expect(component.hasActiveFilters()).toBe(true);
    });

    it('should return true when selectedType is set', () => {
      (mockPokemonService.selectedType as ReturnType<typeof signal>).set('fire');

      expect(component.hasActiveFilters()).toBe(true);
    });

    it('should return true when both filters are set', () => {
      (mockPokemonService.searchTerm as ReturnType<typeof signal>).set('test');
      (mockPokemonService.selectedType as ReturnType<typeof signal>).set('fire');

      expect(component.hasActiveFilters()).toBe(true);
    });

    it('should return false when no filters are active', () => {
      (mockPokemonService.searchTerm as ReturnType<typeof signal>).set('');
      (mockPokemonService.selectedType as ReturnType<typeof signal>).set(null);

      expect(component.hasActiveFilters()).toBe(false);
    });
  });

  describe('ngOnDestroy', () => {
    it('should complete destroy$ subject', () => {
      const nextSpy = jest.spyOn(component['destroy$'], 'next');
      const completeSpy = jest.spyOn(component['destroy$'], 'complete');

      component.ngOnDestroy();

      expect(nextSpy).toHaveBeenCalled();
      expect(completeSpy).toHaveBeenCalled();
    });

    it('should unsubscribe search observable', fakeAsync(() => {
      component.ngOnDestroy();

      component.searchValue = 'test';
      component.onSearchChange();
      tick(300);

      // After destroy, setSearchTerm should not be called
      expect(mockPokemonService.setSearchTerm).not.toHaveBeenCalled();
    }));
  });

  describe('filterInfo', () => {
    it('should return correct info when type filter is not active', () => {
      (mockPokemonService.typeFilterMode as ReturnType<typeof signal>).set(false);
      (mockPokemonService.totalPokemons as ReturnType<typeof signal>).set(1350);

      const info = component.filterInfo();

      expect(info.isTypeFilterActive).toBe(false);
      expect(info.totalResults).toBe(1350);
      expect(info.selectedType).toBeNull();
    });

    it('should return correct info when type filter is active', () => {
      (mockPokemonService.typeFilterMode as ReturnType<typeof signal>).set(true);
      (mockPokemonService.typeFilterTotal as ReturnType<typeof signal>).set(52);
      (mockPokemonService.selectedType as ReturnType<typeof signal>).set('fire');

      const info = component.filterInfo();

      expect(info.isTypeFilterActive).toBe(true);
      expect(info.totalResults).toBe(52);
      expect(info.selectedType).toBe('fire');
    });

    it('should include loading state', () => {
      (mockPokemonService.loading as ReturnType<typeof signal>).set(true);

      const info = component.filterInfo();

      expect(info.isLoading).toBe(true);
    });
  });

  describe('isTypeLoading', () => {
    it('should return true when loading and type matches selected', () => {
      (mockPokemonService.loading as ReturnType<typeof signal>).set(true);
      (mockPokemonService.selectedType as ReturnType<typeof signal>).set('fire');

      expect(component.isTypeLoading('fire' as Type)).toBe(true);
    });

    it('should return false when not loading', () => {
      (mockPokemonService.loading as ReturnType<typeof signal>).set(false);
      (mockPokemonService.selectedType as ReturnType<typeof signal>).set('fire');

      expect(component.isTypeLoading('fire' as Type)).toBe(false);
    });

    it('should return false when loading but different type', () => {
      (mockPokemonService.loading as ReturnType<typeof signal>).set(true);
      (mockPokemonService.selectedType as ReturnType<typeof signal>).set('fire');

      expect(component.isTypeLoading('water' as Type)).toBe(false);
    });

    it('should return false when loading but no type selected', () => {
      (mockPokemonService.loading as ReturnType<typeof signal>).set(true);
      (mockPokemonService.selectedType as ReturnType<typeof signal>).set(null);

      expect(component.isTypeLoading('fire' as Type)).toBe(false);
    });
  });
});
