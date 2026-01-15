/**
 * Interfaces para respostas da PokeAPI
 * Melhor type safety e autocomplete
 */

// ============================================
// Pokemon List Endpoint
// ============================================

export interface ApiPokemonListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: ApiPokemonListResult[];
}

export interface ApiPokemonListResult {
  name: string;
  url: string;
}

// ============================================
// Pokemon Detail Endpoint
// ============================================

export interface ApiPokemonDetailResponse {
  id: number;
  name: string;
  height: number;
  weight: number;
  sprites: ApiPokemonSprites;
  types: ApiPokemonType[];
  stats: ApiPokemonStat[];
  abilities: ApiPokemonAbility[];
  species: ApiResource;
}

export interface ApiPokemonSprites {
  front_default: string | null;
  front_shiny: string | null;
  back_default: string | null;
  back_shiny: string | null;
  other?: {
    'official-artwork'?: {
      front_default: string | null;
    };
  };
}

export interface ApiPokemonType {
  slot: number;
  type: ApiResource;
}

export interface ApiPokemonStat {
  base_stat: number;
  effort: number;
  stat: ApiResource;
}

export interface ApiPokemonAbility {
  ability: ApiResource;
  is_hidden: boolean;
  slot: number;
}

// ============================================
// Type Endpoint
// ============================================

export interface ApiTypeResponse {
  id: number;
  name: string;
  pokemon: ApiTypePokemon[];
}

export interface ApiTypePokemon {
  pokemon: ApiResource;
  slot: number;
}

// ============================================
// Species Endpoint
// ============================================

export interface ApiSpeciesResponse {
  id: number;
  name: string;
  generation: ApiResource;
  evolution_chain: {
    url: string;
  };
  genera: ApiGenus[];
  flavor_text_entries: ApiFlavorText[];
}

export interface ApiGenus {
  genus: string;
  language: ApiResource;
}

export interface ApiFlavorText {
  flavor_text: string;
  language: ApiResource;
  version: ApiResource;
}

// ============================================
// Evolution Chain Endpoint
// ============================================

export interface ApiEvolutionChainResponse {
  id: number;
  chain: ApiEvolutionLink;
}

export interface ApiEvolutionLink {
  species: ApiResource;
  evolution_details: ApiEvolutionDetail[];
  evolves_to: ApiEvolutionLink[];
}

export interface ApiEvolutionDetail {
  trigger: ApiResource;
  min_level: number | null;
  item: ApiResource | null;
  held_item: ApiResource | null;
  min_happiness: number | null;
  min_affection: number | null;
  time_of_day: string;
  known_move: ApiResource | null;
  known_move_type: ApiResource | null;
  location: ApiResource | null;
}

// ============================================
// Common Types
// ============================================

export interface ApiResource {
  name: string;
  url: string;
}
