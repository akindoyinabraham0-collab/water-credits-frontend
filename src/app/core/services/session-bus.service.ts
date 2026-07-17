import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

/**
 * A minimal event bus used exclusively to signal that an HTTP 401 response
 * was received, without creating a circular dependency between ApiService
 * (which needs the token) and the NgRx Store (which ApiService cannot
 * inject directly without a DI cycle via Effects → ApiService).
 *
 * AuthEffects subscribes to forceLogout$ on startup and dispatches
 * AuthActions.forceLogout() when an event arrives.
 */
@Injectable({ providedIn: 'root' })
export class SessionBusService {
  /** Emits once whenever a 401 is received on any outgoing request. */
  readonly forceLogout$ = new Subject<void>();

  /** Called by ApiService's 401 response interceptor. */
  notifyUnauthorized(): void {
    this.forceLogout$.next();
  }
}
