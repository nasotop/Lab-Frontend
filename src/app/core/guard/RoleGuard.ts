import { Injectable } from "@angular/core";
import { AuthService } from "../../features/auth/services/auth.service";
import { ActivatedRouteSnapshot, CanActivate, Router } from "@angular/router";
import { TokenService } from "../http/token.service";

@Injectable({ providedIn: 'root' })
export class RoleGuard implements CanActivate {
  constructor(private readonly auth: TokenService, private readonly router: Router) {}

  canActivate(route: ActivatedRouteSnapshot): boolean {
    const expected = route.data['roles'] as string[];
    const role = this.auth.getRole();

    if (!expected.includes(role!)) {
      this.router.navigate(['/login']);
      return false;
    }
    return true;
  }
}
