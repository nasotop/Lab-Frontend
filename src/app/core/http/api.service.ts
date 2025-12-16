import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, timeout } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private readonly baseUrl = 'http://localhost:8082/api';

  constructor(private readonly http: HttpClient) {}
  get<T>(
    endpoint: string,
    params?: Record<string, string | number>,
    headers?: Record<string, string>
  ): Observable<T> {
    return this.http
      .get<T>(this.resolve(endpoint), {
        params: this.buildParams(params),
        headers: this.buildHeaders(headers),
      })
      .pipe(timeout(10000));
  }

  post<T>(
    endpoint: string,
    body: unknown,
    headers?: Record<string, string>
  ): Observable<T> {
    return this.http
      .post<T>(this.resolve(endpoint), body, {
        headers: this.buildHeaders(headers),
      })
      .pipe(timeout(10000));
  }

  put<T>(
    endpoint: string,
    body: unknown,
    headers?: Record<string, string>
  ): Observable<T> {
    return this.http
      .put<T>(this.resolve(endpoint), body, {
        headers: this.buildHeaders(headers),
      })
      .pipe(timeout(10000));
  }

  delete<T>(
    endpoint: string,
    headers?: Record<string, string>
  ): Observable<T> {
    return this.http
      .delete<T>(this.resolve(endpoint), {
        headers: this.buildHeaders(headers),
      })
      .pipe(timeout(10000));
  }

  private  resolve(endpoint: string): string {
    return `${this.baseUrl}/${endpoint}`;
  }

  private  buildHeaders(headers?: Record<string, string>): HttpHeaders {
    let result = new HttpHeaders();
    if (!headers) return result;

    Object.entries(headers).forEach(([key, value]) => {
      result = result.set(key, value);
    });

    return result;
  }

  private  buildParams(params?: Record<string, string | number>): HttpParams {
    let result = new HttpParams();
    if (!params) return result;

    Object.entries(params).forEach(([key, value]) => {
      result = result.set(key, value);
    });

    return result;
  }
}
