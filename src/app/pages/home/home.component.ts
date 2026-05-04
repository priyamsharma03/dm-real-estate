import { NgFor, NgIf } from '@angular/common';
import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { RouterLink } from '@angular/router';
import { finalize, take } from 'rxjs';
import { InquiryPayload, InquiryService } from '../../core/services/inquiry.service';
import { PropertyService } from '../../core/services/property.service';
import { ToastService } from '../../core/services/toast.service';
import { Property } from '../../models/property.model';
import { InquiryFormComponent } from '../../shared/components/inquiry-form/inquiry-form.component';
import { LoadingSpinnerComponent } from '../../shared/components/loading-spinner/loading-spinner.component';
import { PropertyCardComponent } from '../../shared/components/property-card/property-card.component';

interface MarketMetric {
  label: string;
  value: string;
  trend: string;
}

interface Testimonial {
  quote: string;
  name: string;
  role: string;
}

@Component({
  selector: 'app-home',
  imports: [
    RouterLink,
    MatButtonModule,
    NgIf,
    NgFor,
    PropertyCardComponent,
    InquiryFormComponent,
    LoadingSpinnerComponent
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit {
  private readonly destroyRef = inject(DestroyRef);

  featuredProperties: Property[] = [];
  loadingFeatured = true;
  sendingConsultation = false;

  marketMetrics: MarketMetric[] = [
    { label: 'Avg. Price Growth', value: '11.4%', trend: 'Up this quarter' },
    { label: 'Properties Sold', value: '286', trend: 'Last 90 days' },
    { label: 'Buyer Satisfaction', value: '98%', trend: 'Verified clients' }
  ];

  testimonials: Testimonial[] = [
    {
      quote:
        'DM Real Estate made our move effortless. Their market guidance and negotiations were outstanding.',
      name: 'Charlotte Reed',
      role: 'Home Buyer'
    },
    {
      quote:
        'I invested in two properties through DM. Their due diligence and advisory process are extremely professional.',
      name: 'Henry Collins',
      role: 'Investor'
    },
    {
      quote:
        'From shortlist to keys, the experience felt premium and deeply personalized.',
      name: 'Amelia Brooks',
      role: 'Luxury Client'
    }
  ];

  activeTestimonialIndex = 0;

  constructor(
    private readonly propertyService: PropertyService,
    private readonly toastService: ToastService,
    private readonly inquiryService: InquiryService
  ) {}

  ngOnInit(): void {
    this.propertyService
      .getFeaturedProperties(3)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (properties) => {
          this.featuredProperties = properties;
          this.loadingFeatured = false;
        },
        error: () => {
          this.loadingFeatured = false;
          this.toastService.error('Unable to load featured properties right now.');
        }
      });

    const intervalId = window.setInterval(() => {
      this.activeTestimonialIndex = (this.activeTestimonialIndex + 1) % this.testimonials.length;
    }, 4200);

    this.destroyRef.onDestroy(() => {
      window.clearInterval(intervalId);
    });
  }

  submitConsultation(formValue: Record<string, string>): void {
    if (!formValue['name']) {
      return;
    }

    this.sendingConsultation = true;

    const payload: InquiryPayload = {
      name: formValue['name'],
      email: formValue['email'],
      phone: formValue['phone'],
      message: formValue['message'],
      source: 'home'
    };

    this.inquiryService
      .submitInquiry(payload)
      .pipe(
        take(1),
        finalize(() => {
          this.sendingConsultation = false;
        })
      )
      .subscribe({
        next: () => {
          this.toastService.success(
            'Consultation request received. Our advisor will reach out shortly.'
          );
        },
        error: () => {
          this.toastService.error('Unable to send your request right now.');
        }
      });
  }

  setTestimonial(index: number): void {
    this.activeTestimonialIndex = index;
  }
}
