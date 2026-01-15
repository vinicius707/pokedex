import { TestBed } from '@angular/core/testing';
import { FavoritesService } from './favorites.service';

describe('FavoritesService', () => {
  let service: FavoritesService;
  let localStorageMock: {
    getItem: jest.Mock;
    setItem: jest.Mock;
    removeItem: jest.Mock;
    clear: jest.Mock;
  };

  beforeEach(() => {
    localStorageMock = {
      getItem: jest.fn(),
      setItem: jest.fn(),
      removeItem: jest.fn(),
      clear: jest.fn(),
    };

    Object.defineProperty(window, 'localStorage', {
      value: localStorageMock,
      writable: true,
    });

    localStorageMock.getItem.mockReturnValue(null);

    TestBed.configureTestingModule({
      providers: [FavoritesService],
    });

    service = TestBed.inject(FavoritesService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('initialization', () => {
    it('should be created', () => {
      expect(service).toBeTruthy();
    });

    it('should initialize with empty favorites when localStorage is empty', () => {
      expect(service.favorites()).toEqual([]);
    });

    it('should load favorites from localStorage', () => {
      localStorageMock.getItem.mockReturnValue('[1, 2, 3]');

      const newService = new FavoritesService();

      expect(newService.favorites()).toEqual([1, 2, 3]);
    });

    it('should handle invalid JSON in localStorage', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      localStorageMock.getItem.mockReturnValue('invalid json');

      const newService = new FavoritesService();

      expect(newService.favorites()).toEqual([]);
      expect(consoleSpy).toHaveBeenCalled();

      consoleSpy.mockRestore();
    });

    it('should handle localStorage getItem error', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      localStorageMock.getItem.mockImplementation(() => {
        throw new Error('Storage error');
      });

      const newService = new FavoritesService();

      expect(newService.favorites()).toEqual([]);
      expect(consoleSpy).toHaveBeenCalled();

      consoleSpy.mockRestore();
    });

    it('should filter out invalid IDs from localStorage', () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
      localStorageMock.getItem.mockReturnValue('[1, -5, 2, 0, 3, "invalid", null]');

      const newService = new FavoritesService();

      expect(newService.favorites()).toEqual([1, 2, 3]);

      consoleSpy.mockRestore();
    });

    it('should remove duplicates from localStorage', () => {
      localStorageMock.getItem.mockReturnValue('[1, 2, 1, 3, 2]');

      const newService = new FavoritesService();

      expect(newService.favorites()).toEqual([1, 2, 3]);
    });

    it('should return empty array when localStorage has non-array data', () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
      localStorageMock.getItem.mockReturnValue('{"not": "array"}');

      const newService = new FavoritesService();

      expect(newService.favorites()).toEqual([]);
      expect(consoleSpy).toHaveBeenCalledWith('Invalid favorites data format, resetting');

      consoleSpy.mockRestore();
    });
  });

  describe('toggle', () => {
    it('should add pokemon to favorites if not already favorite', () => {
      service.toggle(1);

      expect(service.favorites()).toContain(1);
    });

    it('should remove pokemon from favorites if already favorite', () => {
      service.toggle(1);
      expect(service.favorites()).toContain(1);

      service.toggle(1);
      expect(service.favorites()).not.toContain(1);
    });

    it('should not add invalid pokemon id (negative)', () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
      
      service.toggle(-1);

      expect(service.favorites()).not.toContain(-1);
      expect(consoleSpy).toHaveBeenCalledWith('Invalid Pokemon ID:', -1);
      
      consoleSpy.mockRestore();
    });

    it('should not add invalid pokemon id (zero)', () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
      
      service.toggle(0);

      expect(service.favorites()).not.toContain(0);
      
      consoleSpy.mockRestore();
    });

    it('should not add invalid pokemon id (too large)', () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
      
      service.toggle(999999);

      expect(service.favorites()).not.toContain(999999);
      
      consoleSpy.mockRestore();
    });
  });

  describe('add', () => {
    it('should add pokemon to favorites', () => {
      service.add(1);

      expect(service.favorites()).toContain(1);
    });

    it('should not add duplicate pokemon', () => {
      service.add(1);
      service.add(1);

      expect(service.favorites().filter((id) => id === 1).length).toBe(1);
    });

    it('should not add invalid pokemon id', () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
      
      service.add(-5);
      service.add(0);

      expect(service.favorites()).toEqual([]);
      
      consoleSpy.mockRestore();
    });
  });

  describe('remove', () => {
    it('should remove pokemon from favorites', () => {
      service.add(1);
      service.add(2);

      service.remove(1);

      expect(service.favorites()).not.toContain(1);
      expect(service.favorites()).toContain(2);
    });

    it('should do nothing when removing non-existent pokemon', () => {
      service.add(1);

      service.remove(999);

      expect(service.favorites()).toEqual([1]);
    });
  });

  describe('isFavorite', () => {
    it('should return true if pokemon is favorite', () => {
      service.add(1);

      expect(service.isFavorite(1)).toBe(true);
    });

    it('should return false if pokemon is not favorite', () => {
      expect(service.isFavorite(999)).toBe(false);
    });
  });

  describe('clear', () => {
    it('should clear all favorites', () => {
      service.add(1);
      service.add(2);
      service.add(3);

      service.clear();

      expect(service.favorites()).toEqual([]);
    });
  });

  describe('favoritesCount', () => {
    it('should return correct count', () => {
      expect(service.favoritesCount()).toBe(0);

      service.add(1);
      expect(service.favoritesCount()).toBe(1);

      service.add(2);
      expect(service.favoritesCount()).toBe(2);

      service.remove(1);
      expect(service.favoritesCount()).toBe(1);
    });
  });

  describe('persistence', () => {
    it('should save to localStorage when favorites change', () => {
      service.add(1);

      // Effect runs asynchronously, need to trigger change detection
      TestBed.flushEffects();

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'pokemon-favorites',
        expect.any(String)
      );
    });

    it('should handle localStorage setItem error', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      localStorageMock.setItem.mockImplementation(() => {
        throw new Error('Storage full');
      });

      service.add(1);
      TestBed.flushEffects();

      expect(consoleSpy).toHaveBeenCalled();

      consoleSpy.mockRestore();
    });
  });
});
