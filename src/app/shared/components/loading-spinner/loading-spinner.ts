import { Component, Input } from '@angular/core';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-loading-spinner',
  standalone: true,
  imports: [NgIf],
  template: `
    <div
      [class.fixed]="overlay"
      [class.inset-0]="overlay"
      [class.flex]="overlay"
      [class.items-center]="overlay"
      [class.justify-center]="overlay"
      [class.bg-black/30]="overlay"
      [class.z-50]="overlay"
      class="flex items-center justify-center"
    >
      <div class="flex flex-col items-center gap-2">
        <svg
          class="animate-spin"
          [class.w-5]="size === 'sm'"
          [class.h-5]="size === 'sm'"
          [class.w-7]="size === 'md'"
          [class.h-7]="size === 'md'"
          [class.w-10]="size === 'lg'"
          [class.h-10]="size === 'lg'"
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
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
        <span *ngIf="label" class="text-sm text-slate-600 dark:text-slate-400">{{ label }}</span>
      </div>
    </div>
  `,
  styles: [
    `
      :host {
        display: contents;
      }
    `,
  ],
})
export class LoadingSpinnerComponent {
  @Input() size: 'sm' | 'md' | 'lg' = 'md';
  @Input() overlay = false;
  @Input() label = '';
}
