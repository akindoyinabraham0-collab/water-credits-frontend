import { ActionReducerMap } from '@ngrx/store';
import { authReducer, AuthState } from './auth/auth.reducer';
import { walletReducer, WalletState } from './wallet/wallet.reducer';
import { uiReducer, UIState } from './ui/ui.reducer';

export interface AppState {
  auth: AuthState;
  wallet: WalletState;
  ui: UIState;
}

export const reducers: ActionReducerMap<AppState> = {
  auth: authReducer,
  wallet: walletReducer,
  ui: uiReducer,
};
