export interface InquiryRecord {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  message?: string;
  propertyId?: string;
  propertyTitle?: string;
  source?: string;
  createdAt: string;
}
