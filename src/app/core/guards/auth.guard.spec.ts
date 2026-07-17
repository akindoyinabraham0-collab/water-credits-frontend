import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree } from '@angular/router';
import { provideRouter } from '@angular/router';
import { provideStore, Store } from '@ngrx/store';
import { firstValueFrom } from 'rxjs';
import { Component } from '@angular/core';
import { AuthGuard } from './auth.guard';
import { reducers, AppState } from '../store/app.state';
import * as AuthActions from '../store/auth/auth.actions';
import { UserRole } from '../models/user.model';

@Component({ standalone: true, template: '' })
class StubComponent {}

const mockUser = {
  id: 'u1',
  wallet: 'GABC123',
  role: UserRole.BUYER,
  isKycVerified: false,
  isActive: true,
  createdAt: '',
  updatedAt: '',
};

describe('AuthGuard', () => {
  let store: Store<AppState>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([
          { path: 'dashboard', component: StubComponent },
          { path: 'auth/login', component: StubComponent },
        ]),
        provideStore(reducers),
      ],
    });

    store = TestBed.inject(Store);
  });

  /**
   * Executes the guard inside the injection context and returns the first
   * emitted value.
   */
  function executeGuard(): Promise<boolean | UrlTree> {
    return TestBed.runInInjectionContext(async () => {
      const result = AuthGuard({} as ActivatedRouteSnapshot, {} as RouterStateSnapshot);
      return firstValueFrom(result as import('rxjs').Observable<boolean | UrlTree>);
    });
  }

  it('redirects to /auth/login when sessionReady but unauthenticated', async () => {
    // Dispatch sessionReady without a user → unauthenticated
    store.dispatch(AuthActions.sessionReady());

    const result = await executeGuard();

    expect(result).toBeInstanceOf(UrlTree);
    expect((result as UrlTree).toString()).toBe('/auth/login');
  });

  it('returns true when sessionReady and authenticated', async () => {
    // loginSuccess sets sessionReady=true in the reducer
    store.dispatch(AuthActions.loginSuccess({ user: mockUser, token: 'tok-abc' }));

    const result = await executeGuard();

    expect(result).toBe(true);
  });

  it('waits for sessionReady before resolving', async () => {
    // sessionReady is false initially; guard should not resolve immediately.
    let resolved = false;

    const guardPromise = executeGuard().then((v) => {
      resolved = true;
      return v;
    });

    // Give the guard one microtask — it must not have resolved yet
    await Promise.resolve();
    expect(resolved).toBe(false);

    // Now mark session ready (without a user → unauthenticated)
    store.dispatch(AuthActions.sessionReady());

    const result = await guardPromise;
    expect(resolved).toBe(true);
    expect(result).toBeInstanceOf(UrlTree);
  });

  it('redirects to /auth/login after logout', async () => {
    store.dispatch(AuthActions.loginSuccess({ user: mockUser, token: 'tok-abc' }));
    store.dispatch(AuthActions.logout());

    const result = await executeGuard();

    expect(result).toBeInstanceOf(UrlTree);
    expect((result as UrlTree).toString()).toBe('/auth/login');
  });
});
