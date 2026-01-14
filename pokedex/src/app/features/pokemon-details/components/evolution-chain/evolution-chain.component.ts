import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { EvolutionChainLink } from 'src/app/shared/models/evolution';
import { capitalizeFirstLetter } from 'src/app/shared/models/pokemon';

@Component({
  selector: 'app-evolution-chain',
  templateUrl: './evolution-chain.component.html',
  styleUrls: ['./evolution-chain.component.sass'],
  standalone: true,
  imports: [CommonModule, RouterLink],
})
export class EvolutionChainComponent {
  @Input() chain: EvolutionChainLink[] = [];
  @Input() currentPokemonId: number = 0;

  capitalize = capitalizeFirstLetter;

  getEvolutionTrigger(link: EvolutionChainLink): string {
    if (link.minLevel) {
      return `Lvl ${link.minLevel}`;
    }
    if (link.item) {
      return this.capitalize(link.item.replace(/-/g, ' '));
    }
    if (link.trigger) {
      return this.capitalize(link.trigger.replace(/-/g, ' '));
    }
    return '';
  }
}
