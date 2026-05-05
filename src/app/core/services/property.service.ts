import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Property, PropertyFilters } from '../../models/property.model';
import { environment } from '../../../environment/environment';
  
const API_BASE_URL = environment.apiUrl;

@Injectable({
  providedIn: 'root'
})
export class PropertyService {
  constructor(private readonly http: HttpClient) {}

  getProperties(): Observable<Property[]> {
    return this.http.get<Property[]>(`${API_BASE_URL}/properties`);
  }

  getFeaturedProperties(limit = 3): Observable<Property[]> {
    const params = new HttpParams()
      .set('featured', 'true')
      .set('limit', String(limit));

    return this.http.get<Property[]>(`${API_BASE_URL}/properties`, { params });
  }

  getPropertyById(id: string): Observable<Property> {
    return this.http.get<Property>(`${API_BASE_URL}/properties/${id}`);
  }

  getLocations(): Observable<string[]> {
    return this.http.get<string[]>(`${API_BASE_URL}/locations`);
  }

  filterProperties(filters: PropertyFilters): Observable<Property[]> {
    let params = new HttpParams();

    if (filters.maxPrice) {
      params = params.set('max_price', String(filters.maxPrice));
    }

    if (filters.location) {
      params = params.set('location', filters.location);
    }

    if (filters.type && filters.type !== 'All') {
      params = params.set('type', filters.type);
    }

    if (filters.sort) {
      params = params.set('sort', filters.sort);
    }

    return this.http.get<Property[]>(`${API_BASE_URL}/properties`, { params });
  }

  createProperty(payload: Omit<Property, 'id' | 'createdAt'>): Observable<Property> {
    return this.http.post<Property>(`${API_BASE_URL}/properties`, payload);
  }

  updateProperty(id: string, changes: Partial<Omit<Property, 'id'>>): Observable<Property> {
    return this.http.put<Property>(`${API_BASE_URL}/properties/${id}`, changes);
  }

  uploadImages(files: File[]): Observable<string[]> {
    const formData = new FormData();
    files.forEach((file) => formData.append('files', file));

    return this.http.post<string[]>(`${API_BASE_URL}/uploads/images`, formData);
  }

  deleteProperty(id: string): Observable<void> {
    return this.http.delete<void>(`${API_BASE_URL}/properties/${id}`);
  }
}
