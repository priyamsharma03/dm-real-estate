import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

type ToastVariant = 'success' | 'info' | 'error';

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  constructor(private readonly snackBar: MatSnackBar) {}

  show(message: string, variant: ToastVariant = 'info'): void {
    this.snackBar.open(message, 'Close', {
      duration: 3500,
      horizontalPosition: 'right',
      verticalPosition: 'top',
      panelClass: [`toast-${variant}`]
    });
  }

  success(message: string): void {
    this.show(message, 'success');
  }

  info(message: string): void {
    this.show(message, 'info');
  }

  error(message: string): void {
    this.show(message, 'error');
  }
}
