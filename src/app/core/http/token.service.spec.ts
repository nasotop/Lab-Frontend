import { TestBed } from '@angular/core/testing';
import { TokenService } from './token.service';

describe('TokenService', () => {
  let service: TokenService;
  let store: Record<string, string> = {};

  const mockDate = new Date('2024-01-01T12:00:00Z');
  const mockTime = Math.floor(mockDate.getTime() / 1000);

  // Helper para generar tokens simulados
  const createToken = (payload: any) => {
    const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
    const body = btoa(JSON.stringify(payload));
    return `${header}.${body}.signature`;
  };

  beforeEach(() => {
    store = {};

    spyOn(localStorage, 'getItem').and.callFake((key) => store[key] || null);
    spyOn(localStorage, 'setItem').and.callFake((key, value) => {
      store[key] = value + '';
    });
    spyOn(localStorage, 'removeItem').and.callFake((key) => {
      delete store[key];
    });

    TestBed.configureTestingModule({
      providers: [TokenService],
    });
    service = TestBed.inject(TokenService);

    jasmine.clock().install();
    jasmine.clock().mockDate(mockDate);
  });

  afterEach(() => {
    jasmine.clock().uninstall();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should set token in localStorage', () => {
    const token = 'abc-123';
    service.set(token);
    expect(localStorage.setItem).toHaveBeenCalledWith('token', token);
    expect(store['token']).toBe(token);
  });

  it('should get token from localStorage', () => {
    store['token'] = 'abc-123';
    expect(service.get()).toBe('abc-123');
    expect(localStorage.getItem).toHaveBeenCalledWith('token');
  });

  it('should return null if token does not exist', () => {
    expect(service.get()).toBeNull();
  });

  it('should remove token from localStorage', () => {
    store['token'] = 'abc-123';
    service.clear();
    expect(localStorage.removeItem).toHaveBeenCalledWith('token');
    expect(store['token']).toBeUndefined();
  });

  describe('isValid', () => {
    it('should return false if no token exists', () => {
      expect(service.isValid()).toBeFalse();
    });

    it('should return false if token format is invalid (not 3 parts)', () => {
      store['token'] = 'invalid.token';
      expect(service.isValid()).toBeFalse();
    });

    it('should return false if payload cannot be decoded', () => {
      store['token'] = 'header.invalid-base64.signature';
      expect(service.isValid()).toBeFalse();
    });

    it('should return false if payload has no expiration', () => {
      const token = createToken({ sub: 'user' });
      store['token'] = token;
      expect(service.isValid()).toBeFalse();
    });

    it('should return false if token is expired', () => {
      // Expiró hace 1 segundo
      const token = createToken({ exp: mockTime - 1 });
      store['token'] = token;
      expect(service.isValid()).toBeFalse();
    });

    it('should return true if token is valid and not expired', () => {
      // Expira en 1 hora
      const token = createToken({ exp: mockTime + 3600 });
      store['token'] = token;
      expect(service.isValid()).toBeTrue();
    });
  });

  describe('getRole', () => {
    it('should return null if no token exists', () => {
      expect(service.getRole()).toBeNull();
    });

    it('should return null if token format is invalid', () => {
      store['token'] = 'bad.token';
      expect(service.getRole()).toBeNull();
    });

    it('should return null if payload decoding fails', () => {
      store['token'] = 'a.badpayload.b';
      expect(service.getRole()).toBeNull();
    });

    it('should return null if role is missing in payload', () => {
      const token = createToken({ sub: 'user' });
      store['token'] = token;
      expect(service.getRole()).toBeNull();
    });

    it('should return the role from the payload', () => {
      const token = createToken({ role: 'ADMIN' });
      store['token'] = token;
      expect(service.getRole()).toBe('ADMIN');
    });
  });

  describe('isAdmin', () => {
    it('should return true if role is ADMIN', () => {
      const token = createToken({ role: 'ADMIN' });
      store['token'] = token;
      expect(service.isAdmin()).toBeTrue();
    });

    it('should return false if role is USER', () => {
      const token = createToken({ role: 'USER' });
      store['token'] = token;
      expect(service.isAdmin()).toBeFalse();
    });

    it('should return false if no token or role', () => {
      expect(service.isAdmin()).toBeFalse();
    });
  });
});