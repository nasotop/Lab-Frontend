import { Injectable } from "@angular/core";
import { CanActivate, Router } from "@angular/router";
import { TokenService } from "../http/token.service";
import { AuthService } from "../../features/auth/services/auth.service";
import { catchError, map, Observable, of } from "rxjs";

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  constructor(private readonly auth: AuthService, private readonly router: Router, private readonly token: TokenService) {}

  canActivate(): Observable<boolean> {
    const raw = this.token.get();
    if (!raw) {
      this.router.navigate(['/login']);
      return of(false);
    }

    return this.auth.validateToken().pipe(
      map(() => true),
      catchError(() => {
        this.token.clear();
        this.router.navigate(['/login']);
        return of(false);
      })
    );
  }
}
