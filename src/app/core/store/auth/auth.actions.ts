import { createAction, props } from '@ngrx/store';
import { User } from '../../models/user.model';

// ── Login ─────────────────────────────────────────────────────────────────────
export const login = createAction('[Auth] Login');
export const loginSuccess = createAction(
  '[Auth] Login Success',
  props<{ user: User; token: string }>(),
);
export const loginFailure = createAction('[Auth] Login Failure', props<{ error: string }>());

// ── Register ──────────────────────────────────────────────────────────────────
export const register = createAction(
  '[Auth] Register',
  props<{ email?: string; displayName?: string }>(),
);
export const registerSuccess = createAction(
  '[Auth] Register Success',
  props<{ user: User; token: string }>(),
);
export const registerFailure = createAction('[Auth] Register Failure', props<{ error: string }>());

// ── Session rehydration (on app init) ─────────────────────────────────────────
/**
 * Dispatched once by the rehydrateSession$ effect on app start.
 * The effect reads localStorage, then either dispatches loginSuccess (token
 * found + /users/me succeeded) or sessionReady (no token / fetch failed).
 * Guards wait on selectSessionReady before resolving.
 */
export const rehydrateSession = createAction('[Auth] Rehydrate Session');

/**
 * Marks the session check as complete regardless of outcome.
 * Always dispatched at the end of the rehydration path, even when no token
 * is present, so that guards do not wait indefinitely.
 */
export const sessionReady = createAction('[Auth] Session Ready');

// ── Logout ────────────────────────────────────────────────────────────────────
export const logout = createAction('[Auth] Logout');

/**
 * Dispatched by the 401 event bus (ApiService → SessionBusService → effects).
 * Triggers the same logout$ side-effect chain without a circular DI dependency.
 */
export const forceLogout = createAction('[Auth] Force Logout');

// ── Current user ──────────────────────────────────────────────────────────────
export const getCurrentUser = createAction('[Auth] Get Current User');
export const getCurrentUserSuccess = createAction(
  '[Auth] Get Current User Success',
  props<{ user: User }>(),
);
export const getCurrentUserFailure = createAction(
  '[Auth] Get Current User Failure',
  props<{ error: string }>(),
);
