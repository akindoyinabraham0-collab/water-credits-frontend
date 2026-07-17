import { inject } from '@angular/core';
import { CanActivateFn, Router, UrlTree } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { filter, map, switchMap, take } from 'rxjs/operators';
import { selectIsAuthenticated, selectSessionReady } from '../store/auth/auth.selectors';
import { AppState } from '../store/app.state';

/**
 * Functional route guard that protects all authenticated routes.
 *
 * Behaviour:
 *   1. Waits until the session-rehydration effect has completed
 *      (selectSessionReady becomes true), preventing a false redirect to
 *      /auth/login on a hard refresh when a valid token is in localStorage.
 *   2. Reads auth.token + auth.user from the NgRx store — the single
 *      source of truth for session state.
 *   3. Returns a UrlTree redirect to /auth/login for unauthenticated users.
 */
export const AuthGuard: CanActivateFn = (): Observable<boolean | UrlTree> => {
  const store = inject(Store<AppState>);
  const router = inject(Router);

  return store.select(selectSessionReady).pipe(
    // Do not proceed until rehydration has finished.
    filter((ready) => ready),
    take(1),
    switchMap(() =>
      store.select(selectIsAuthenticated).pipe(
        take(1),
        map((isAuthenticated) => {
          if (isAuthenticated) {
            return true;
          }
          return router.parseUrl('/auth/login');
        }),
      ),
    ),
  );
};
