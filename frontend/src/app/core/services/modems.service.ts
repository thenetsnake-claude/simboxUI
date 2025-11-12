import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';

export interface Modem {
  id: number;
  modem_no: number;
  custom_name?: string;
  displayName: string;
  status?: any;
}

@Injectable({
  providedIn: 'root'
})
export class ModemsService {
  constructor(private api: ApiService) {}

  getModems(): Observable<Modem[]> {
    return this.api.get<Modem[]>('modems');
  }

  getModem(modem_no: number): Observable<Modem> {
    return this.api.get<Modem>(`modems/${modem_no}`);
  }

  updateModem(modem_no: number, data: { custom_name?: string }): Observable<Modem> {
    return this.api.put<Modem>(`modems/${modem_no}`, data);
  }
}
