# Pokedex (Angular + Sass)

Projeto de estudo que implementa uma Pokedex simples em Angular, seguindo o passo a passo do video do Paulo Salvatore. A aplicacao consome a PokeAPI para listar pokemons e renderiza cards com imagem, numero, nome e tipos.

## Funcionalidades

- Lista os primeiros 40 pokemons da PokeAPI
- Card com imagem oficial, numero formatado e tipos
- Estilos em Sass com classes por tipo

## Tecnologias

- Angular 18
- TypeScript 5.4
- Sass
- RxJS
- PokeAPI

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

- `pokedex/src/app/services/pokemon.service.ts`: consumo da PokeAPI
- `pokedex/src/app/pokemon-list`: lista de pokemons
- `pokedex/src/app/pokemon-card`: card individual
- `pokedex/src/model`: modelos e helpers

## Creditos

- Video: https://www.youtube.com/watch?v=jbrD2lzMtVw
- Repositorio base: https://github.com/FabricaDeSinapse/fabrica-live-angular
