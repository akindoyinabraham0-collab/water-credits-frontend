import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Store } from '@ngrx/store';
import { AsyncPipe } from '@angular/common';
import { WalletConnectComponent } from '../../components/wallet-connect/wallet-connect';
import { WalletService } from '../../../core/services/wallet.service';
import { AuthService } from '../../../core/services/auth.service';
import { AppState } from '../../../core/store/app.state';
import { LucideAngularModule, Droplets, Bell, Sun, Moon, Menu } from 'lucide-angular';
import { toggleSidebar } from '../../../core/store/ui/ui.actions';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, AsyncPipe, WalletConnectComponent, LucideAngularModule],
  template: `
    <header class="h-16 bg-white dark:bg-dark-bg-lighter border-b border-slate-200 dark:border-slate-700 flex items-center justify-between px-4 lg:px-6">
      <div class="flex items-center gap-4">
        <button (click)="toggleSidebar()" class="lg:hidden p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700">
          <lucide-angular [img]="MenuIcon" class="w-5 h-5 text-slate-600 dark:text-slate-400"></lucide-angular>
        </button>
        <a routerLink="/dashboard" class="flex items-center gap-2">
          <div class="w-8 h-8 rounded-lg bg-stellar-blue flex items-center justify-center">
            <lucide-angular [img]="DropletsIcon" class="w-4 h-4 text-white"></lucide-angular>
          </div>
          <span class="font-bold text-lg text-slate-900 dark:text-white hidden sm:inline">Water Credits</span>
        </a>
      </div>

      <div class="flex items-center gap-3">
        <button (click)="toggleDarkMode()" class="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700">
          <lucide-angular [img]="isDarkMode ? SunIcon : MoonIcon" class="w-4 h-4 text-slate-500"></lucide-angular>
        </button>
        <button class="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 relative">
          <lucide-angular [img]="BellIcon" class="w-4 h-4 text-slate-500"></lucide-angular>
          <span class="absolute top-1.5 right-1.5 w-2 h-2 bg-retirement-red rounded-full"></span>
        </button>
        <app-wallet-connect
          [connected]="!!(walletPublicKey$ | async)"
          [address]="(walletPublicKey$ | async) || ''"
          (connect)="connectWallet()"
          (disconnect)="disconnectWallet()"
        />
      </div>
    </header>
  `
})
export class HeaderComponent {
  protected walletPublicKey$;
  protected isDarkMode = true;
  protected readonly MenuIcon = Menu;
  protected readonly DropletsIcon = Droplets;
  protected readonly BellIcon = Bell;
  protected readonly SunIcon = Sun;
  protected readonly MoonIcon = Moon;

  constructor(
    private store: Store<AppState>,
    private walletService: WalletService,
    private authService: AuthService,
  ) {
    this.walletPublicKey$ = this.walletService.publicKey$;
  }

  toggleSidebar(): void {
    this.store.dispatch(toggleSidebar());
  }

  async connectWallet(): Promise<void> {
    const address = await this.walletService.connect();
    if (address) {
      await this.authService.login();
    }
  }

  disconnectWallet(): void {
    this.authService.logout();
  }

  toggleDarkMode(): void {
    this.isDarkMode = !this.isDarkMode;
    document.documentElement.classList.toggle('dark', this.isDarkMode);
  }
}
