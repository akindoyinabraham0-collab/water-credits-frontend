import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NgIf } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';
import { WalletService } from '../../../core/services/wallet.service';
import { NotificationService } from '../../../core/services/notification.service';
import { LucideAngularModule, Droplets } from 'lucide-angular';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [RouterLink, FormsModule, NgIf, LucideAngularModule],
  template: `
    <div
      class="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-dark-bg dark:to-dark-bg-lighter p-4"
    >
      <div class="max-w-md w-full">
        <div class="text-center mb-8">
          <div
            class="w-16 h-16 rounded-2xl bg-stellar-blue flex items-center justify-center mx-auto mb-4"
          >
            <lucide-angular [img]="Droplets" class="w-8 h-8 text-white"></lucide-angular>
          </div>
          <h1 class="text-2xl font-bold text-slate-900 dark:text-white">Create Account</h1>
          <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Register with your Stellar wallet
          </p>
        </div>

        <div
          class="bg-white dark:bg-dark-bg-lighter rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 p-8"
        >
          <div class="space-y-4">
            <div>
              <label class="label">Display Name (optional)</label>
              <input type="text" [(ngModel)]="displayName" class="input" placeholder="Your name" />
            </div>
            <div>
              <label class="label">Email (optional)</label>
              <input type="email" [(ngModel)]="email" class="input" placeholder="your@email.com" />
            </div>
            <button
              (click)="handleRegister()"
              [disabled]="loading"
              class="btn btn-primary w-full flex items-center justify-center gap-2 py-3"
            >
              <svg
                *ngIf="loading"
                class="animate-spin w-5 h-5"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  class="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  stroke-width="4"
                ></circle>
                <path
                  class="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                ></path>
              </svg>
              {{ loading ? 'Connecting...' : 'Connect Wallet & Register' }}
            </button>
          </div>

          <div class="mt-6 text-center">
            <p class="text-xs text-slate-400">
              Already have an account?
              <a routerLink="/auth/login" class="text-stellar-blue hover:underline">Sign in</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class RegisterComponent {
  protected displayName = '';
  protected email = '';
  protected loading = false;
  protected readonly Droplets = Droplets;

  constructor(
    private authService: AuthService,
    private walletService: WalletService,
    private notificationService: NotificationService,
    private router: Router,
  ) {}

  async handleRegister(): Promise<void> {
    this.loading = true;
    try {
      const wallet = await this.walletService.connect();
      if (!wallet) {
        this.notificationService.error(
          'Connection failed',
          'Could not connect to Freighter wallet',
        );
        return;
      }
      const { challenge } = await this.authService.requestChallenge(wallet);
      const signature = await this.walletService.signChallenge(challenge);
      if (!signature) {
        this.notificationService.error('Signature failed', 'Could not sign the challenge');
        return;
      }
      const result = await this.authService.register(
        wallet,
        this.email || undefined,
        this.displayName || undefined,
      );
      if (result) {
        this.notificationService.success('Account created', 'Welcome to Water Credits!');
        this.router.navigateByUrl('/dashboard');
      }
    } catch (error: any) {
      this.notificationService.error(
        'Registration failed',
        error.message || 'Could not create account',
      );
    } finally {
      this.loading = false;
    }
  }
}
