import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class TokenService {
  set(token: string): void {
    localStorage.setItem('token', token);
  }

  get(): string | null {
    return localStorage.getItem('token');
  }

  clear(): void {
    localStorage.removeItem('token');
  }
  isValid(): boolean {
    const token = this.get();
    if (!token) return false;

    const parts = token.split('.');
    if (parts.length !== 3) return false;

    const payload = this.decodePayload(parts[1]);
    if (!payload) return false;

    if (!payload.exp) return false;

    const now = Math.floor(Date.now() / 1000);
    if (payload.exp < now) return false;

    return true;
  }
  getRole(): string | null {
    const token = this.get();
    if (!token) return null;

    const parts = token.split('.');
    if (parts.length !== 3) return null;

    const payload = this.decodePayload(parts[1]);
    if (!payload) return null;

    return payload.role ?? null;
  }
  isAdmin(): boolean {
    return this.getRole() === 'ADMIN';
  }

  private decodePayload(base64: string): any | null {
    try {
      const json = atob(base64.replace(/-/g, '+').replace(/_/g, '/'));
      return JSON.parse(json);
    } catch {
      return null;
    }
  }
}
