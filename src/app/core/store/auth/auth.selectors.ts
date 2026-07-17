import { createFeatureSelector, createSelector } from '@ngrx/store';
import { AuthState } from './auth.reducer';

export const selectAuthState = createFeatureSelector<AuthState>('auth');

export const selectCurrentUser = createSelector(selectAuthState, (state) => state.user);

export const selectAuthToken = createSelector(selectAuthState, (state) => state.token);

export const selectIsAuthenticated = createSelector(
  selectAuthState,
  (state) => !!state.token && !!state.user,
);

export const selectSessionReady = createSelector(selectAuthState, (state) => state.sessionReady);

export const selectAuthLoading = createSelector(selectAuthState, (state) => state.loading);

export const selectAuthError = createSelector(selectAuthState, (state) => state.error);

export const selectCurrentUserRole = createSelector(
  selectCurrentUser,
  (user) => user?.role ?? null,
);
