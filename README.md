# Pokédex

<div align="center">

![Angular](https://img.shields.io/badge/Angular-21-DD0031?style=for-the-badge&logo=angular&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Sass](https://img.shields.io/badge/Sass-CC6699?style=for-the-badge&logo=sass&logoColor=white)
![PokeAPI](https://img.shields.io/badge/PokeAPI-EF5350?style=for-the-badge)
![Vercel](https://img.shields.io/badge/Vercel-Deployed-000000?style=for-the-badge&logo=vercel)

Uma Pokédex interativa e moderna construída com Angular 21, utilizando Standalone Components e Signals para gerenciamento de estado reativo.

[**Live Demo**](https://pokedex-pied-three.vercel.app/) · [Features](#funcionalidades) · [Arquitetura](#decisões-de-arquitetura) · [Deploy](#deploy-na-vercel)

</div>

---

## Sobre o Projeto

Este projeto consome a [PokeAPI](https://pokeapi.co/) para exibir informações completas sobre todos os 1350+ Pokémon. A aplicação foi desenvolvida seguindo as melhores práticas do Angular moderno:

- **Standalone Components** - Arquitetura sem NgModules
- **Signals** - Sistema reativo nativo do Angular
- **Lazy Loading** - Carregamento sob demanda para performance
- **Feature-based Architecture** - Organização modular por funcionalidades

## Demo

**Acesse a aplicação em produção:** [https://pokedex-pied-three.vercel.app/](https://pokedex-pied-three.vercel.app/)

A aplicação está hospedada na Vercel com deploy automático a partir da branch `main`.

## Funcionalidades

### Lista de Pokémon

- Lista completa de todos os 1350+ Pokémon
- Paginação inteligente com 10 Pokémon por página
- Cache de dados para navegação instantânea
- Cards interativos com hover effects

### Busca e Filtros

- Busca por nome ou número com debounce
- Filtro por tipo via API (18 tipos disponíveis)
- Limpeza rápida de filtros

### Detalhes do Pokémon

- Imagem em alta qualidade (Official Artwork)
- Base stats com barras visuais coloridas
- Habilidades (incluindo Hidden Abilities)
- Altura, peso e geração
- Descrição do Pokémon (Flavor Text)
- Cadeia de evolução interativa

### Sistema de Favoritos

- Adicionar/remover favoritos com um clique
- Persistência em localStorage
- Página dedicada de favoritos
- Contador de favoritos

### Comparador de Pokémon

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
| Hospedagem  | Vercel     | -      |
| Testes      | Jest       | 30     |
| E2E         | Playwright | 1.40   |

---

## Decisões de Arquitetura

### Por que Standalone Components?

O Angular 14+ introduziu Standalone Components, permitindo criar componentes sem a necessidade de NgModules. Esta escolha foi feita por:

- **Simplicidade** - Menos boilerplate, imports diretos no componente
- **Tree-shaking** - Melhor eliminação de código não utilizado
- **Lazy Loading** - Carregamento mais granular por componente
- **Futuro do Angular** - NgModules estão sendo descontinuados

```typescript
@Component({
  selector: 'app-pokemon-card',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
```

### Por que Signals ao invés de BehaviorSubject/NgRx?

Signals são o novo sistema reativo nativo do Angular 16+. A escolha foi baseada em:

- **Performance** - Detecção de mudanças mais granular e eficiente
- **Simplicidade** - API mais simples que RxJS para estado local
- **Integração** - Funciona nativamente com o change detection
- **Computed Values** - Valores derivados com recálculo automático

```typescript
// Estado reativo
currentPage = signal(1);
searchTerm = signal('');

// Estado derivado (recalculado automaticamente)
totalPages = computed(() => Math.ceil(this.totalPokemons() / this.pageSize));
filteredPokemons = computed(() => this.applyFilters());
```

### Por que Feature-based Architecture?

A organização por features (ao invés de por tipo de arquivo) facilita:

- **Escalabilidade** - Cada feature é independente
- **Manutenção** - Código relacionado junto
- **Lazy Loading** - Features carregadas sob demanda
- **Colaboração** - Equipes podem trabalhar em features separadas

```
src/app/
├── core/           # Serviços singleton
├── features/       # Features independentes
│   ├── pokedex/
│   ├── pokemon-details/
│   ├── favorites/
│   └── compare/
└── shared/         # Código compartilhado
```

### Sistema de Cache com LRU

Implementamos um cache LRU (Least Recently Used) para gerenciamento eficiente de memória:

- **Limite de entradas** - Evita consumo excessivo de memória
- **Evicção automática** - Remove itens menos usados quando cheio
- **Performance** - Acesso O(1) para get/set

```typescript
private readonly listCache = new LRUCache<number, PokemonListItem>(200);
private readonly detailsCache = new LRUCache<number, Pokemon>(100);
```

### Segurança

A aplicação implementa várias camadas de segurança:

| Medida | Descrição |
| ------ | --------- |
| Input Sanitization | Remove caracteres especiais de inputs de busca |
| Validação de IDs | Verifica se IDs de Pokémon são válidos (1-100000) |
| Validação de localStorage | Valida schema dos dados antes de usar |
| Limite de favoritos | Máximo de 1000 favoritos para evitar DoS |
| Concurrent Requests | Limite de 4 requisições simultâneas |

### Performance

| Técnica | Benefício |
| ------- | --------- |
| Paginação | Apenas 10 Pokémon por requisição |
| LRU Cache | Evita requisições duplicadas com limite de memória |
| Computed Signals | Recálculo apenas quando necessário |
| Lazy Loading | Componentes carregados sob demanda |
| OnPush Strategy | Change detection otimizado |
| Debounce na busca | Evita requisições excessivas |
| Image lazy loading | Carrega imagens apenas quando visíveis |
| Preloading | Carrega próxima página em background |
| Retry com Backoff | Resilência a falhas de rede |

---

## Deploy na Vercel

### Aplicação em Produção

A aplicação está disponível em: [https://pokedex-pied-three.vercel.app/](https://pokedex-pied-three.vercel.app/)

### Deploy Automático

O projeto está configurado para deploy automático na Vercel:

1. **Branch principal**: `main`
2. **Trigger**: Push na branch main
3. **Build**: Automático via `vercel.json`

### Configuração (`vercel.json`)

```json
{
  "version": 2,
  "buildCommand": "npm run build:prod",
  "outputDirectory": "dist/pokedex",
  "framework": "angular",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

### Como Fazer Deploy

1. **Fork/Clone** o repositório
2. **Importe** o projeto na [Vercel](https://vercel.com)
3. **Configure** o Root Directory como `pokedex`
4. A Vercel detecta automaticamente as configurações
5. Clique em **Deploy**

### Configurações na Vercel

| Configuração | Valor |
| ------------ | ----- |
| Framework Preset | Angular |
| Root Directory | `pokedex` |
| Build Command | `npm run build:prod` |
| Output Directory | `dist/pokedex` |
| Node.js Version | 20.x |

---

## Pré-requisitos

- **Node.js** >= 20.0.0 (recomendado: LTS)
- **npm** >= 9.0.0

## Como Executar Localmente

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

| Comando                 | Descrição                                |
| ----------------------- | ---------------------------------------- |
| `npm start`             | Servidor de desenvolvimento (porta 4200) |
| `npm run build`         | Build de desenvolvimento                 |
| `npm run build:prod`    | Build de produção em `dist/`             |
| `npm test`              | Testes unitários com Jest                |
| `npm run test:watch`    | Testes em modo watch                     |
| `npm run test:coverage` | Testes com relatório de cobertura        |
| `npm run e2e`           | Testes E2E com Playwright                |
| `npm run e2e:ui`        | Testes E2E com interface gráfica         |

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
- `src/app/shared/utils/*.spec.ts` - Testes de utilitários

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
- Filtro por tipo via API
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
│   ├── models/
│   │   ├── pokemon.ts              # Interfaces Pokemon
│   │   ├── type.ts                 # Tipos e cores
│   │   ├── evolution.ts            # Interfaces de evolução
│   │   └── api-responses.ts        # Interfaces da API
│   │
│   └── utils/
│       ├── security.utils.ts       # Sanitização e validação
│       ├── lru-cache.ts            # Cache LRU
│       └── http-retry.ts           # Retry com backoff
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
│                          PokeAPI                                 │
│  /pokemon  ·  /type  ·  /pokemon-species  ·  /evolution-chain   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                         Services                                 │
├─────────────────────────────────────────────────────────────────┤
│  PokemonService          FavoritesService     EvolutionService  │
│  ├── LRU listCache       ├── favorites        ├── speciesCache  │
│  ├── LRU detailsCache    └── localStorage     └── evolutionCache│
│  ├── currentPage (signal)                                       │
│  ├── searchTerm (signal)                                        │
│  └── selectedType (signal)                                      │
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

O projeto implementa cache em múltiplas camadas com LRU para otimizar performance:

| Cache | Tipo | Limite | Descrição |
| ----- | ---- | ------ | --------- |
| listCache | LRU | 200 | Pokémon da lista |
| detailsCache | LRU | 100 | Detalhes completos |
| typeFilterCache | Map | 18 | Resultados por tipo |
| typeFilterPokemonCache | LRU | 500 | Pokémon filtrados |
| localStorage | - | 1000 | Favoritos persistentes |

## API Endpoints Utilizados

| Endpoint                | Uso                    |
| ----------------------- | ---------------------- |
| `/pokemon?limit&offset` | Lista paginada         |
| `/pokemon/{id}`         | Detalhes do Pokémon    |
| `/type/{type}`          | Pokémon por tipo       |
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

Feito com Angular 21

[**Acesse a Demo**](https://pokedex-pied-three.vercel.app/)

</div>
