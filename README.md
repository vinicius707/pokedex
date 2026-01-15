# Pokédex

<div align="center">

![Angular](https://img.shields.io/badge/Angular-21-DD0031?style=for-the-badge&logo=angular&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Sass](https://img.shields.io/badge/Sass-CC6699?style=for-the-badge&logo=sass&logoColor=white)
![PokeAPI](https://img.shields.io/badge/PokeAPI-EF5350?style=for-the-badge)

Uma Pokédex interativa e moderna construída com Angular 21, utilizando Standalone Components e Signals para gerenciamento de estado reativo.

[Demo](#como-executar) · [Features](#funcionalidades) · [Arquitetura](#arquitetura)

</div>

---

## Sobre o Projeto

Este projeto consome a [PokeAPI](https://pokeapi.co/) para exibir informações completas sobre todos os 1350+ Pokémon. A aplicação foi desenvolvida seguindo as melhores práticas do Angular moderno:

- **Standalone Components** - Arquitetura sem NgModules
- **Signals** - Sistema reativo nativo do Angular
- **Lazy Loading** - Carregamento sob demanda para performance
- **Feature-based Architecture** - Organização modular por funcionalidades

## Funcionalidades

### 🏠 Lista de Pokémon

- Lista completa de todos os 1350+ Pokémon
- Paginação inteligente com 10 Pokémon por página
- Cache de dados para navegação instantânea
- Cards interativos com hover effects

### 🔍 Busca e Filtros

- Busca por nome ou número com debounce
- Filtro por tipo (18 tipos disponíveis)
- Limpeza rápida de filtros

### 📋 Detalhes do Pokémon

- Imagem em alta qualidade (Official Artwork)
- Base stats com barras visuais coloridas
- Habilidades (incluindo Hidden Abilities)
- Altura, peso e geração
- Descrição do Pokémon (Flavor Text)
- Cadeia de evolução interativa

### ⭐ Sistema de Favoritos

- Adicionar/remover favoritos com um clique
- Persistência em localStorage
- Página dedicada de favoritos
- Contador de favoritos

### ⚔️ Comparador de Pokémon

- Comparação lado a lado de dois Pokémon
- Barras comparativas de stats
- Indicadores de "vencedor" por atributo
- Total de stats comparativo

## Tecnologias

| Categoria   | Tecnologia | Versão |
| ----------- | ---------- | ------ |
| Framework   | Angular    | 21     |
| Linguagem   | TypeScript | 5.9    |
| Reatividade | RxJS       | 7.8    |
| Estilização | Sass       | -      |
| API         | PokeAPI    | v2     |

### Padrões Modernos do Angular

- **Standalone Components** - Componentes independentes sem módulos
- **Signals** - Estado reativo nativo (`signal()`, `computed()`)
- **Functional Guards** - Guards funcionais para rotas
- **Inject Function** - Injeção de dependências moderna

## Pré-requisitos

- **Node.js** >= 20.19.0 (recomendado: LTS)
- **npm** >= 9.0.0

## Como Executar

```bash
# Clone o repositório
git clone <url-do-repositorio>
cd pokedex

# Instale as dependências
cd pokedex
npm install

# Inicie o servidor de desenvolvimento
npm start
```

Acesse `http://localhost:4200` no navegador.

## Scripts Disponíveis

| Comando              | Descrição                                |
| -------------------- | ---------------------------------------- |
| `npm start`          | Servidor de desenvolvimento (porta 4200) |
| `npm run build`      | Build de produção em `dist/`             |
| `npm test`           | Testes unitários com Jest                |
| `npm run test:watch` | Testes em modo watch                     |
| `npm run test:coverage` | Testes com relatório de cobertura     |
| `npm run e2e`        | Testes E2E com Playwright                |
| `npm run e2e:ui`     | Testes E2E com interface gráfica         |
| `npm run watch`      | Build em modo watch                      |

## Testes

### Testes Unitários (Jest)

O projeto usa Jest com jest-preset-angular para testes unitários:

```bash
# Rodar todos os testes
npm test

# Rodar testes em modo watch
npm run test:watch

# Gerar relatório de cobertura
npm run test:coverage
```

**Arquivos de teste:**
- `src/app/core/services/*.spec.ts` - Testes de services
- `src/app/features/**/*.spec.ts` - Testes de componentes

### Testes E2E (Playwright)

Testes de integração automatizados com Playwright:

```bash
# Instalar browsers do Playwright (primeira vez)
npx playwright install

# Rodar testes E2E
npm run e2e

# Rodar com interface gráfica
npm run e2e:ui
```

**Cenários testados:**
- Lista de Pokémon e paginação
- Detalhes do Pokémon
- Sistema de favoritos
- Comparador de Pokémon

## Estrutura do Projeto

```
src/app/
├── core/                           # Camada core
│   └── services/
│       ├── pokemon.service.ts      # Serviço principal (API + cache)
│       ├── favorites.service.ts    # Gerenciamento de favoritos
│       └── evolution.service.ts    # Cadeia de evolução
│
├── features/                       # Features da aplicação
│   ├── pokedex/
│   │   └── components/
│   │       ├── pokemon-list/       # Lista com paginação
│   │       ├── pokemon-card/       # Card individual
│   │       └── search-filter/      # Busca e filtros
│   │
│   ├── pokemon-details/
│   │   └── components/
│   │       ├── pokemon-details/    # Página de detalhes
│   │       ├── stats-chart/        # Gráfico de stats
│   │       └── evolution-chain/    # Cadeia de evolução
│   │
│   ├── favorites/
│   │   └── components/
│   │       └── favorites-view/     # Página de favoritos
│   │
│   └── compare/
│       └── components/
│           ├── compare-view/       # Página de comparação
│           └── stats-comparison/   # Comparativo de stats
│
├── shared/                         # Recursos compartilhados
│   └── models/
│       ├── pokemon.ts              # Interfaces Pokemon
│       ├── type.ts                 # Tipos e cores
│       └── evolution.ts            # Interfaces de evolução
│
├── app.component.ts                # Componente raiz
├── app.routes.ts                   # Configuração de rotas
└── main.ts                         # Bootstrap
```

## Arquitetura

### Rotas

| Rota           | Componente              | Descrição           |
| -------------- | ----------------------- | ------------------- |
| `/`            | PokemonListComponent    | Lista paginada      |
| `/pokemon/:id` | PokemonDetailsComponent | Detalhes do Pokémon |
| `/favorites`   | FavoritesViewComponent  | Lista de favoritos  |
| `/compare`     | CompareViewComponent    | Comparador          |

### Fluxo de Dados

```
┌─────────────────────────────────────────────────────────────────┐
│                         Services                                 │
├─────────────────────────────────────────────────────────────────┤
│  PokemonService          FavoritesService     EvolutionService  │
│  ├── listCache           ├── favorites        ├── speciesCache  │
│  ├── detailsCache        └── localStorage     └── evolutionCache│
│  ├── currentPage                                                │
│  ├── searchTerm                                                 │
│  └── selectedType                                               │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                        Components                                │
├─────────────────────────────────────────────────────────────────┤
│  PokemonList → PokemonCard → PokemonDetails → EvolutionChain   │
│       ↓              ↓              ↓                           │
│  SearchFilter    Favorites    StatsChart                        │
└─────────────────────────────────────────────────────────────────┘
```

### Sistema de Cache

O projeto implementa cache em múltiplas camadas para otimizar performance:

1. **listCache** - Pokémon da lista (PokemonListItem)
2. **detailsCache** - Detalhes completos (Pokemon)
3. **speciesCache** - Informações de espécie (SpeciesInfo)
4. **evolutionCache** - Cadeias de evolução (EvolutionChain)
5. **localStorage** - Favoritos persistentes

### Signals e Computed

```typescript
// Estado reativo
currentPage = signal(1);
searchTerm = signal('');
selectedType = signal<Type | null>(null);

// Estado derivado
totalPages = computed(() => Math.ceil(totalPokemons() / pageSize));
filteredPokemons = computed(() => /* aplica filtros */);
```

## Otimizações de Performance

| Técnica            | Benefício                              |
| ------------------ | -------------------------------------- |
| Paginação          | Apenas 10 Pokémon por requisição       |
| Cache em Map       | Evita requisições duplicadas           |
| Computed Signals   | Recálculo apenas quando necessário     |
| Lazy Loading       | Componentes carregados sob demanda     |
| Debounce na busca  | Evita requisições excessivas           |
| Image lazy loading | Carrega imagens apenas quando visíveis |

## API Endpoints Utilizados

| Endpoint                | Uso                    |
| ----------------------- | ---------------------- |
| `/pokemon?limit&offset` | Lista paginada         |
| `/pokemon/{id}`         | Detalhes do Pokémon    |
| `/pokemon-species/{id}` | Informações de espécie |
| `/evolution-chain/{id}` | Cadeia de evolução     |

## Créditos

- **Tutorial Original**: [Paulo Salvatore - YouTube](https://www.youtube.com/watch?v=jbrD2lzMtVw)
- **Repositório Base**: [Fabrica de Sinapse](https://github.com/FabricaDeSinapse/fabrica-live-angular)
- **API**: [PokeAPI](https://pokeapi.co/)

## Licença

Este projeto é apenas para fins educacionais.

---

<div align="center">

Feito com ❤️ e Angular

</div>
