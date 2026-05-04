import { CommonModule, NgIf } from '@angular/common';
import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
  inject
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-inquiry-form',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    NgIf
  ],
  templateUrl: './inquiry-form.component.html',
  styleUrl: './inquiry-form.component.scss'
})
export class InquiryFormComponent implements OnInit, OnChanges {
  private readonly formBuilder = inject(FormBuilder);

  @Input() title = 'Request Information';
  @Input() submitLabel = 'Submit';
  @Input() loading = false;
  @Input() includeEmail = true;
  @Input() includePhone = true;
  @Input() includeMessage = true;

  @Output() submitted = new EventEmitter<Record<string, string>>();

  readonly form = this.formBuilder.nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    phone: [''],
    email: [''],
    message: ['']
  });

  ngOnInit(): void {
    this.updateValidators();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['includeEmail'] || changes['includePhone'] || changes['includeMessage']) {
      this.updateValidators();
    }
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const payload: Record<string, string> = {
      name: this.form.controls.name.value.trim()
    };

    if (this.includePhone) {
      payload['phone'] = this.form.controls.phone.value.trim();
    }

    if (this.includeEmail) {
      payload['email'] = this.form.controls.email.value.trim();
    }

    if (this.includeMessage) {
      payload['message'] = this.form.controls.message.value.trim();
    }

    this.submitted.emit(payload);
    this.form.reset();
    this.updateValidators();
  }

  private updateValidators(): void {
    const emailControl = this.form.controls.email;
    const phoneControl = this.form.controls.phone;
    const messageControl = this.form.controls.message;

    emailControl.setValidators(this.includeEmail ? [Validators.required, Validators.email] : []);
    phoneControl.setValidators(
      this.includePhone
        ? [Validators.required, Validators.pattern(/^[0-9+()\-\s]{7,20}$/)]
        : []
    );
    messageControl.setValidators(this.includeMessage ? [Validators.required, Validators.minLength(8)] : []);

    emailControl.updateValueAndValidity({ emitEvent: false });
    phoneControl.updateValueAndValidity({ emitEvent: false });
    messageControl.updateValueAndValidity({ emitEvent: false });
  }
}
