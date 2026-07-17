import { createReducer, on } from '@ngrx/store';
import * as AuthActions from './auth.actions';
import { User } from '../../models/user.model';

export interface AuthState {
  user: User | null;
  token: string | null;
  /**
   * True once the rehydration effect has completed (success or not).
   * Guards must wait until this is true before they resolve, preventing a
   * navigation to /auth/login on a hard refresh when a valid token exists.
   */
  sessionReady: boolean;
  loading: boolean;
  error: string | null;
}

/**
 * No localStorage access here — the reducer must be a pure function.
 * The rehydrateSession$ effect reads storage once on app init and dispatches
 * loginSuccess or sessionReady to populate this state.
 */
export const initialState: AuthState = {
  user: null,
  token: null,
  sessionReady: false,
  loading: false,
  error: null,
};

export const authReducer = createReducer(
  initialState,

  // ── Login ────────────────────────────────────────────────────────────────
  on(AuthActions.login, (state) => ({ ...state, loading: true, error: null })),
  on(AuthActions.loginSuccess, (state, { user, token }) => ({
    ...state,
    user,
    token,
    sessionReady: true,
    loading: false,
    error: null,
  })),
  on(AuthActions.loginFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),

  // ── Register ─────────────────────────────────────────────────────────────
  on(AuthActions.register, (state) => ({ ...state, loading: true, error: null })),
  on(AuthActions.registerSuccess, (state, { user, token }) => ({
    ...state,
    user,
    token,
    sessionReady: true,
    loading: false,
    error: null,
  })),
  on(AuthActions.registerFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),

  // ── Session rehydration ──────────────────────────────────────────────────
  on(AuthActions.sessionReady, (state) => ({ ...state, sessionReady: true })),

  // ── Logout / force logout ────────────────────────────────────────────────
  on(AuthActions.logout, AuthActions.forceLogout, () => ({
    ...initialState,
    sessionReady: true, // session is conclusively over; guards must not re-block
  })),

  // ── Current user ─────────────────────────────────────────────────────────
  on(AuthActions.getCurrentUser, (state) => ({ ...state, loading: true })),
  on(AuthActions.getCurrentUserSuccess, (state, { user }) => ({
    ...state,
    user,
    loading: false,
  })),
  on(AuthActions.getCurrentUserFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),
);
