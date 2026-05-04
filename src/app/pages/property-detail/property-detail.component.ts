import { CurrencyPipe, DecimalPipe, NgFor, NgIf } from '@angular/common';
import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { finalize, map, switchMap, take } from 'rxjs';
import { InquiryPayload, InquiryService } from '../../core/services/inquiry.service';
import { PropertyService } from '../../core/services/property.service';
import { ToastService } from '../../core/services/toast.service';
import { Property } from '../../models/property.model';
import { InquiryFormComponent } from '../../shared/components/inquiry-form/inquiry-form.component';
import { LoadingSpinnerComponent } from '../../shared/components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-property-detail',
  imports: [
    NgIf,
    NgFor,
    CurrencyPipe,
    DecimalPipe,
    RouterLink,
    MatButtonModule,
    InquiryFormComponent,
    LoadingSpinnerComponent
  ],
  templateUrl: './property-detail.component.html',
  styleUrl: './property-detail.component.scss'
})
export class PropertyDetailComponent implements OnInit {
  private readonly destroyRef = inject(DestroyRef);

  property?: Property;
  selectedImage = '';
  isLoading = true;
  sendingInquiry = false;

  constructor(
    private readonly route: ActivatedRoute,
    private readonly propertyService: PropertyService,
    private readonly toastService: ToastService,
    private readonly inquiryService: InquiryService
  ) {}

  ngOnInit(): void {
    this.route.paramMap
      .pipe(
        map((params) => params.get('id') ?? ''),
        switchMap((id) => this.propertyService.getPropertyById(id)),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (property) => {
          this.property = property;
          this.selectedImage = property?.images[0] ?? '';
          this.isLoading = false;
        },
        error: () => {
          this.isLoading = false;
          this.toastService.error('Unable to load property details.');
        }
      });
  }

  selectImage(image: string): void {
    this.selectedImage = image;
  }

  getArea(property: Property): number {
    const width = property.width ?? 0;
    const length = property.length ?? 0;

    if (!width || !length) {
      return 0;
    }

    return width * length;
  }

  getPricePerSqFt(property: Property): number {
    const area = this.getArea(property);

    if (!property.price || !area) {
      return 0;
    }

    return property.price / area;
  }

  submitInquiry(formValue: Record<string, string>): void {
    if (!formValue['name']) {
      return;
    }

    this.sendingInquiry = true;

    const payload: InquiryPayload = {
      name: formValue['name'],
      email: formValue['email'],
      phone: formValue['phone'],
      message: formValue['message'],
      source: 'property',
      propertyId: this.property?.id,
      propertyTitle: this.property?.title
    };

    this.inquiryService
      .submitInquiry(payload)
      .pipe(
        take(1),
        finalize(() => {
          this.sendingInquiry = false;
        })
      )
      .subscribe({
        next: () => {
          this.toastService.success('Inquiry submitted. A property advisor will contact you soon.');
        },
        error: () => {
          this.toastService.error('Unable to send your inquiry right now.');
        }
      });
  }
}
