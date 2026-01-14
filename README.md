# Pokedex

Uma aplicacao web moderna que exibe uma Pokedex interativa usando Angular 21. O projeto foi desenvolvido como estudo pratico, seguindo o tutorial do Paulo Salvatore, e posteriormente modernizado com as mais recentes tecnologias do Angular: componentes standalone e signals para gerenciamento de estado reativo.

## Sobre o Projeto

Este projeto consome a [PokeAPI](https://pokeapi.co/) para buscar informacoes sobre Pokemon e exibe os dados em cards visuais. A aplicacao demonstra o uso de:

- **Standalone Components**: Arquitetura moderna do Angular sem NgModules
- **Signals**: Sistema reativo nativo do Angular para gerenciamento de estado
- **Arquitetura por Feature**: Organizacao modular baseada em features
- **HTTP Client**: Consumo de APIs RESTful
- **Sass**: Estilizacao moderna com pre-processador CSS

## Funcionalidades

- 📋 Lista dos primeiros 40 Pokemon da PokeAPI
- 🎴 Cards visuais com imagem oficial de cada Pokemon
- 🔢 Numero formatado (com zeros a esquerda)
- 🏷️ Exibicao de tipos com cores diferenciadas
- ⚡ Atualizacoes reativas usando Signals
- 🎨 Interface responsiva estilizada com Sass

## Tecnologias

### Core

- **Angular 21** - Framework principal
- **TypeScript 5.9** - Linguagem de programacao
- **RxJS 7.8** - Programacao reativa (usado para HTTP)

### Estilo

- **Sass** - Pre-processador CSS

### APIs

- **PokeAPI** - API publica de dados sobre Pokemon

### Padroes Modernos

- **Standalone Components** - Componentes independentes
- **Signals** - Sistema reativo nativo

## Pre-requisitos

- **Node.js** >= 20.19.0 (recomendado: LTS)
- **npm** >= 9.0.0

## Como Executar

### 1. Clone o repositorio

```bash
git clone <url-do-repositorio>
cd pokedex
```

### 2. Instale as dependencias

```bash
cd pokedex
npm install
```

### 3. Inicie o servidor de desenvolvimento

```bash
npm start
```

A aplicacao estara disponivel em `http://localhost:4200`

O servidor recarrega automaticamente quando voce fizer alteracoes nos arquivos.

## Scripts Disponiveis

| Comando         | Descricao                                          |
| --------------- | -------------------------------------------------- |
| `npm start`     | Inicia o servidor de desenvolvimento na porta 4200 |
| `npm run build` | Compila o projeto para producao na pasta `dist/`   |
| `npm run test`  | Executa os testes unitarios com Karma              |
| `npm run watch` | Compila o projeto em modo watch (desenvolvimento)  |

## Estrutura do Projeto

```
pokedex/
├── src/
│   ├── app/
│   │   ├── core/                    # Camada core da aplicacao
│   │   │   └── services/
│   │   │       └── pokemon.service.ts    # Servico de consumo da API
│   │   │
│   │   ├── features/                # Features da aplicacao
│   │   │   └── pokedex/
│   │   │       └── components/
│   │   │           ├── pokemon-list/     # Componente de lista
│   │   │           └── pokemon-card/     # Componente de card
│   │   │
│   │   ├── shared/                  # Recursos compartilhados
│   │   │   └── models/
│   │   │       ├── pokemon.ts           # Modelo Pokemon
│   │   │       └── type.ts              # Modelo Type
│   │   │
│   │   ├── app.component.ts         # Componente raiz (standalone)
│   │   └── main.ts                  # Bootstrap da aplicacao
│   │
│   ├── assets/                      # Arquivos estaticos
│   ├── styles.sass                  # Estilos globais
│   └── index.html                   # HTML principal
│
├── angular.json                     # Configuracao do Angular CLI
├── package.json                     # Dependencias do projeto
└── tsconfig.json                    # Configuracao do TypeScript
```

## Arquitetura

O projeto segue uma arquitetura por **feature** com separacao clara de responsabilidades:

- **`core/`**: Servicos e recursos centrais da aplicacao (ex: PokemonService)
- **`features/`**: Features completas da aplicacao (ex: pokedex com seus componentes)
- **`shared/`**: Modelos, interfaces e utilitarios compartilhados

### Fluxo de Dados

1. **PokemonService** consome a PokeAPI via HTTP Client
2. Os dados sao armazenados em um **Signal** reativo
3. Os componentes **pokemon-list** e **pokemon-card** consomem o signal
4. A interface atualiza automaticamente quando o estado muda

## Desenvolvimento

### Padroes Utilizados

- **Standalone Components**: Todos os componentes sao standalone (sem NgModules)
- **Signals**: Estado reativo gerenciado via Signals
- **Injectable Services**: Servicos injetaveis com `providedIn: 'root'`
- **HTTP Client**: Requisicoes HTTP usando HttpClient do Angular

## Creditos

- **Tutorial Original**: [Paulo Salvatore - YouTube](https://www.youtube.com/watch?v=jbrD2lzMtVw)
- **Repositorio Base**: [Fabrica de Sinapse](https://github.com/FabricaDeSinapse/fabrica-live-angular)
- **API**: [PokeAPI](https://pokeapi.co/)

## Licenca

Este projeto e apenas para fins educacionais.
