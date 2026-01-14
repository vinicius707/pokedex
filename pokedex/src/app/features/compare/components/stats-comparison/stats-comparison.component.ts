import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PokemonStat } from 'src/app/shared/models/pokemon';

@Component({
  selector: 'app-stats-comparison',
  templateUrl: './stats-comparison.component.html',
  styleUrls: ['./stats-comparison.component.sass'],
  standalone: true,
  imports: [CommonModule],
})
export class StatsComparisonComponent {
  @Input() stats1: PokemonStat[] = [];
  @Input() stats2: PokemonStat[] = [];
  @Input() name1: string = '';
  @Input() name2: string = '';

  private readonly maxStatValue = 255;

  getStatPercentage(value: number): number {
    return (value / this.maxStatValue) * 100;
  }

  getStatColor(statName: string): string {
    const colors: Record<string, string> = {
      HP: '#FF5959',
      Attack: '#F5AC78',
      Defense: '#FAE078',
      'Sp. Atk': '#9DB7F5',
      'Sp. Def': '#A7DB8D',
      Speed: '#FA92B2',
    };
    return colors[statName] || '#A8A8A8';
  }

  getStat1Value(statName: string): number {
    return this.stats1.find(s => s.name === statName)?.value || 0;
  }

  getStat2Value(statName: string): number {
    return this.stats2.find(s => s.name === statName)?.value || 0;
  }

  getWinner(statName: string): 'left' | 'right' | 'tie' {
    const val1 = this.getStat1Value(statName);
    const val2 = this.getStat2Value(statName);
    if (val1 > val2) return 'left';
    if (val2 > val1) return 'right';
    return 'tie';
  }

  getTotalStats1(): number {
    return this.stats1.reduce((sum, stat) => sum + stat.value, 0);
  }

  getTotalStats2(): number {
    return this.stats2.reduce((sum, stat) => sum + stat.value, 0);
  }

  getTotalWinner(): 'left' | 'right' | 'tie' {
    const total1 = this.getTotalStats1();
    const total2 = this.getTotalStats2();
    if (total1 > total2) return 'left';
    if (total2 > total1) return 'right';
    return 'tie';
  }
}
