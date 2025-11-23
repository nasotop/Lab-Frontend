import { Injectable } from "@angular/core";
import { CanActivate, Router } from "@angular/router";
import { TokenService } from "../http/token.service";
import { AuthService } from "../../features/auth/services/auth.service";
import { catchError, map, Observable, of } from "rxjs";

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  constructor(private auth: AuthService, private router: Router, private token: TokenService) {}

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
