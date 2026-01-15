import {
  sanitizeSearchInput,
  isValidPokemonName,
  isValidPokemonId,
  extractPokemonIdFromUrl,
} from './security.utils';

describe('Security Utils', () => {
  describe('sanitizeSearchInput', () => {
    it('should return empty string for null input', () => {
      expect(sanitizeSearchInput(null as any)).toBe('');
    });

    it('should return empty string for undefined input', () => {
      expect(sanitizeSearchInput(undefined as any)).toBe('');
    });

    it('should return empty string for non-string input', () => {
      expect(sanitizeSearchInput(123 as any)).toBe('');
    });

    it('should trim whitespace', () => {
      expect(sanitizeSearchInput('  bulbasaur  ')).toBe('bulbasaur');
    });

    it('should allow letters and numbers', () => {
      expect(sanitizeSearchInput('pikachu25')).toBe('pikachu25');
    });

    it('should allow hyphens', () => {
      expect(sanitizeSearchInput('mr-mime')).toBe('mr-mime');
    });

    it('should allow spaces', () => {
      expect(sanitizeSearchInput('tapu koko')).toBe('tapu koko');
    });

    it('should remove special characters', () => {
      expect(sanitizeSearchInput('bulba<script>saur')).toBe('bulbasaur');
    });

    it('should remove SQL injection attempts', () => {
      expect(sanitizeSearchInput("pikachu'; DROP TABLE pokemon;--")).toBe('pikachu DROP TABLE pokemon');
    });

    it('should limit length to 100 characters', () => {
      const longInput = 'a'.repeat(150);
      const result = sanitizeSearchInput(longInput);
      expect(result.length).toBeLessThanOrEqual(100);
    });
  });

  describe('isValidPokemonName', () => {
    it('should return false for null', () => {
      expect(isValidPokemonName(null as any)).toBe(false);
    });

    it('should return false for undefined', () => {
      expect(isValidPokemonName(undefined as any)).toBe(false);
    });

    it('should return false for empty string', () => {
      expect(isValidPokemonName('')).toBe(false);
    });

    it('should return true for valid pokemon name', () => {
      expect(isValidPokemonName('bulbasaur')).toBe(true);
    });

    it('should return true for name with hyphen', () => {
      expect(isValidPokemonName('mr-mime')).toBe(true);
    });

    it('should return false for name longer than 50 characters', () => {
      const longName = 'a'.repeat(51);
      expect(isValidPokemonName(longName)).toBe(false);
    });
  });

  describe('isValidPokemonId', () => {
    it('should return false for negative numbers', () => {
      expect(isValidPokemonId(-1)).toBe(false);
    });

    it('should return false for zero', () => {
      expect(isValidPokemonId(0)).toBe(false);
    });

    it('should return true for positive integers', () => {
      expect(isValidPokemonId(1)).toBe(true);
      expect(isValidPokemonId(150)).toBe(true);
      expect(isValidPokemonId(1000)).toBe(true);
    });

    it('should return false for numbers greater than 100000', () => {
      expect(isValidPokemonId(100001)).toBe(false);
    });

    it('should return true for number at upper limit', () => {
      expect(isValidPokemonId(100000)).toBe(true);
    });

    it('should return false for non-integers', () => {
      expect(isValidPokemonId(1.5)).toBe(false);
    });

    it('should accept string numbers', () => {
      expect(isValidPokemonId('25')).toBe(true);
    });

    it('should return false for NaN', () => {
      expect(isValidPokemonId(NaN)).toBe(false);
    });

    it('should return false for invalid string', () => {
      expect(isValidPokemonId('abc')).toBe(false);
    });
  });

  describe('extractPokemonIdFromUrl', () => {
    it('should return null for null input', () => {
      expect(extractPokemonIdFromUrl(null as any)).toBeNull();
    });

    it('should return null for undefined input', () => {
      expect(extractPokemonIdFromUrl(undefined as any)).toBeNull();
    });

    it('should return null for non-string input', () => {
      expect(extractPokemonIdFromUrl(123 as any)).toBeNull();
    });

    it('should extract id from valid pokemon url', () => {
      expect(
        extractPokemonIdFromUrl('https://pokeapi.co/api/v2/pokemon/25/')
      ).toBe(25);
    });

    it('should extract id from url without trailing slash', () => {
      expect(
        extractPokemonIdFromUrl('https://pokeapi.co/api/v2/pokemon/25')
      ).toBe(25);
    });

    it('should extract id from species url', () => {
      expect(
        extractPokemonIdFromUrl('https://pokeapi.co/api/v2/pokemon-species/1/')
      ).toBe(1);
    });

    it('should return null for url without valid id', () => {
      expect(
        extractPokemonIdFromUrl('https://pokeapi.co/api/v2/pokemon/abc/')
      ).toBeNull();
    });

    it('should return null for empty url', () => {
      expect(extractPokemonIdFromUrl('')).toBeNull();
    });
  });
});
