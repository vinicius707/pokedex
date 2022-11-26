import { Type } from "./type";

export interface IPokemon {
    image: string;
    number: number;
    name: string;
    types: Type[];
  }