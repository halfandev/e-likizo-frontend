
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import {
  FamilyMember,
  FamilyMemberRequest
} from '../models/family-member.model';

@Injectable({
  providedIn: 'root'
})
export class FamilyMemberService {

  private readonly apiUrl =
    'http://localhost:8080/api/employees/me/family-members';

  constructor(private http: HttpClient) {}

  // Pata wategemezi wa mfanyakazi aliyeingia.
  getMyFamilyMembers(): Observable<FamilyMember[]> {
    return this.http.get<FamilyMember[]>(this.apiUrl);
  }

  // Sajili mtegemezi mpya.
  addFamilyMember(
    request: FamilyMemberRequest
  ): Observable<FamilyMember> {
    return this.http.post<FamilyMember>(
      this.apiUrl,
      request
    );
  }

  // Pata mtegemezi mmoja.
  getFamilyMember(id: number): Observable<FamilyMember> {
    return this.http.get<FamilyMember>(
      `${this.apiUrl}/${id}`
    );
  }

  // Hariri taarifa za mtegemezi.
  updateFamilyMember(
    id: number,
    request: FamilyMemberRequest
  ): Observable<FamilyMember> {
    return this.http.put<FamilyMember>(
      `${this.apiUrl}/${id}`,
      request
    );
  }

  // Futa mtegemezi.
  deleteFamilyMember(id: number): Observable<void> {
    return this.http.delete<void>(
      `${this.apiUrl}/${id}`
    );
  }
}
