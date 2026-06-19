import { Component, Input, Output, EventEmitter } from '@angular/core';
import { LucideAngularModule, X, AlertTriangle } from 'lucide-angular';

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [LucideAngularModule],
  template: `
    <div
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      (click)="cancel.emit()"
    >
      <div
        class="bg-white dark:bg-dark-bg-lighter rounded-xl shadow-2xl max-w-md w-full mx-4 p-6"
        (click)="$event.stopPropagation()"
      >
        <div class="flex items-start justify-between mb-4">
          <div class="flex items-center gap-3">
            <lucide-angular
              [img]="AlertTriangleIcon"
              class="w-6 h-6 text-yellow-500"
            ></lucide-angular>
            <h3 class="text-lg font-semibold text-slate-900 dark:text-white">{{ title }}</h3>
          </div>
          <button
            (click)="cancel.emit()"
            class="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <lucide-angular [img]="XIcon" class="w-5 h-5"></lucide-angular>
          </button>
        </div>
        <p class="text-sm text-slate-600 dark:text-slate-400 mb-6">{{ message }}</p>
        <div class="flex justify-end gap-3">
          <button (click)="cancel.emit()" class="btn btn-outline">{{ cancelLabel }}</button>
          <button (click)="confirm.emit()" [class]="confirmClass">{{ confirmLabel }}</button>
        </div>
      </div>
    </div>
  `,
})
export class ConfirmDialogComponent {
  @Input() title = 'Confirm action';
  @Input() message = 'Are you sure?';
  @Input() confirmLabel = 'Confirm';
  @Input() cancelLabel = 'Cancel';
  @Input() confirmVariant: 'primary' | 'danger' = 'primary';
  @Output() confirm = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();

  protected readonly AlertTriangleIcon = AlertTriangle;
  protected readonly XIcon = X;

  get confirmClass(): string {
    return this.confirmVariant === 'danger' ? 'btn btn-danger' : 'btn btn-primary';
  }
}
