import { Component } from '@angular/core';
import { finalize, take } from 'rxjs';
import { InquiryPayload, InquiryService } from '../../core/services/inquiry.service';
import { InquiryFormComponent } from '../../shared/components/inquiry-form/inquiry-form.component';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-contact',
  imports: [InquiryFormComponent],
  templateUrl: './contact.component.html',
  styleUrl: './contact.component.scss'
})
export class ContactComponent {
  sending = false;

  constructor(
    private readonly toastService: ToastService,
    private readonly inquiryService: InquiryService
  ) {}

  submitContact(formValue: Record<string, string>): void {
    if (!formValue['name']) {
      return;
    }

    this.sending = true;

    const payload: InquiryPayload = {
      name: formValue['name'],
      email: formValue['email'],
      phone: formValue['phone'],
      message: formValue['message'],
      source: 'contact'
    };

    this.inquiryService
      .submitInquiry(payload)
      .pipe(
        take(1),
        finalize(() => {
          this.sending = false;
        })
      )
      .subscribe({
        next: () => {
          this.toastService.success('Your message has been sent successfully.');
        },
        error: () => {
          this.toastService.error('Unable to send your message right now.');
        }
      });
  }
}
