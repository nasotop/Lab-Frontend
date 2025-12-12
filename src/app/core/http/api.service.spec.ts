import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ApiService } from './api.service';

describe('ApiService', () => {
  let service: ApiService;
  let httpMock: HttpTestingController;
  const baseUrl = 'http://localhost:8082/api';

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ApiService]
    });
    service = TestBed.inject(ApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should perform a GET request with correct URL', () => {
    const endpoint = 'test-endpoint';
    const mockResponse = { data: 'test' };

    service.get(endpoint).subscribe(response => {
      expect(response).toEqual(mockResponse);
    });

    const req = httpMock.expectOne(`${baseUrl}/${endpoint}`);
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);
  });

  it('should perform a GET request with query parameters', () => {
    const endpoint = 'search';
    const params = { query: 'angular', limit: 10 };

    service.get(endpoint, params).subscribe();

    const req = httpMock.expectOne(req => 
      req.url === `${baseUrl}/${endpoint}` && 
      req.params.get('query') === 'angular' &&
      req.params.get('limit') === '10'
    );
    expect(req.request.method).toBe('GET');
    req.flush({});
  });

  it('should perform a GET request with headers', () => {
    const endpoint = 'secured';
    const headers = { Authorization: 'Bearer token' };

    service.get(endpoint, undefined, headers).subscribe();

    const req = httpMock.expectOne(`${baseUrl}/${endpoint}`);
    expect(req.request.headers.get('Authorization')).toBe('Bearer token');
    req.flush({});
  });

  it('should perform a POST request with body and headers', () => {
    const endpoint = 'create';
    const body = { name: 'Item 1' };
    const headers = { 'Content-Type': 'application/json' };

    service.post(endpoint, body, headers).subscribe(response => {
      expect(response).toEqual(body);
    });

    const req = httpMock.expectOne(`${baseUrl}/${endpoint}`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(body);
    expect(req.request.headers.get('Content-Type')).toBe('application/json');
    req.flush(body);
  });

  it('should perform a PUT request with body', () => {
    const endpoint = 'update/1';
    const body = { name: 'Updated Item' };

    service.put(endpoint, body).subscribe(response => {
      expect(response).toEqual(body);
    });

    const req = httpMock.expectOne(`${baseUrl}/${endpoint}`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(body);
    req.flush(body);
  });

  it('should perform a DELETE request', () => {
    const endpoint = 'delete/1';
    const headers = { 'X-Custom-Header': 'value' };

    service.delete(endpoint, headers).subscribe(response => {
      expect(response).toBeNull();
    });

    const req = httpMock.expectOne(`${baseUrl}/${endpoint}`);
    expect(req.request.method).toBe('DELETE');
    expect(req.request.headers.get('X-Custom-Header')).toBe('value');
    req.flush(null);
  });
});