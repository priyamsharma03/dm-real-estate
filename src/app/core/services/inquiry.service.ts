import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { InquiryRecord } from '../../models/inquiry.model';

import { environment } from '../../../environment/environment';
const API_BASE_URL = environment.apiUrl;
export interface InquiryPayload {
  name: string;
  email?: string;
  phone?: string;
  message?: string;
  propertyId?: string;
  propertyTitle?: string;
  source?: string;
}

@Injectable({
  providedIn: 'root'
})
export class InquiryService {
  constructor(private readonly http: HttpClient) {}

  submitInquiry(payload: InquiryPayload): Observable<void> {
    return this.http.post<void>(`${API_BASE_URL}/inquiries`, payload);
  }

  getInquiries(): Observable<InquiryRecord[]> {
    return this.http.get<InquiryRecord[]>(`${API_BASE_URL}/inquiries`);
  }
}
