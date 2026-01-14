export interface EvolutionChainLink {
  id: number;
  name: string;
  image: string;
  minLevel: number | null;
  trigger: string | null;
  item: string | null;
}

export interface EvolutionChain {
  id: number;
  chain: EvolutionChainLink[];
}

export interface SpeciesInfo {
  id: number;
  name: string;
  evolutionChainUrl: string;
  generation: number;
  flavorText: string;
  genus: string;
}
