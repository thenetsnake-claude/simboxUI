import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';

export interface Group {
  id: number;
  name: string;
  contacts?: any[];
}

@Injectable({
  providedIn: 'root'
})
export class GroupsService {
  constructor(private api: ApiService) {}

  getGroups(params?: any): Observable<any> {
    return this.api.get('groups', params);
  }

  getGroup(id: number): Observable<Group> {
    return this.api.get<Group>(`groups/${id}`);
  }

  createGroup(data: { name: string }): Observable<Group> {
    return this.api.post<Group>('groups', data);
  }

  updateGroup(id: number, data: { name: string }): Observable<Group> {
    return this.api.put<Group>(`groups/${id}`, data);
  }

  deleteGroup(id: number): Observable<any> {
    return this.api.delete(`groups/${id}`);
  }

  addMembers(id: number, contact_ids: number[]): Observable<Group> {
    return this.api.post<Group>(`groups/${id}/members`, { contact_ids });
  }

  removeMember(groupId: number, contactId: number): Observable<any> {
    return this.api.delete(`groups/${groupId}/members/${contactId}`);
  }

  refreshFromSMSEagle(): Observable<any> {
    return this.api.get('groups/refresh');
  }
}
