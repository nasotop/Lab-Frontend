import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NavigationComponent } from './navigation.component';
import { AuthService } from '../../features/auth/services/auth.service';
import { NavigationEnd, Router, Event, RouterLink } from '@angular/router';
import { of, Subject, throwError } from 'rxjs';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'a[routerLink]',
  standalone: true,
  template: '<ng-content></ng-content>'
})
class MockRouterLink {
  @Input() routerLink: any;
}

class MockAuthService {
  validateToken = jasmine.createSpy('validateToken').and.returnValue(of({ role: 'ADMIN' }));
  logout = jasmine.createSpy('logout');
}

describe('NavigationComponent', () => {
  let component: NavigationComponent;
  let fixture: ComponentFixture<NavigationComponent>;
  let authService: MockAuthService;
  let routerEvents$: Subject<Event>;
  let routerMock: any;

  beforeEach(async () => {
    routerEvents$ = new Subject<Event>();
    routerMock = {
      navigate: jasmine.createSpy('navigate'),
      events: routerEvents$.asObservable()
    };

    await TestBed.configureTestingModule({
      imports: [NavigationComponent],
      providers: [
        { provide: AuthService, useClass: MockAuthService },
        { provide: Router, useValue: routerMock }
      ]
    })
    .overrideComponent(NavigationComponent, {
      remove: { imports: [RouterLink] },
      add: { imports: [MockRouterLink] }
    })
    .compileComponents();

    fixture = TestBed.createComponent(NavigationComponent);
    component = fixture.componentInstance;
    authService = TestBed.inject(AuthService) as unknown as MockAuthService;
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should set loggedIn and isAdmin to true when token is valid and role is ADMIN', () => {
    authService.validateToken.and.returnValue(of({ role: 'ADMIN' }));
    fixture.detectChanges();

    expect(component.loggedIn()).toBeTrue();
    expect(component.isAdmin()).toBeTrue();
  });

  it('should set isAdmin to false when role is not ADMIN', () => {
    authService.validateToken.and.returnValue(of({ role: 'USER' }));
    fixture.detectChanges();

    expect(component.loggedIn()).toBeTrue();
    expect(component.isAdmin()).toBeFalse();
  });

  it('should set loggedIn and isAdmin to false on validation error', () => {
    authService.validateToken.and.returnValue(throwError(() => new Error('Error')));
    fixture.detectChanges();

    expect(component.loggedIn()).toBeFalse();
    expect(component.isAdmin()).toBeFalse();
  });

  it('should show menu when logged in and route is not hidden', () => {
    authService.validateToken.and.returnValue(of({ role: 'USER' }));
    fixture.detectChanges();

    const event = new NavigationEnd(1, '/test-results', '/test-results');
    routerEvents$.next(event);
    fixture.detectChanges();

    expect(component.shouldShowMenu()).toBeTrue();
    const nav = fixture.nativeElement.querySelector('nav');
    expect(nav).toBeTruthy();
  });

  it('should hide menu when route is hidden (e.g., login)', () => {
    authService.validateToken.and.returnValue(of({ role: 'USER' }));
    fixture.detectChanges();

    const event = new NavigationEnd(1, '/login', '/login');
    routerEvents$.next(event);
    fixture.detectChanges();

    expect(component.shouldShowMenu()).toBeFalse();
    const nav = fixture.nativeElement.querySelector('nav');
    expect(nav).toBeFalsy();
  });

  it('should hide menu when not logged in', () => {
    authService.validateToken.and.returnValue(throwError(() => new Error()));
    fixture.detectChanges();

    const event = new NavigationEnd(1, '/test-results', '/test-results');
    routerEvents$.next(event);
    fixture.detectChanges();

    expect(component.loggedIn()).toBeFalse();
    expect(component.shouldShowMenu()).toBeFalse();
  });

  it('should render Admin link only if isAdmin is true', () => {
    authService.validateToken.and.returnValue(of({ role: 'ADMIN' }));
    fixture.detectChanges();

    routerEvents$.next(new NavigationEnd(1, '/home', '/home'));
    fixture.detectChanges();

    const links = fixture.nativeElement.querySelectorAll('a');
    let hasUserLink = false;
    links.forEach((link: HTMLElement) => {
      if (link.getAttribute('ng-reflect-router-link') === '/users') {
        hasUserLink = true;
      }
    });
    expect(hasUserLink).toBeTrue();
  });

  it('should not render Admin link if isAdmin is false', () => {
    authService.validateToken.and.returnValue(of({ role: 'USER' }));
    fixture.detectChanges();

    routerEvents$.next(new NavigationEnd(1, '/home', '/home'));
    fixture.detectChanges();

    const links = fixture.nativeElement.querySelectorAll('a');
    let hasUserLink = false;
    links.forEach((link: HTMLElement) => {
      if (link.getAttribute('ng-reflect-router-link') === '/users') {
        hasUserLink = true;
      }
    });
    expect(hasUserLink).toBeFalse();
  });

  it('logout should call auth service and navigate to login', () => {
    authService.validateToken.and.returnValue(of({ role: 'USER' }));
    fixture.detectChanges();

    routerEvents$.next(new NavigationEnd(1, '/home', '/home'));
    fixture.detectChanges();

    component.logout();

    expect(authService.logout).toHaveBeenCalled();
    expect(routerMock.navigate).toHaveBeenCalledWith(['/login']);
  });
});