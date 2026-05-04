import { NgIf, TitleCasePipe } from '@angular/common';
import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { finalize, take } from 'rxjs';
import { ToastService } from '../../core/services/toast.service';
import { UserService } from '../../core/services/user.service';
import { UserProfile } from '../../models/user.model';

@Component({
  selector: 'app-profile',
  imports: [
    NgIf,
    TitleCasePipe,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule
  ],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss'
})
export class ProfileComponent implements OnInit {
  private readonly destroyRef = inject(DestroyRef);
  private readonly formBuilder = inject(FormBuilder);

  readonly profileForm = this.formBuilder.nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    phone: ['', [Validators.required, Validators.pattern(/^[0-9+()\-\s]{7,20}$/)]]
  });

  profile: UserProfile | null = null;
  isEditing = false;
  isSaving = false;

  constructor(
    private readonly userService: UserService,
    private readonly toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.userService
      .getProfile()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((profile) => {
        this.profile = profile;

        if (profile) {
          this.patchForm(profile);
        }
      });
  }

  startEditing(): void {
    if (!this.profile) {
      return;
    }

    this.isEditing = true;
    this.patchForm(this.profile);
  }

  cancelEditing(): void {
    this.isEditing = false;

    if (this.profile) {
      this.patchForm(this.profile);
    }
  }

  saveProfile(): void {
    if (this.profileForm.invalid || !this.profile) {
      this.profileForm.markAllAsTouched();
      return;
    }

    this.isSaving = true;

    this.userService
      .updateProfile(this.profileForm.getRawValue())
      .pipe(
        take(1),
        finalize(() => {
          this.isSaving = false;
        })
      )
      .subscribe({
        next: (updated) => {
          this.profile = updated;
          this.isEditing = false;
          this.toastService.success('Profile updated successfully.');
        },
        error: () => {
          this.toastService.error('Unable to update profile right now.');
        }
      });
  }

  private patchForm(profile: UserProfile): void {
    this.profileForm.patchValue({
      name: profile.name,
      email: profile.email,
      phone: profile.phone
    });
  }
}
