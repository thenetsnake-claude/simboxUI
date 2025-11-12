import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';

export interface Contact {
  id: number;
  name: string;
  phone_number: string;
  groups?: any[];
}

@Injectable({
  providedIn: 'root'
})
export class ContactsService {
  constructor(private api: ApiService) {}

  getContacts(params?: any): Observable<any> {
    return this.api.get('contacts', params);
  }

  getContact(id: number): Observable<Contact> {
    return this.api.get<Contact>(`contacts/${id}`);
  }

  createContact(data: { name: string; phone_number: string }): Observable<Contact> {
    return this.api.post<Contact>('contacts', data);
  }

  updateContact(id: number, data: { name?: string; phone_number?: string }): Observable<Contact> {
    return this.api.put<Contact>(`contacts/${id}`, data);
  }

  deleteContact(id: number): Observable<any> {
    return this.api.delete(`contacts/${id}`);
  }

  refreshFromSMSEagle(): Observable<any> {
    return this.api.get('contacts/refresh');
  }
}
