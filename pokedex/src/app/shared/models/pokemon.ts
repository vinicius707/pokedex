import { Type } from './type';

export interface PokemonSprites {
  front_default: string;
  front_shiny: string | null;
  back_default: string | null;
  back_shiny: string | null;
  other?: {
    'official-artwork'?: {
      front_default: string;
      front_shiny: string | null;
    };
  };
}

export interface PokemonStat {
  name: string;
  value: number;
}

export interface PokemonAbility {
  name: string;
  isHidden: boolean;
}

export interface Pokemon {
  id: number;
  name: string;
  image: string;
  sprites: PokemonSprites;
  types: Type[];
  stats: PokemonStat[];
  abilities: PokemonAbility[];
  height: number;
  weight: number;
  speciesUrl: string;
}

// Versão simplificada para listagem (compatibilidade)
export interface PokemonListItem {
  id: number;
  name: string;
  image: string;
  types: Type[];
}

export function getPokemonImage(pokemon: Pokemon | PokemonListItem): string {
  if (
    'sprites' in pokemon &&
    pokemon.sprites.other?.['official-artwork']?.front_default
  ) {
    return pokemon.sprites.other['official-artwork'].front_default;
  }
  return pokemon.image;
}

export function getPokemonNumber(pokemon: Pokemon | PokemonListItem): string {
  return leadingZero(pokemon.id);
}

function leadingZero(num: number, size: number = 3): string {
  let s = String(num);
  while (s.length < size) {
    s = '0' + s;
  }
  return s;
}

export function formatHeight(height: number): string {
  const meters = height / 10;
  return `${meters.toFixed(1)} m`;
}

export function formatWeight(weight: number): string {
  const kg = weight / 10;
  return `${kg.toFixed(1)} kg`;
}

export function capitalizeFirstLetter(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
