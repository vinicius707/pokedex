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

    it('should clear filters', () => {
      service.setSearchTerm('test');

      service.clearFilters();

      expect(service.searchTerm()).toBe('');
      expect(service.selectedType()).toBeNull();
      expect(service.typeFilterMode()).toBe(false);
    });

    it('should clear type filter mode when clearing filters', fakeAsync(() => {
      // First set a type filter to activate type filter mode
      service.setSelectedType('fire' as Type);
      
      // Handle the type API request
      const typeReq = httpMock.expectOne('https://pokeapi.co/api/v2/type/fire');
      typeReq.flush({
        pokemon: [
          { pokemon: { name: 'charmander', url: 'https://pokeapi.co/api/v2/pokemon/4/' } },
        ],
      });

      tick();

      // Handle pokemon detail request
      const detailReq = httpMock.expectOne('https://pokeapi.co/api/v2/pokemon/4');
      detailReq.flush({ ...mockPokemonDetail, id: 4, name: 'charmander' });

      tick();

      expect(service.typeFilterMode()).toBe(true);

      // Now clear filters
      service.clearFilters();

      expect(service.typeFilterMode()).toBe(false);
      expect(service.typeFilterPage()).toBe(1);
      expect(service.typeFilterTotal()).toBe(0);
    }));
  });

  describe('type filter mode', () => {
    const mockTypeResponse = {
      pokemon: [
        { pokemon: { name: 'charmander', url: 'https://pokeapi.co/api/v2/pokemon/4/' } },
        { pokemon: { name: 'charmeleon', url: 'https://pokeapi.co/api/v2/pokemon/5/' } },
        { pokemon: { name: 'charizard', url: 'https://pokeapi.co/api/v2/pokemon/6/' } },
      ],
    };

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

    it('should set type filter mode when selecting a type', fakeAsync(() => {
      service.setSelectedType('fire' as Type);

      expect(service.typeFilterMode()).toBe(true);
      expect(service.selectedType()).toBe('fire');

      const typeReq = httpMock.expectOne('https://pokeapi.co/api/v2/type/fire');
      typeReq.flush(mockTypeResponse);

      tick();

      // Handle pokemon detail requests
      const req4 = httpMock.expectOne('https://pokeapi.co/api/v2/pokemon/4');
      req4.flush({ ...mockPokemonDetail, id: 4, name: 'charmander', types: [{ type: { name: 'fire' } }] });

      const req5 = httpMock.expectOne('https://pokeapi.co/api/v2/pokemon/5');
      req5.flush({ ...mockPokemonDetail, id: 5, name: 'charmeleon', types: [{ type: { name: 'fire' } }] });

      const req6 = httpMock.expectOne('https://pokeapi.co/api/v2/pokemon/6');
      req6.flush({ ...mockPokemonDetail, id: 6, name: 'charizard', types: [{ type: { name: 'fire' } }] });

      tick();

      expect(service.typeFilterTotal()).toBe(3);
    }));

    it('should disable type filter mode when selecting null type', fakeAsync(() => {
      // First enable type filter mode
      service.setSelectedType('fire' as Type);

      const typeReq = httpMock.expectOne('https://pokeapi.co/api/v2/type/fire');
      typeReq.flush(mockTypeResponse);

      tick();

      const req4 = httpMock.expectOne('https://pokeapi.co/api/v2/pokemon/4');
      req4.flush({ ...mockPokemonDetail, id: 4, name: 'charmander' });

      const req5 = httpMock.expectOne('https://pokeapi.co/api/v2/pokemon/5');
      req5.flush({ ...mockPokemonDetail, id: 5, name: 'charmeleon' });

      const req6 = httpMock.expectOne('https://pokeapi.co/api/v2/pokemon/6');
      req6.flush({ ...mockPokemonDetail, id: 6, name: 'charizard' });

      tick();

      expect(service.typeFilterMode()).toBe(true);

      // Now disable it
      service.setSelectedType(null);

      expect(service.typeFilterMode()).toBe(false);
      expect(service.selectedType()).toBeNull();
    }));

    it('should use cache when same type is selected again', fakeAsync(() => {
      // First selection
      service.setSelectedType('fire' as Type);

      const typeReq = httpMock.expectOne('https://pokeapi.co/api/v2/type/fire');
      typeReq.flush(mockTypeResponse);

      tick();

      const req4 = httpMock.expectOne('https://pokeapi.co/api/v2/pokemon/4');
      req4.flush({ ...mockPokemonDetail, id: 4, name: 'charmander' });

      const req5 = httpMock.expectOne('https://pokeapi.co/api/v2/pokemon/5');
      req5.flush({ ...mockPokemonDetail, id: 5, name: 'charmeleon' });

      const req6 = httpMock.expectOne('https://pokeapi.co/api/v2/pokemon/6');
      req6.flush({ ...mockPokemonDetail, id: 6, name: 'charizard' });

      tick();

      // Switch to another type and back
      service.setSelectedType(null);
      service.setSelectedType('fire' as Type);

      // Should NOT make another type request (using cache)
      httpMock.expectNone('https://pokeapi.co/api/v2/type/fire');
    }));

    it('should handle type API error', fakeAsync(() => {
      service.setSelectedType('fire' as Type);

      const typeReq = httpMock.expectOne('https://pokeapi.co/api/v2/type/fire');
      typeReq.error(new ErrorEvent('Network error'));

      tick();

      expect(service.loading()).toBe(false);
      expect(service.typeFilterMode()).toBe(false);
    }));

    it('should calculate totalPages based on type filter when active', fakeAsync(() => {
      service.setSelectedType('fire' as Type);

      const typeReq = httpMock.expectOne('https://pokeapi.co/api/v2/type/fire');
      typeReq.flush(mockTypeResponse);

      tick();

      const req4 = httpMock.expectOne('https://pokeapi.co/api/v2/pokemon/4');
      req4.flush({ ...mockPokemonDetail, id: 4, name: 'charmander' });

      const req5 = httpMock.expectOne('https://pokeapi.co/api/v2/pokemon/5');
      req5.flush({ ...mockPokemonDetail, id: 5, name: 'charmeleon' });

      const req6 = httpMock.expectOne('https://pokeapi.co/api/v2/pokemon/6');
      req6.flush({ ...mockPokemonDetail, id: 6, name: 'charizard' });

      tick();

      // 3 fire pokemons / 10 per page = 1 page
      expect(service.totalPages()).toBe(1);
    }));
  });

  describe('type filter pagination', () => {
    const mockLargeTypeResponse = {
      pokemon: Array.from({ length: 25 }, (_, i) => ({
        pokemon: {
          name: `pokemon${i + 100}`,
          url: `https://pokeapi.co/api/v2/pokemon/${i + 100}/`,
        },
      })),
    };

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

    it('should navigate to next page in type filter mode', fakeAsync(() => {
      service.setSelectedType('water' as Type);

      const typeReq = httpMock.expectOne('https://pokeapi.co/api/v2/type/water');
      typeReq.flush(mockLargeTypeResponse);

      tick();

      // Handle first page pokemon requests (10 pokemons)
      for (let i = 0; i < 10; i++) {
        const req = httpMock.expectOne(`https://pokeapi.co/api/v2/pokemon/${i + 100}`);
        req.flush({ ...mockPokemonDetail, id: i + 100, name: `pokemon${i + 100}` });
      }

      tick();

      expect(service.typeFilterPage()).toBe(1);
      expect(service.totalPages()).toBe(3); // 25 / 10 = 3 pages

      // Go to next page
      service.nextPage();

      // Handle second page pokemon requests
      for (let i = 10; i < 20; i++) {
        const req = httpMock.expectOne(`https://pokeapi.co/api/v2/pokemon/${i + 100}`);
        req.flush({ ...mockPokemonDetail, id: i + 100, name: `pokemon${i + 100}` });
      }

      tick();

      expect(service.typeFilterPage()).toBe(2);
    }));

    it('should navigate to previous page in type filter mode', fakeAsync(() => {
      service.setSelectedType('water' as Type);

      const typeReq = httpMock.expectOne('https://pokeapi.co/api/v2/type/water');
      typeReq.flush(mockLargeTypeResponse);

      tick();

      // Handle first page
      for (let i = 0; i < 10; i++) {
        const req = httpMock.expectOne(`https://pokeapi.co/api/v2/pokemon/${i + 100}`);
        req.flush({ ...mockPokemonDetail, id: i + 100, name: `pokemon${i + 100}` });
      }

      tick();

      // Go to page 2
      service.goToPage(2);

      for (let i = 10; i < 20; i++) {
        const req = httpMock.expectOne(`https://pokeapi.co/api/v2/pokemon/${i + 100}`);
        req.flush({ ...mockPokemonDetail, id: i + 100, name: `pokemon${i + 100}` });
      }

      tick();

      expect(service.typeFilterPage()).toBe(2);

      // Go back to page 1 (should use cache)
      service.previousPage();

      tick();

      expect(service.typeFilterPage()).toBe(1);
    }));

    it('should go to specific page in type filter mode', fakeAsync(() => {
      service.setSelectedType('water' as Type);

      const typeReq = httpMock.expectOne('https://pokeapi.co/api/v2/type/water');
      typeReq.flush(mockLargeTypeResponse);

      tick();

      // Handle first page
      for (let i = 0; i < 10; i++) {
        const req = httpMock.expectOne(`https://pokeapi.co/api/v2/pokemon/${i + 100}`);
        req.flush({ ...mockPokemonDetail, id: i + 100, name: `pokemon${i + 100}` });
      }

      tick();

      // Go to page 3
      service.goToPage(3);

      for (let i = 20; i < 25; i++) {
        const req = httpMock.expectOne(`https://pokeapi.co/api/v2/pokemon/${i + 100}`);
        req.flush({ ...mockPokemonDetail, id: i + 100, name: `pokemon${i + 100}` });
      }

      tick();

      expect(service.typeFilterPage()).toBe(3);
    }));

    it('should not go beyond last page in type filter mode', fakeAsync(() => {
      service.setSelectedType('water' as Type);

      const typeReq = httpMock.expectOne('https://pokeapi.co/api/v2/type/water');
      typeReq.flush(mockLargeTypeResponse);

      tick();

      // Handle first page
      for (let i = 0; i < 10; i++) {
        const req = httpMock.expectOne(`https://pokeapi.co/api/v2/pokemon/${i + 100}`);
        req.flush({ ...mockPokemonDetail, id: i + 100, name: `pokemon${i + 100}` });
      }

      tick();

      // Set to last page manually
      (service as any).typeFilterPage.set(3);

      // Try to go to next page
      service.nextPage();

      tick();

      // Should stay on page 3
      expect(service.typeFilterPage()).toBe(3);
    }));
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
