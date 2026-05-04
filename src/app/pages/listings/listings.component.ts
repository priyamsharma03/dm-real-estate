import { NgFor, NgIf } from '@angular/common';
import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { PropertyService } from '../../core/services/property.service';
import { Property, PropertyType } from '../../models/property.model';
import { LoadingSpinnerComponent } from '../../shared/components/loading-spinner/loading-spinner.component';
import { PropertyCardComponent } from '../../shared/components/property-card/property-card.component';

@Component({
  selector: 'app-listings',
  imports: [
    NgIf,
    NgFor,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    PropertyCardComponent,
    LoadingSpinnerComponent
  ],
  templateUrl: './listings.component.html',
  styleUrl: './listings.component.scss'
})
export class ListingsComponent implements OnInit {
  private readonly destroyRef = inject(DestroyRef);
  private readonly formBuilder = inject(FormBuilder);

  readonly filterForm = this.formBuilder.group({
    maxPrice: this.formBuilder.control<number | null>(null),
    location: this.formBuilder.control<string>(''),
    sort: this.formBuilder.control<'priceAsc' | 'priceDesc' | ''>('')
  });

  readonly propertyTypes: Array<PropertyType | 'All'> = [
    'All',
    'Plot',
    'Flat',
    'House',
    'Bungalow'
  ];
  selectedType: PropertyType | 'All' = 'All';

  isLoading = true;
  filteredProperties: Property[] = [];
  locations: string[] = [];

  constructor(private readonly propertyService: PropertyService) {}

  ngOnInit(): void {
    this.applyFilters();

    this.propertyService
      .getLocations()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((locations) => {
        this.locations = locations;
      });

    this.filterForm.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
      this.applyFilters();
    });
  }

  clearFilters(): void {
    this.filterForm.reset({
      maxPrice: null,
      location: '',
      sort: ''
    });
    this.selectedType = 'All';
    this.applyFilters();
  }

  setType(type: PropertyType | 'All'): void {
    this.selectedType = type;
    this.applyFilters();
  }

  private applyFilters(): void {
    const filters = this.filterForm.getRawValue();

    this.isLoading = true;

    this.propertyService
      .filterProperties({
        maxPrice: filters.maxPrice ?? null,
        location: filters.location ?? '',
        type: this.selectedType,
        sort: filters.sort ?? ''
      })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (properties) => {
          this.filteredProperties = properties;
          this.isLoading = false;
        },
        error: () => {
          this.filteredProperties = [];
          this.isLoading = false;
        }
      });
  }
}
