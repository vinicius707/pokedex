import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PokemonCardComponent } from './pokemon-card.component';
import { PokemonListItem, getPokemonNumber } from 'src/app/shared/models/pokemon';
import { Type, TYPE_COLORS } from 'src/app/shared/models/type';

describe('PokemonCardComponent', () => {
  let component: PokemonCardComponent;
  let fixture: ComponentFixture<PokemonCardComponent>;

  const mockPokemon: PokemonListItem = {
    id: 1,
    name: 'bulbasaur',
    image: 'https://example.com/bulbasaur.png',
    types: ['grass', 'poison'] as Type[],
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PokemonCardComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(PokemonCardComponent);
    component = fixture.componentInstance;
    component.pokemon = mockPokemon;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('component properties', () => {
    it('should have pokemon input', () => {
      expect(component.pokemon).toEqual(mockPokemon);
    });

    it('should have isFavorite input default to false', () => {
      const newComponent = TestBed.createComponent(PokemonCardComponent).componentInstance;
      expect(newComponent.isFavorite).toBe(false);
    });

    it('should have cardClick output', () => {
      expect(component.cardClick).toBeDefined();
    });

    it('should have favoriteToggle output', () => {
      expect(component.favoriteToggle).toBeDefined();
    });
  });

  describe('getTypeColor', () => {
    it('should return correct color for grass type', () => {
      const color = component.getTypeColor('grass' as Type);
      expect(color).toBe(TYPE_COLORS['grass']);
    });

    it('should return correct color for fire type', () => {
      const color = component.getTypeColor('fire' as Type);
      expect(color).toBe(TYPE_COLORS['fire']);
    });

    it('should return correct color for water type', () => {
      const color = component.getTypeColor('water' as Type);
      expect(color).toBe(TYPE_COLORS['water']);
    });

    it('should return default color for unknown type', () => {
      const color = component.getTypeColor('unknown' as Type);
      expect(color).toBe('#A8A878');
    });

    it('should return correct color for all types', () => {
      const types: Type[] = ['normal', 'fire', 'water', 'electric', 'grass'];
      types.forEach((type) => {
        expect(component.getTypeColor(type)).toBe(TYPE_COLORS[type]);
      });
    });
  });

  describe('getPokemonNumber', () => {
    it('should return function reference', () => {
      expect(component.getPokemonNumber).toBe(getPokemonNumber);
    });

    it('should format single digit number with leading zeros', () => {
      const result = component.getPokemonNumber({ ...mockPokemon, id: 1 });
      expect(result).toBe('001');
    });

    it('should format double digit number with leading zero', () => {
      const result = component.getPokemonNumber({ ...mockPokemon, id: 25 });
      expect(result).toBe('025');
    });

    it('should format triple digit number without leading zeros', () => {
      const result = component.getPokemonNumber({ ...mockPokemon, id: 150 });
      expect(result).toBe('150');
    });

    it('should format four digit number', () => {
      const result = component.getPokemonNumber({ ...mockPokemon, id: 1025 });
      expect(result).toBe('1025');
    });
  });

  describe('onCardClick', () => {
    it('should emit cardClick event with pokemon', () => {
      const spy = jest.spyOn(component.cardClick, 'emit');

      component.onCardClick();

      expect(spy).toHaveBeenCalledWith(mockPokemon);
    });
  });

  describe('onFavoriteClick', () => {
    it('should emit favoriteToggle event with pokemon', () => {
      const spy = jest.spyOn(component.favoriteToggle, 'emit');
      const event = new Event('click');

      component.onFavoriteClick(event);

      expect(spy).toHaveBeenCalledWith(mockPokemon);
    });

    it('should stop event propagation', () => {
      const event = new Event('click');
      const stopPropagationSpy = jest.spyOn(event, 'stopPropagation');

      component.onFavoriteClick(event);

      expect(stopPropagationSpy).toHaveBeenCalled();
    });

    it('should not trigger cardClick when favorite is clicked', () => {
      const cardClickSpy = jest.spyOn(component.cardClick, 'emit');
      const favoriteToggleSpy = jest.spyOn(component.favoriteToggle, 'emit');
      const event = new Event('click');

      component.onFavoriteClick(event);

      expect(favoriteToggleSpy).toHaveBeenCalled();
      expect(cardClickSpy).not.toHaveBeenCalled();
    });
  });

  describe('isFavorite input', () => {
    it('should accept true value', () => {
      component.isFavorite = true;
      fixture.detectChanges();
      expect(component.isFavorite).toBe(true);
    });

    it('should accept false value', () => {
      component.isFavorite = false;
      fixture.detectChanges();
      expect(component.isFavorite).toBe(false);
    });
  });
});
