import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';

export interface Message {
  id: number;
  phone_number: string;
  text?: string;
  folder: string;
  status?: string;
  is_read: boolean;
  sending_date?: string;
  receive_date?: string;
}

export interface SendSmsDto {
  to?: string[];
  contacts?: number[];
  groups?: number[];
  text: string;
  date?: string;
  encoding?: 'standard' | 'unicode';
  validity?: '5m' | '10m' | '30m' | '1h';
  modem_no?: number;
}

@Injectable({
  providedIn: 'root'
})
export class MessagesService {
  constructor(private api: ApiService) {}

  getMessages(params?: any): Observable<any> {
    return this.api.get('messages', params);
  }

  getConversations(page: number = 1, limit: number = 20): Observable<any> {
    return this.api.get('messages/conversations', { page, limit });
  }

  getMessage(id: number): Observable<Message> {
    return this.api.get<Message>(`messages/${id}`);
  }

  sendSms(data: SendSmsDto): Observable<any> {
    return this.api.post('messages/sms', data);
  }

  sendBinarySms(data: any): Observable<any> {
    return this.api.post('messages/binary', data);
  }

  markAsRead(id: number): Observable<Message> {
    return this.api.patch<Message>(`messages/${id}/read`, {});
  }
}
