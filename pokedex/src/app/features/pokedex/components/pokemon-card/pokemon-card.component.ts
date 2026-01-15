import { CommonModule } from '@angular/common';
import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import {
  getPokemonNumber,
  PokemonListItem,
} from 'src/app/shared/models/pokemon';
import { TYPE_COLORS, Type } from 'src/app/shared/models/type';

@Component({
  selector: 'app-pokemon-card',
  templateUrl: './pokemon-card.component.html',
  styleUrls: ['./pokemon-card.component.sass'],
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PokemonCardComponent {
  @Input()
  public pokemon!: PokemonListItem;

  @Input()
  public isFavorite: boolean = false;

  @Output()
  public cardClick = new EventEmitter<PokemonListItem>();

  @Output()
  public favoriteToggle = new EventEmitter<PokemonListItem>();

  public getPokemonNumber = getPokemonNumber;

  public getTypeColor(type: Type): string {
    return TYPE_COLORS[type] || '#A8A878';
  }

  public onCardClick(): void {
    this.cardClick.emit(this.pokemon);
  }

  public onFavoriteClick(event: Event): void {
    event.stopPropagation();
    this.favoriteToggle.emit(this.pokemon);
  }
}
