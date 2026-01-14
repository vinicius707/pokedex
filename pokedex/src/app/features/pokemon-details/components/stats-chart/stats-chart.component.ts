import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PokemonStat } from 'src/app/shared/models/pokemon';

@Component({
  selector: 'app-stats-chart',
  templateUrl: './stats-chart.component.html',
  styleUrls: ['./stats-chart.component.sass'],
  standalone: true,
  imports: [CommonModule],
})
export class StatsChartComponent {
  @Input() stats: PokemonStat[] = [];

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

  getTotalStats(): number {
    return this.stats.reduce((sum, stat) => sum + stat.value, 0);
  }
}
