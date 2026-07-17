import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { User } from '../models/user.model';

/**
 * Thin HTTP-only service for authentication.
 *
 * All session state (token, user, isAuthenticated) now lives exclusively in
 * the NgRx AuthState.  This service contains only the API calls required by
 * AuthEffects — no BehaviorSubject, no localStorage access.
 *
 * Guards and components must select from the store; they must NOT inject this
 * service to check auth state.
 */
@Injectable({ providedIn: 'root' })
export class AuthService {
  constructor(private apiService: ApiService) {}

  async requestChallenge(wallet: string): Promise<{ challenge: string }> {
    return this.apiService.post<{ challenge: string }>('/auth/challenge', { wallet });
  }

  async loginWithCreds(
    wallet: string,
    signature: string,
    challenge: string,
  ): Promise<{ token: string; user: User }> {
    return this.apiService.post<{ token: string; user: User }>('/auth/login', {
      wallet,
      signature,
      challenge,
    });
  }

  async register(
    wallet: string,
    email?: string,
    displayName?: string,
  ): Promise<{ token: string; user: User }> {
    return this.apiService.post<{ token: string; user: User }>('/auth/register', {
      wallet,
      email,
      displayName,
    });
  }

  async fetchCurrentUser(): Promise<User> {
    return this.apiService.get<User>('/users/me');
  }
}
