import { ComponentFixture, TestBed } from '@angular/core/testing';
import { StatsChartComponent } from './stats-chart.component';
import { PokemonStat } from 'src/app/shared/models/pokemon';

describe('StatsChartComponent', () => {
  let component: StatsChartComponent;
  let fixture: ComponentFixture<StatsChartComponent>;

  const mockStats: PokemonStat[] = [
    { name: 'HP', value: 45 },
    { name: 'Attack', value: 49 },
    { name: 'Defense', value: 49 },
    { name: 'Sp. Atk', value: 65 },
    { name: 'Sp. Def', value: 65 },
    { name: 'Speed', value: 45 },
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StatsChartComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(StatsChartComponent);
    component = fixture.componentInstance;
    component.stats = mockStats;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('rendering', () => {
    it('should display all stats', () => {
      const statItems = fixture.nativeElement.querySelectorAll(
        '.stats-chart__item'
      );
      expect(statItems.length).toBe(6);
    });

    it('should display stat names', () => {
      const labels = fixture.nativeElement.querySelectorAll(
        '.stats-chart__label'
      );
      expect(labels[0].textContent).toContain('HP');
      expect(labels[1].textContent).toContain('Attack');
    });

    it('should display stat values', () => {
      const values = fixture.nativeElement.querySelectorAll(
        '.stats-chart__value'
      );
      expect(values[0].textContent).toContain('45');
      expect(values[1].textContent).toContain('49');
    });

    it('should display total stats', () => {
      const total = fixture.nativeElement.querySelector(
        '.stats-chart__total-value'
      );
      expect(total.textContent).toContain('318');
    });
  });

  describe('getStatPercentage', () => {
    it('should calculate percentage based on max stat value (255)', () => {
      expect(component.getStatPercentage(255)).toBe(100);
      expect(component.getStatPercentage(127.5)).toBeCloseTo(50, 1);
      expect(component.getStatPercentage(0)).toBe(0);
    });

    it('should calculate percentage for typical stat values', () => {
      // HP: 45 / 255 * 100 = ~17.6%
      expect(component.getStatPercentage(45)).toBeCloseTo(17.65, 1);
    });
  });

  describe('getStatColor', () => {
    it('should return correct color for HP', () => {
      expect(component.getStatColor('HP')).toBe('#FF5959');
    });

    it('should return correct color for Attack', () => {
      expect(component.getStatColor('Attack')).toBe('#F5AC78');
    });

    it('should return correct color for Defense', () => {
      expect(component.getStatColor('Defense')).toBe('#FAE078');
    });

    it('should return correct color for Sp. Atk', () => {
      expect(component.getStatColor('Sp. Atk')).toBe('#9DB7F5');
    });

    it('should return correct color for Sp. Def', () => {
      expect(component.getStatColor('Sp. Def')).toBe('#A7DB8D');
    });

    it('should return correct color for Speed', () => {
      expect(component.getStatColor('Speed')).toBe('#FA92B2');
    });

    it('should return default color for unknown stat', () => {
      expect(component.getStatColor('Unknown')).toBe('#A8A8A8');
    });
  });

  describe('getTotalStats', () => {
    it('should calculate total of all stats', () => {
      // 45 + 49 + 49 + 65 + 65 + 45 = 318
      expect(component.getTotalStats()).toBe(318);
    });

    it('should return 0 for empty stats', () => {
      component.stats = [];
      expect(component.getTotalStats()).toBe(0);
    });

    it('should handle single stat', () => {
      component.stats = [{ name: 'HP', value: 100 }];
      expect(component.getTotalStats()).toBe(100);
    });
  });

  describe('stat bars', () => {
    it('should set bar width based on percentage', () => {
      fixture.detectChanges();

      const bars = fixture.nativeElement.querySelectorAll(
        '.stats-chart__bar'
      );
      // First bar (HP: 45) should have width of ~17.65%
      const style = bars[0].getAttribute('style');
      expect(style).toContain('width');
    });

    it('should set bar color based on stat name', () => {
      fixture.detectChanges();

      const bars = fixture.nativeElement.querySelectorAll(
        '.stats-chart__bar'
      );
      // First bar (HP) should have red color
      const style = bars[0].getAttribute('style');
      expect(style).toContain('#FF5959');
    });
  });
});
