import { Component, inject, OnInit, signal } from '@angular/core';
import { NavigationEnd, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../features/auth/services/auth.service';

@Component({
  selector: 'app-navigation',
  standalone: true,
  imports: [RouterLink],
  template: `
    @if (shouldShowMenu()) {
    <nav class="nav-bar navbar navbar-expand-lg">
      <!-- Botón hamburguesa solo en pantallas pequeñas -->
      <button
        class="navbar-toggler"
        type="button"
        data-bs-toggle="collapse"
        data-bs-target="#mainNav"
      >
        <span class="navbar-toggler-icon"></span>
      </button>

      <!-- Contenedor del menú -->
      <div class="collapse navbar-collapse" id="mainNav">
        <ul class="navbar-nav me-auto mb-2 mb-lg-0">
          <li class="nav-item">
            <a routerLink="/test-results" class="nav-link">Resultados</a>
          </li>
          <li class="nav-item">
            <a routerLink="/order-test" class="nav-link"
              >Exámenes Solicitados</a
            >
          </li>
          <li class="nav-item">
            <a routerLink="/orders" class="nav-link">Órdenes</a>
          </li>
          <li class="nav-item">
            <a routerLink="/test-types" class="nav-link">Tipos de Examen</a>
          </li>
          <li class="nav-item">
            <a routerLink="/patients" class="nav-link">Pacientes</a>
          </li>
          <li class="nav-item">
            <a routerLink="/laboratories" class="nav-link">Laboratorios</a>
          </li>

          @if (isAdmin()) {
          <li class="nav-item">
            <a routerLink="/users" class="nav-link">Usuarios</a>
          </li>
          }
        </ul>

        <button class="logout" (click)="logout()">Cerrar sesión</button>
      </div>
    </nav>
    }
  `,
  // NO SE AGREGA CSS NUEVO — se respeta el original
  styles: [
    `
      .nav-bar {
        display: flex;
        gap: 1.5rem;
        align-items: center;
        padding: 1rem;
        background: rgba(255, 255, 255, 0.05);
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      }

      a,
      .nav-link {
        color: #fff !important;
        font-weight: 600;
        text-decoration: none;
      }

      .logout {
        background: transparent;
        border: 1px solid #ff4d4d;
        color: #ff4d4d;
        padding: 0.4rem 1rem;
        white-space: nowrap;
      }
    `,
  ],
})
export class NavigationComponent implements OnInit {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  loggedIn = signal(false);
  isAdmin = signal(false);

  private readonly hiddenRoutes = ['/login', '/register', '/forgot-password'];
  shouldShowMenu = signal(false);

  ngOnInit() {
    this.auth.validateToken().subscribe({
      next: (u) => {
        this.loggedIn.set(true);
        this.isAdmin.set(u.role === 'ADMIN');
      },
      error: () => {
        this.loggedIn.set(false);
        this.isAdmin.set(false);
      },
    });

    // Detecta cuando termina una navegación
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        const current = event.urlAfterRedirects;
        this.shouldShowMenu.set(
          this.loggedIn() && !this.hiddenRoutes.includes(current)
        );
      }
    });
  }

  logout() {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
