# Pokedex (Angular + Sass)

Projeto de estudo que implementa uma Pokedex simples em Angular, seguindo o passo a passo do video do Paulo Salvatore. A aplicacao consome a PokeAPI para listar pokemons e renderiza cards com imagem, numero, nome e tipos. A base foi modernizada para Angular 21 com componentes standalone e signals.

## Funcionalidades

- Lista os primeiros 40 pokemons da PokeAPI
- Card com imagem oficial, numero formatado e tipos
- Estilos em Sass com classes por tipo

## Tecnologias

- Angular 21
- TypeScript 5.9
- Sass
- RxJS
- PokeAPI
- Signals
- Standalone components

## Como executar

1) Entre na pasta do app:

```
cd pokedex
```

2) Instale dependencias:

```
npm install
```

3) Rode o servidor de desenvolvimento:

```
npm start
```

Abra `http://localhost:4200`.

## Scripts uteis

- `npm start`: inicia o dev server
- `npm run build`: build de producao
- `npm run test`: testes unitarios (Karma)

## Estrutura (resumo)

- `pokedex/src/app/core/services/pokemon.service.ts`: consumo da PokeAPI e estado via signals
- `pokedex/src/app/features/pokedex/components/pokemon-list`: lista de pokemons
- `pokedex/src/app/features/pokedex/components/pokemon-card`: card individual
- `pokedex/src/app/shared/models`: modelos e helpers

## Creditos

- Video: https://www.youtube.com/watch?v=jbrD2lzMtVw
- Repositorio base: https://github.com/FabricaDeSinapse/fabrica-live-angular
