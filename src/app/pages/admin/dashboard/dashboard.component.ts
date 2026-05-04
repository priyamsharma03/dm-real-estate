import { CurrencyPipe, DatePipe, DecimalPipe, NgFor, NgIf } from '@angular/common';
import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { finalize, take } from 'rxjs';
import { InquiryService } from '../../../core/services/inquiry.service';
import { PropertyService } from '../../../core/services/property.service';
import { ToastService } from '../../../core/services/toast.service';
import { InquiryRecord } from '../../../models/inquiry.model';
import { Property, PropertyType } from '../../../models/property.model';
import {
  ConfirmDialogComponent,
  ConfirmDialogData
} from '../../../shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-dashboard',
  imports: [
    NgIf,
    NgFor,
    CurrencyPipe,
    DatePipe,
    DecimalPipe,
    ReactiveFormsModule,
    FormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatCheckboxModule,
    MatIconModule,
    MatDialogModule
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {
  private readonly destroyRef = inject(DestroyRef);
  private readonly formBuilder = inject(FormBuilder);

  readonly propertyForm = this.formBuilder.nonNullable.group({
    title: ['', [Validators.required, Validators.minLength(3)]],
    type: ['House' as PropertyType, [Validators.required]],
    price: [0, [Validators.required, Validators.min(1)]],
    width: [0, [Validators.required, Validators.min(1)]],
    length: [0, [Validators.required, Validators.min(1)]],
    location: ['', [Validators.required]],
    shortDescription: ['', [Validators.required, Validators.minLength(12)]],
    description: ['', [Validators.required, Validators.minLength(25)]],
    amenities: ['', [Validators.required, Validators.minLength(3)]],
    featured: [false]
  });

  readonly propertyTypes: PropertyType[] = ['Plot', 'Flat', 'House', 'Bungalow'];

  properties: Property[] = [];
  inquiries: InquiryRecord[] = [];
  previewImages: string[] = [];
  editingPropertyId: string | null = null;
  propertySearch = '';
  propertyTypeFilter: 'All' | PropertyType = 'All';
  isUploadingImages = false;

  constructor(
    private readonly propertyService: PropertyService,
    private readonly inquiryService: InquiryService,
    private readonly toastService: ToastService,
    private readonly dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loadProperties();
    this.loadInquiries();
  }

  get filteredProperties(): Property[] {
    const searchTerm = this.propertySearch.trim().toLowerCase();

    return this.properties.filter((property) => {
      const matchesType =
        this.propertyTypeFilter === 'All' || property.type === this.propertyTypeFilter;
      const matchesSearch =
        !searchTerm ||
        property.title.toLowerCase().includes(searchTerm) ||
        property.location.toLowerCase().includes(searchTerm);

      return matchesType && matchesSearch;
    });
  }

  get featuredCount(): number {
    return this.properties.filter((property) => property.featured).length;
  }

  get averagePrice(): number {
    if (!this.properties.length) {
      return 0;
    }

    const total = this.properties.reduce((sum, property) => sum + (property.price || 0), 0);
    return total / this.properties.length;
  }

  get activeLocationsCount(): number {
    const locations = new Set(
      this.properties
        .map((property) => property.location.trim().toLowerCase())
        .filter(Boolean)
    );

    return locations.size;
  }

  get computedArea(): number {
    const formValue = this.propertyForm.getRawValue();
    const width = Number(formValue.width);
    const length = Number(formValue.length);

    if (!width || !length) {
      return 0;
    }

    return width * length;
  }

  get computedPricePerSqFt(): number {
    const formValue = this.propertyForm.getRawValue();
    const price = Number(formValue.price);
    const area = this.computedArea;

    if (!price || !area) {
      return 0;
    }

    return price / area;
  }

  getPropertyArea(property: Property): number {
    const width = property.width ?? 0;
    const length = property.length ?? 0;

    if (!width || !length) {
      return 0;
    }

    return width * length;
  }

  getPropertyPricePerSqFt(property: Property): number {
    const area = this.getPropertyArea(property);

    if (!property.price || !area) {
      return 0;
    }

    return property.price / area;
  }

  onImagesSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const files = Array.from(input.files ?? []);

    if (!files.length) {
      return;
    }

    this.isUploadingImages = true;

    this.propertyService
      .uploadImages(files)
      .pipe(
        take(1),
        finalize(() => {
          this.isUploadingImages = false;
          input.value = '';
        })
      )
      .subscribe({
        next: (urls) => {
          this.previewImages = [...this.previewImages, ...urls];
        },
        error: () => {
          this.toastService.error('Unable to upload images.');
        }
      });
  }

  removePreview(index: number): void {
    this.previewImages = this.previewImages.filter((_, imageIndex) => imageIndex !== index);
  }

  saveProperty(): void {
    if (this.propertyForm.invalid) {
      this.propertyForm.markAllAsTouched();
      this.toastService.error('Please complete all required fields before saving.');
      return;
    }

    if (!this.previewImages.length) {
      this.toastService.error('Please upload at least one property image.');
      return;
    }

    const formValue = this.propertyForm.getRawValue();
    const payload: Omit<Property, 'id' | 'createdAt'> = {
      title: formValue.title.trim(),
      type: formValue.type,
      price: Number(formValue.price),
      width: Number(formValue.width),
      length: Number(formValue.length),
      location: formValue.location.trim(),
      shortDescription: formValue.shortDescription.trim(),
      description: formValue.description.trim(),
      amenities: this.parseAmenities(formValue.amenities),
      images: [...this.previewImages],
      featured: formValue.featured
    };

    const request$ = this.editingPropertyId
      ? this.propertyService.updateProperty(this.editingPropertyId, payload)
      : this.propertyService.createProperty(payload);

    request$.pipe(take(1)).subscribe({
      next: () => {
        this.toastService.success(
          this.editingPropertyId ? 'Property updated successfully.' : 'Property added successfully.'
        );
        this.resetEditor();
        this.loadProperties();
      },
      error: () => {
        this.toastService.error('Unable to save this property.');
      }
    });
  }

  startEdit(property: Property): void {
    this.editingPropertyId = property.id;
    this.previewImages = [...property.images];

    this.propertyForm.patchValue({
      title: property.title,
      type: property.type,
      price: property.price,
      width: property.width ?? 0,
      length: property.length ?? 0,
      location: property.location,
      shortDescription: property.shortDescription,
      description: property.description,
      amenities: property.amenities.join(', '),
      featured: Boolean(property.featured)
    });

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  confirmDelete(property: Property): void {
    const data: ConfirmDialogData = {
      title: 'Delete Property',
      message: `Are you sure you want to delete "${property.title}"? This action cannot be undone.`,
      confirmText: 'Delete',
      cancelText: 'Keep'
    };

    this.dialog
      .open(ConfirmDialogComponent, { data })
      .afterClosed()
      .pipe(take(1))
      .subscribe((confirmed: boolean) => {
        if (!confirmed) {
          return;
        }

        this.propertyService
          .deleteProperty(property.id)
          .pipe(take(1))
          .subscribe({
            next: () => {
              if (this.editingPropertyId === property.id) {
                this.resetEditor();
              }

              this.toastService.success('Property deleted successfully.');
              this.loadProperties();
            },
            error: () => {
              this.toastService.error('Unable to delete property.');
            }
          });
      });
  }

  private loadProperties(): void {
    this.propertyService
      .getProperties()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (properties) => {
          this.properties = properties;
        },
        error: () => {
          this.toastService.error('Unable to load properties right now.');
        }
      });
  }

  private loadInquiries(): void {
    this.inquiryService
      .getInquiries()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (inquiries) => {
          this.inquiries = inquiries;
        },
        error: () => {
          this.toastService.error('Unable to load inquiries right now.');
        }
      });
  }

  resetEditor(): void {
    this.editingPropertyId = null;
    this.previewImages = [];
    this.propertyForm.reset({
      title: '',
      type: 'House',
      price: 0,
      width: 0,
      length: 0,
      location: '',
      shortDescription: '',
      description: '',
      amenities: '',
      featured: false
    });
  }

  private parseAmenities(rawAmenities: string): string[] {
    return rawAmenities
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);
  }

  
}
