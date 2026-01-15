import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { PokemonService } from './pokemon.service';
import { Type } from 'src/app/shared/models/type';

describe('PokemonService', () => {
  let service: PokemonService;
  let httpMock: HttpTestingController;

  const mockPokemonListResponse = {
    count: 1350,
    results: [
      { name: 'bulbasaur', url: 'https://pokeapi.co/api/v2/pokemon/1/' },
      { name: 'ivysaur', url: 'https://pokeapi.co/api/v2/pokemon/2/' },
    ],
  };

  const mockPokemonDetail = {
    id: 1,
    name: 'bulbasaur',
    sprites: {
      front_default: 'https://example.com/front.png',
      front_shiny: 'https://example.com/front_shiny.png',
      back_default: 'https://example.com/back.png',
      back_shiny: 'https://example.com/back_shiny.png',
      other: {
        'official-artwork': {
          front_default: 'https://example.com/official.png',
        },
      },
    },
    types: [{ type: { name: 'grass' } }, { type: { name: 'poison' } }],
    stats: [
      { stat: { name: 'hp' }, base_stat: 45 },
      { stat: { name: 'attack' }, base_stat: 49 },
      { stat: { name: 'defense' }, base_stat: 49 },
      { stat: { name: 'special-attack' }, base_stat: 65 },
      { stat: { name: 'special-defense' }, base_stat: 65 },
      { stat: { name: 'speed' }, base_stat: 45 },
    ],
    abilities: [
      { ability: { name: 'overgrow' }, is_hidden: false },
      { ability: { name: 'chlorophyll' }, is_hidden: true },
    ],
    height: 7,
    weight: 69,
    species: { url: 'https://pokeapi.co/api/v2/pokemon-species/1/' },
  };

  const mockPokemonDetailNoArtwork = {
    ...mockPokemonDetail,
    sprites: {
      front_default: 'https://example.com/front.png',
      front_shiny: null,
      back_default: null,
      back_shiny: null,
      other: {},
    },
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [PokemonService],
    });

    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  describe('initialization', () => {
    it('should be created and initialize', fakeAsync(() => {
      service = TestBed.inject(PokemonService);

      // Handle initial count request
      const countReq = httpMock.expectOne(
        'https://pokeapi.co/api/v2/pokemon/?limit=1'
      );
      countReq.flush({ count: 1350 });

      tick();

      // Handle page load request
      const pageReq = httpMock.expectOne(
        'https://pokeapi.co/api/v2/pokemon/?offset=0&limit=10'
      );
      pageReq.flush(mockPokemonListResponse);

      tick();

      // Handle individual pokemon requests
      const req1 = httpMock.expectOne('https://pokeapi.co/api/v2/pokemon/1/');
      req1.flush(mockPokemonDetail);

      const req2 = httpMock.expectOne('https://pokeapi.co/api/v2/pokemon/2/');
      req2.flush({ ...mockPokemonDetail, id: 2, name: 'ivysaur' });

      tick();

      expect(service).toBeTruthy();
      expect(service.totalPokemons()).toBe(1350);
    }));

    it('should handle initialization error', fakeAsync(() => {
      service = TestBed.inject(PokemonService);

      const countReq = httpMock.expectOne(
        'https://pokeapi.co/api/v2/pokemon/?limit=1'
      );
      countReq.error(new ErrorEvent('Network error'));

      tick();

      expect(service.loading()).toBe(false);
    }));
  });

  describe('loadPage', () => {
    beforeEach(fakeAsync(() => {
      service = TestBed.inject(PokemonService);

      const countReq = httpMock.expectOne(
        'https://pokeapi.co/api/v2/pokemon/?limit=1'
      );
      countReq.flush({ count: 100 });

      tick();

      const pageReq = httpMock.expectOne(
        'https://pokeapi.co/api/v2/pokemon/?offset=0&limit=10'
      );
      pageReq.flush(mockPokemonListResponse);

      tick();

      const req1 = httpMock.expectOne('https://pokeapi.co/api/v2/pokemon/1/');
      req1.flush(mockPokemonDetail);

      const req2 = httpMock.expectOne('https://pokeapi.co/api/v2/pokemon/2/');
      req2.flush({ ...mockPokemonDetail, id: 2, name: 'ivysaur' });

      tick();
    }));

    it('should not load invalid page (less than 1)', fakeAsync(() => {
      service.loadPage(0);
      tick();

      httpMock.expectNone('https://pokeapi.co/api/v2/pokemon/?offset=-10&limit=10');
    }));

    it('should not load invalid page (greater than total)', fakeAsync(() => {
      service.loadPage(999);
      tick();

      httpMock.expectNone('https://pokeapi.co/api/v2/pokemon/?offset=9980&limit=10');
    }));

    it('should use cache when page already loaded', fakeAsync(() => {
      // Page 1 already loaded in beforeEach
      service.loadPage(1);
      tick();

      // Should not make new request
      httpMock.expectNone('https://pokeapi.co/api/v2/pokemon/?offset=0&limit=10');
      expect(service.currentPage()).toBe(1);
    }));

    it('should handle load error', fakeAsync(() => {
      service.loadPage(2);

      const pageReq = httpMock.expectOne(
        'https://pokeapi.co/api/v2/pokemon/?offset=10&limit=10'
      );
      pageReq.error(new ErrorEvent('Network error'));

      tick();

      expect(service.loading()).toBe(false);
    }));
  });

  describe('getPokemonById', () => {
    beforeEach(fakeAsync(() => {
      service = TestBed.inject(PokemonService);

      const countReq = httpMock.expectOne(
        'https://pokeapi.co/api/v2/pokemon/?limit=1'
      );
      countReq.flush({ count: 100 });

      tick();

      const pageReq = httpMock.expectOne(
        'https://pokeapi.co/api/v2/pokemon/?offset=0&limit=10'
      );
      pageReq.flush({ count: 100, results: [] });

      tick();
    }));

    it('should fetch pokemon by id', (done) => {
      service.getPokemonById(1).subscribe((pokemon) => {
        expect(pokemon.id).toBe(1);
        expect(pokemon.name).toBe('bulbasaur');
        expect(pokemon.types).toContain('grass');
        expect(pokemon.stats.length).toBe(6);
        expect(pokemon.abilities.length).toBe(2);
        done();
      });

      const req = httpMock.expectOne('https://pokeapi.co/api/v2/pokemon/1');
      req.flush(mockPokemonDetail);
    });

    it('should return cached pokemon', (done) => {
      // First call
      service.getPokemonById(1).subscribe(() => {
        // Second call should use cache
        service.getPokemonById(1).subscribe((pokemon) => {
          expect(pokemon.id).toBe(1);
          done();
        });
      });

      const req = httpMock.expectOne('https://pokeapi.co/api/v2/pokemon/1');
      req.flush(mockPokemonDetail);

      // No second request should be made
      httpMock.expectNone('https://pokeapi.co/api/v2/pokemon/1');
    });

    it('should use front_default when official artwork not available', (done) => {
      service.getPokemonById(1).subscribe((pokemon) => {
        expect(pokemon.image).toBe('https://example.com/front.png');
        done();
      });

      const req = httpMock.expectOne('https://pokeapi.co/api/v2/pokemon/1');
      req.flush(mockPokemonDetailNoArtwork);
    });
  });

  describe('searchPokemonByName', () => {
    beforeEach(fakeAsync(() => {
      service = TestBed.inject(PokemonService);

      const countReq = httpMock.expectOne(
        'https://pokeapi.co/api/v2/pokemon/?limit=1'
      );
      countReq.flush({ count: 100 });

      tick();

      const pageReq = httpMock.expectOne(
        'https://pokeapi.co/api/v2/pokemon/?offset=0&limit=10'
      );
      pageReq.flush({ count: 100, results: [] });

      tick();
    }));

    it('should search pokemon by name', (done) => {
      service.searchPokemonByName('Bulbasaur').subscribe((pokemon) => {
        expect(pokemon).not.toBeNull();
        expect(pokemon!.name).toBe('bulbasaur');
        done();
      });

      const req = httpMock.expectOne('https://pokeapi.co/api/v2/pokemon/bulbasaur');
      req.flush(mockPokemonDetail);
    });

    it('should return null when pokemon not found', (done) => {
      service.searchPokemonByName('notapokemon').subscribe((pokemon) => {
        expect(pokemon).toBeNull();
        done();
      });

      const req = httpMock.expectOne(
        'https://pokeapi.co/api/v2/pokemon/notapokemon'
      );
      req.error(new ErrorEvent('Not found'), { status: 404 });
    });
  });

  describe('filters', () => {
    beforeEach(fakeAsync(() => {
      service = TestBed.inject(PokemonService);

      const countReq = httpMock.expectOne(
        'https://pokeapi.co/api/v2/pokemon/?limit=1'
      );
      countReq.flush({ count: 100 });

      tick();

      const pageReq = httpMock.expectOne(
        'https://pokeapi.co/api/v2/pokemon/?offset=0&limit=10'
      );
      pageReq.flush(mockPokemonListResponse);

      tick();

      const req1 = httpMock.expectOne('https://pokeapi.co/api/v2/pokemon/1/');
      req1.flush(mockPokemonDetail);

      const req2 = httpMock.expectOne('https://pokeapi.co/api/v2/pokemon/2/');
      req2.flush({
        ...mockPokemonDetail,
        id: 2,
        name: 'ivysaur',
        types: [{ type: { name: 'grass' } }],
      });

      tick();
    }));

    it('should set search term', () => {
      service.setSearchTerm('bulba');
      expect(service.searchTerm()).toBe('bulba');
    });

    it('should filter by search term (name)', () => {
      service.setSearchTerm('bulba');
      const filtered = service.filteredPokemons();
      expect(filtered.length).toBe(1);
      expect(filtered[0].name).toBe('bulbasaur');
    });

    it('should filter by search term (id)', () => {
      service.setSearchTerm('1');
      const filtered = service.filteredPokemons();
      expect(filtered.some((p) => p.id === 1)).toBe(true);
    });

    it('should set selected type', () => {
      service.setSelectedType('fire' as Type);
      expect(service.selectedType()).toBe('fire');
    });

    it('should filter by type', () => {
      service.setSelectedType('grass' as Type);
      const filtered = service.filteredPokemons();
      expect(filtered.every((p) => p.types.includes('grass' as Type))).toBe(true);
    });

    it('should clear filters', () => {
      service.setSearchTerm('test');
      service.setSelectedType('fire' as Type);

      service.clearFilters();

      expect(service.searchTerm()).toBe('');
      expect(service.selectedType()).toBeNull();
    });
  });

  describe('pagination navigation', () => {
    beforeEach(fakeAsync(() => {
      service = TestBed.inject(PokemonService);

      const countReq = httpMock.expectOne(
        'https://pokeapi.co/api/v2/pokemon/?limit=1'
      );
      countReq.flush({ count: 100 });

      tick();

      const pageReq = httpMock.expectOne(
        'https://pokeapi.co/api/v2/pokemon/?offset=0&limit=10'
      );
      pageReq.flush(mockPokemonListResponse);

      tick();

      const req1 = httpMock.expectOne('https://pokeapi.co/api/v2/pokemon/1/');
      req1.flush(mockPokemonDetail);

      const req2 = httpMock.expectOne('https://pokeapi.co/api/v2/pokemon/2/');
      req2.flush({ ...mockPokemonDetail, id: 2, name: 'ivysaur' });

      tick();
    }));

    it('should calculate total pages', () => {
      expect(service.totalPages()).toBe(10); // 100 pokemons / 10 per page
    });

    it('should go to specific page', fakeAsync(() => {
      service.goToPage(2);

      const pageReq = httpMock.expectOne(
        'https://pokeapi.co/api/v2/pokemon/?offset=10&limit=10'
      );
      pageReq.flush({
        results: [
          { name: 'pokemon11', url: 'https://pokeapi.co/api/v2/pokemon/11/' },
        ],
      });

      tick();

      const req = httpMock.expectOne('https://pokeapi.co/api/v2/pokemon/11/');
      req.flush({ ...mockPokemonDetail, id: 11, name: 'pokemon11' });

      tick();
    }));

    it('should go to next page', fakeAsync(() => {
      service.nextPage();

      const pageReq = httpMock.expectOne(
        'https://pokeapi.co/api/v2/pokemon/?offset=10&limit=10'
      );
      pageReq.flush({ results: [] });

      tick();
    }));

    it('should not go to next page when on last page', fakeAsync(() => {
      // Set to last page
      (service as any).currentPage.set(10);

      service.nextPage();

      httpMock.expectNone('https://pokeapi.co/api/v2/pokemon/?offset=100&limit=10');
    }));

    it('should go to previous page', fakeAsync(() => {
      // Set current page to 2
      (service as any).currentPage.set(2);

      service.previousPage();

      // Should use cache for page 1
      expect(service.currentPage()).toBe(1);
    }));

    it('should not go to previous page when on first page', fakeAsync(() => {
      service.previousPage();

      // No request should be made
      expect(service.currentPage()).toBe(1);
    }));
  });

  describe('computed signals', () => {
    beforeEach(fakeAsync(() => {
      service = TestBed.inject(PokemonService);

      const countReq = httpMock.expectOne(
        'https://pokeapi.co/api/v2/pokemon/?limit=1'
      );
      countReq.flush({ count: 100 });

      tick();

      const pageReq = httpMock.expectOne(
        'https://pokeapi.co/api/v2/pokemon/?offset=0&limit=10'
      );
      pageReq.flush(mockPokemonListResponse);

      tick();

      const req1 = httpMock.expectOne('https://pokeapi.co/api/v2/pokemon/1/');
      req1.flush(mockPokemonDetail);

      const req2 = httpMock.expectOne('https://pokeapi.co/api/v2/pokemon/2/');
      req2.flush({ ...mockPokemonDetail, id: 2, name: 'ivysaur' });

      tick();
    }));

    it('should return paginated pokemons', () => {
      const pokemons = service.paginatedPokemons();
      expect(pokemons.length).toBeGreaterThan(0);
    });

    it('should return filtered pokemons with no filters', () => {
      const filtered = service.filteredPokemons();
      const paginated = service.paginatedPokemons();
      expect(filtered.length).toBe(paginated.length);
    });
  });
});
