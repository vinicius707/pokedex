import { TestBed } from '@angular/core/testing';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { EvolutionService } from './evolution.service';

describe('EvolutionService', () => {
  let service: EvolutionService;
  let httpMock: HttpTestingController;

  const mockSpeciesResponse = {
    id: 1,
    name: 'bulbasaur',
    evolution_chain: {
      url: 'https://pokeapi.co/api/v2/evolution-chain/1/',
    },
    generation: {
      url: 'https://pokeapi.co/api/v2/generation/1/',
    },
    flavor_text_entries: [
      {
        flavor_text: 'A strange seed was\nplanted on its\nback at birth.',
        language: { name: 'en' },
      },
      {
        flavor_text: 'Une graine bizarre...',
        language: { name: 'fr' },
      },
    ],
    genera: [
      { genus: 'Seed Pokémon', language: { name: 'en' } },
      { genus: 'Pokémon Graine', language: { name: 'fr' } },
    ],
  };

  const mockSpeciesResponseNoEnglish = {
    id: 1,
    name: 'bulbasaur',
    evolution_chain: {
      url: 'https://pokeapi.co/api/v2/evolution-chain/1/',
    },
    generation: {
      url: 'https://pokeapi.co/api/v2/generation/1/',
    },
    flavor_text_entries: [
      {
        flavor_text: 'Une graine bizarre...',
        language: { name: 'fr' },
      },
    ],
    genera: [{ genus: 'Pokémon Graine', language: { name: 'fr' } }],
  };

  const mockEvolutionChainResponse = {
    id: 1,
    chain: {
      species: {
        name: 'bulbasaur',
        url: 'https://pokeapi.co/api/v2/pokemon-species/1/',
      },
      evolution_details: [],
      evolves_to: [
        {
          species: {
            name: 'ivysaur',
            url: 'https://pokeapi.co/api/v2/pokemon-species/2/',
          },
          evolution_details: [
            {
              min_level: 16,
              trigger: { name: 'level-up' },
              item: null,
            },
          ],
          evolves_to: [
            {
              species: {
                name: 'venusaur',
                url: 'https://pokeapi.co/api/v2/pokemon-species/3/',
              },
              evolution_details: [
                {
                  min_level: 32,
                  trigger: { name: 'level-up' },
                  item: null,
                },
              ],
              evolves_to: [],
            },
          ],
        },
      ],
    },
  };

  const mockEvolutionChainWithItem = {
    id: 2,
    chain: {
      species: {
        name: 'pikachu',
        url: 'https://pokeapi.co/api/v2/pokemon-species/25/',
      },
      evolution_details: [],
      evolves_to: [
        {
          species: {
            name: 'raichu',
            url: 'https://pokeapi.co/api/v2/pokemon-species/26/',
          },
          evolution_details: [
            {
              min_level: null,
              trigger: { name: 'use-item' },
              item: { name: 'thunder-stone' },
            },
          ],
          evolves_to: [],
        },
      ],
    },
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [EvolutionService],
    });

    service = TestBed.inject(EvolutionService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  describe('getSpeciesInfo', () => {
    it('should fetch species info', (done) => {
      service.getSpeciesInfo(1).subscribe((info) => {
        expect(info).not.toBeNull();
        expect(info!.id).toBe(1);
        expect(info!.name).toBe('bulbasaur');
        expect(info!.evolutionChainUrl).toBe(
          'https://pokeapi.co/api/v2/evolution-chain/1/'
        );
        expect(info!.generation).toBe(1);
        expect(info!.flavorText).toContain('strange seed');
        expect(info!.genus).toBe('Seed Pokémon');
        done();
      });

      const req = httpMock.expectOne(
        'https://pokeapi.co/api/v2/pokemon-species/1'
      );
      req.flush(mockSpeciesResponse);
    });

    it('should return cached species info', (done) => {
      // First call
      service.getSpeciesInfo(1).subscribe(() => {
        // Second call should use cache
        service.getSpeciesInfo(1).subscribe((info) => {
          expect(info).not.toBeNull();
          expect(info!.id).toBe(1);
          done();
        });
      });

      const req = httpMock.expectOne(
        'https://pokeapi.co/api/v2/pokemon-species/1'
      );
      req.flush(mockSpeciesResponse);

      // No second request should be made
      httpMock.expectNone('https://pokeapi.co/api/v2/pokemon-species/1');
    });

    it('should handle missing English entries', (done) => {
      service.getSpeciesInfo(1).subscribe((info) => {
        expect(info).not.toBeNull();
        expect(info!.flavorText).toBe('');
        expect(info!.genus).toBe('');
        done();
      });

      const req = httpMock.expectOne(
        'https://pokeapi.co/api/v2/pokemon-species/1'
      );
      req.flush(mockSpeciesResponseNoEnglish);
    });

    it('should handle API error', (done) => {
      service.getSpeciesInfo(999).subscribe((info) => {
        expect(info).toBeNull();
        done();
      });

      const req = httpMock.expectOne(
        'https://pokeapi.co/api/v2/pokemon-species/999'
      );
      req.error(new ErrorEvent('Not found'), { status: 404 });
    });

    it('should replace form feed character in flavor text', (done) => {
      const responseWithFormFeed = {
        ...mockSpeciesResponse,
        flavor_text_entries: [
          {
            flavor_text: 'Line 1\fLine 2',
            language: { name: 'en' },
          },
        ],
      };

      service.getSpeciesInfo(1).subscribe((info) => {
        expect(info!.flavorText).toBe('Line 1 Line 2');
        done();
      });

      const req = httpMock.expectOne(
        'https://pokeapi.co/api/v2/pokemon-species/1'
      );
      req.flush(responseWithFormFeed);
    });
  });

  describe('getEvolutionChain', () => {
    it('should fetch evolution chain', (done) => {
      service.getEvolutionChain(1).subscribe((chain) => {
        expect(chain).not.toBeNull();
        expect(chain!.id).toBe(1);
        expect(chain!.chain.length).toBe(3);
        expect(chain!.chain[0].name).toBe('bulbasaur');
        expect(chain!.chain[1].name).toBe('ivysaur');
        expect(chain!.chain[1].minLevel).toBe(16);
        expect(chain!.chain[2].name).toBe('venusaur');
        expect(chain!.chain[2].minLevel).toBe(32);
        done();
      });

      const speciesReq = httpMock.expectOne(
        'https://pokeapi.co/api/v2/pokemon-species/1'
      );
      speciesReq.flush(mockSpeciesResponse);

      const chainReq = httpMock.expectOne(
        'https://pokeapi.co/api/v2/evolution-chain/1/'
      );
      chainReq.flush(mockEvolutionChainResponse);
    });

    it('should return cached evolution chain', (done) => {
      // First call
      service.getEvolutionChain(1).subscribe(() => {
        // Second call should use species cache and evolution cache
        service.getEvolutionChain(1).subscribe((chain) => {
          expect(chain).not.toBeNull();
          expect(chain!.id).toBe(1);
          done();
        });
      });

      const speciesReq = httpMock.expectOne(
        'https://pokeapi.co/api/v2/pokemon-species/1'
      );
      speciesReq.flush(mockSpeciesResponse);

      const chainReq = httpMock.expectOne(
        'https://pokeapi.co/api/v2/evolution-chain/1/'
      );
      chainReq.flush(mockEvolutionChainResponse);

      // No more requests should be made
      httpMock.expectNone('https://pokeapi.co/api/v2/pokemon-species/1');
      httpMock.expectNone('https://pokeapi.co/api/v2/evolution-chain/1/');
    });

    it('should return null when species info fails', (done) => {
      service.getEvolutionChain(999).subscribe((chain) => {
        expect(chain).toBeNull();
        done();
      });

      const req = httpMock.expectOne(
        'https://pokeapi.co/api/v2/pokemon-species/999'
      );
      req.error(new ErrorEvent('Not found'), { status: 404 });
    });

    it('should handle evolution chain API error', (done) => {
      service.getEvolutionChain(1).subscribe((chain) => {
        expect(chain).toBeNull();
        done();
      });

      const speciesReq = httpMock.expectOne(
        'https://pokeapi.co/api/v2/pokemon-species/1'
      );
      speciesReq.flush(mockSpeciesResponse);

      const chainReq = httpMock.expectOne(
        'https://pokeapi.co/api/v2/evolution-chain/1/'
      );
      chainReq.error(new ErrorEvent('Server error'), { status: 500 });
    });

    it('should handle item-based evolution', (done) => {
      const pikachuSpecies = {
        ...mockSpeciesResponse,
        id: 25,
        name: 'pikachu',
        evolution_chain: {
          url: 'https://pokeapi.co/api/v2/evolution-chain/2/',
        },
      };

      service.getEvolutionChain(25).subscribe((chain) => {
        expect(chain).not.toBeNull();
        expect(chain!.chain[1].item).toBe('thunder-stone');
        expect(chain!.chain[1].trigger).toBe('use-item');
        done();
      });

      const speciesReq = httpMock.expectOne(
        'https://pokeapi.co/api/v2/pokemon-species/25'
      );
      speciesReq.flush(pikachuSpecies);

      const chainReq = httpMock.expectOne(
        'https://pokeapi.co/api/v2/evolution-chain/2/'
      );
      chainReq.flush(mockEvolutionChainWithItem);
    });
  });

  describe('URL extraction methods', () => {
    it('should extract pokemon id from URL', (done) => {
      service.getEvolutionChain(1).subscribe((chain) => {
        expect(chain!.chain[0].id).toBe(1);
        expect(chain!.chain[1].id).toBe(2);
        expect(chain!.chain[2].id).toBe(3);
        done();
      });

      const speciesReq = httpMock.expectOne(
        'https://pokeapi.co/api/v2/pokemon-species/1'
      );
      speciesReq.flush(mockSpeciesResponse);

      const chainReq = httpMock.expectOne(
        'https://pokeapi.co/api/v2/evolution-chain/1/'
      );
      chainReq.flush(mockEvolutionChainResponse);
    });

    it('should handle invalid URL format', (done) => {
      const invalidChain = {
        id: 1,
        chain: {
          species: {
            name: 'test',
            url: 'invalid-url',
          },
          evolution_details: [],
          evolves_to: [],
        },
      };

      service.getEvolutionChain(1).subscribe((chain) => {
        expect(chain!.chain[0].id).toBe(0);
        done();
      });

      const speciesReq = httpMock.expectOne(
        'https://pokeapi.co/api/v2/pokemon-species/1'
      );
      speciesReq.flush(mockSpeciesResponse);

      const chainReq = httpMock.expectOne(
        'https://pokeapi.co/api/v2/evolution-chain/1/'
      );
      chainReq.flush(invalidChain);
    });

    it('should extract generation number correctly', (done) => {
      const gen5Species = {
        ...mockSpeciesResponse,
        generation: {
          url: 'https://pokeapi.co/api/v2/generation/5/',
        },
      };

      service.getSpeciesInfo(1).subscribe((info) => {
        expect(info!.generation).toBe(5);
        done();
      });

      const req = httpMock.expectOne(
        'https://pokeapi.co/api/v2/pokemon-species/1'
      );
      req.flush(gen5Species);
    });

    it('should handle invalid generation URL', (done) => {
      const invalidGenSpecies = {
        ...mockSpeciesResponse,
        generation: {
          url: 'invalid-url',
        },
      };

      service.getSpeciesInfo(1).subscribe((info) => {
        expect(info!.generation).toBe(0);
        done();
      });

      const req = httpMock.expectOne(
        'https://pokeapi.co/api/v2/pokemon-species/1'
      );
      req.flush(invalidGenSpecies);
    });

    it('should handle invalid evolution chain URL', (done) => {
      const invalidEvolutionSpecies = {
        ...mockSpeciesResponse,
        evolution_chain: {
          url: 'invalid-url',
        },
      };

      service.getEvolutionChain(1).subscribe((chain) => {
        // Should still work, chain id will be 0
        expect(chain!.id).toBe(0);
        done();
      });

      const speciesReq = httpMock.expectOne(
        'https://pokeapi.co/api/v2/pokemon-species/1'
      );
      speciesReq.flush(invalidEvolutionSpecies);

      const chainReq = httpMock.expectOne('invalid-url');
      chainReq.flush(mockEvolutionChainResponse);
    });
  });

  describe('evolution chain parsing', () => {
    it('should generate correct image URLs', (done) => {
      service.getEvolutionChain(1).subscribe((chain) => {
        expect(chain!.chain[0].image).toBe(
          'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/1.png'
        );
        done();
      });

      const speciesReq = httpMock.expectOne(
        'https://pokeapi.co/api/v2/pokemon-species/1'
      );
      speciesReq.flush(mockSpeciesResponse);

      const chainReq = httpMock.expectOne(
        'https://pokeapi.co/api/v2/evolution-chain/1/'
      );
      chainReq.flush(mockEvolutionChainResponse);
    });

    it('should handle pokemon without evolution', (done) => {
      const singlePokemonChain = {
        id: 100,
        chain: {
          species: {
            name: 'voltorb',
            url: 'https://pokeapi.co/api/v2/pokemon-species/100/',
          },
          evolution_details: [],
          evolves_to: [],
        },
      };

      const voltorbSpecies = {
        ...mockSpeciesResponse,
        id: 100,
        name: 'voltorb',
        evolution_chain: {
          url: 'https://pokeapi.co/api/v2/evolution-chain/100/',
        },
      };

      service.getEvolutionChain(100).subscribe((chain) => {
        expect(chain!.chain.length).toBe(1);
        expect(chain!.chain[0].name).toBe('voltorb');
        done();
      });

      const speciesReq = httpMock.expectOne(
        'https://pokeapi.co/api/v2/pokemon-species/100'
      );
      speciesReq.flush(voltorbSpecies);

      const chainReq = httpMock.expectOne(
        'https://pokeapi.co/api/v2/evolution-chain/100/'
      );
      chainReq.flush(singlePokemonChain);
    });
  });
});
