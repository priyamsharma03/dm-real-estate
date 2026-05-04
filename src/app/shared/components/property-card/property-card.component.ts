import { CurrencyPipe, NgIf } from '@angular/common';
import { Component, Input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { Property } from '../../../models/property.model';

@Component({
  selector: 'app-property-card',
  imports: [MatCardModule, MatButtonModule, MatIconModule, CurrencyPipe, RouterLink, NgIf],
  templateUrl: './property-card.component.html',
  styleUrl: './property-card.component.scss'
})
export class PropertyCardComponent {
  @Input({ required: true }) property!: Property;
}
