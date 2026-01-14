# Pokedex

Uma aplicacao web moderna que exibe uma Pokedex interativa usando Angular 21. O projeto foi desenvolvido como estudo pratico, seguindo o tutorial do Paulo Salvatore, e posteriormente modernizado com as mais recentes tecnologias do Angular: componentes standalone e signals para gerenciamento de estado reativo.

## Sobre o Projeto

Este projeto consome a [PokeAPI](https://pokeapi.co/) para buscar informacoes sobre Pokemon e exibe os dados em cards visuais. A aplicacao demonstra o uso de:

- **Standalone Components**: Arquitetura moderna do Angular sem NgModules
- **Signals**: Sistema reativo nativo do Angular para gerenciamento de estado
- **Computed Signals**: Derivacao reativa de estado para paginacao
- **Arquitetura por Feature**: Organizacao modular baseada em features
- **HTTP Client**: Consumo de APIs RESTful
- **Sass**: Estilizacao moderna com pre-processador CSS

## Funcionalidades

- 📋 Lista completa de todos os 1350+ Pokemon da PokeAPI
- 📄 **Paginacao inteligente** com 10 Pokemon por pagina
- 🔄 **Cache de dados** para navegacao rapida entre paginas ja visitadas
- ⏮️ Navegacao: Primeira, Anterior, Proxima e Ultima pagina
- 🔢 Indicadores de pagina com ellipsis para navegacao facil
- 🎴 Cards visuais com imagem oficial de cada Pokemon
- 🔢 Numero formatado (com zeros a esquerda)
- 🏷️ Exibicao de tipos com cores diferenciadas
- ⚡ Atualizacoes reativas usando Signals
- 🎨 Interface responsiva estilizada com Sass
- ♿ Acessibilidade com atributos ARIA

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
- **Computed Signals** - Derivacao de estado

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
│   │   │       └── pokemon.service.ts    # Servico com paginacao e cache
│   │   │
│   │   ├── features/                # Features da aplicacao
│   │   │   └── pokedex/
│   │   │       └── components/
│   │   │           ├── pokemon-list/     # Lista com paginacao
│   │   │           └── pokemon-card/     # Card individual
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

### Sistema de Paginacao

O sistema de paginacao foi implementado com foco em **performance** e **experiencia do usuario**:

1. **Lazy Loading**: Apenas os Pokemon da pagina atual sao carregados
2. **Cache Inteligente**: Pokemon ja carregados sao armazenados em um `Map`
3. **Navegacao Instantanea**: Paginas em cache sao exibidas imediatamente
4. **Indicadores Visuais**: Loading spinner durante carregamento

### Fluxo de Dados

```
┌─────────────────────────────────────────────────────────────┐
│                      PokemonService                          │
├─────────────────────────────────────────────────────────────┤
│  Signals:                                                    │
│  - currentPage: signal(1)                                    │
│  - totalPokemons: signal(0)                                  │
│  - loading: signal(false)                                    │
│                                                              │
│  Computed Signals:                                           │
│  - totalPages: computed(() => ...)                           │
│  - paginatedPokemons: computed(() => ...)                    │
│                                                              │
│  Cache:                                                      │
│  - pokemonsCache: Map<position, Pokemon>                     │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    PokemonListComponent                      │
├─────────────────────────────────────────────────────────────┤
│  - Consome paginatedPokemons do service                      │
│  - Exibe controles de paginacao                              │
│  - Computed signal: paginationInfo                           │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    PokemonCardComponent                      │
├─────────────────────────────────────────────────────────────┤
│  - Recebe Pokemon via @Input                                 │
│  - Renderiza card visual                                     │
└─────────────────────────────────────────────────────────────┘
```

## Desenvolvimento

### Padroes Utilizados

- **Standalone Components**: Todos os componentes sao standalone (sem NgModules)
- **Signals**: Estado reativo gerenciado via Signals
- **Computed Signals**: Estado derivado calculado automaticamente
- **Injectable Services**: Servicos injetaveis com `providedIn: 'root'`
- **HTTP Client**: Requisicoes HTTP usando HttpClient do Angular
- **Cache Pattern**: Armazenamento em memoria para dados ja carregados

### Otimizacoes de Performance

1. **Paginacao**: Apenas 10 Pokemon carregados por vez
2. **Cache**: Evita requisicoes duplicadas a API
3. **Computed Signals**: Recalculo automatico apenas quando necessario
4. **Lazy Loading**: Carregamento sob demanda

## Creditos

- **Tutorial Original**: [Paulo Salvatore - YouTube](https://www.youtube.com/watch?v=jbrD2lzMtVw)
- **Repositorio Base**: [Fabrica de Sinapse](https://github.com/FabricaDeSinapse/fabrica-live-angular)
- **API**: [PokeAPI](https://pokeapi.co/)

## Licenca

Este projeto e apenas para fins educacionais.
