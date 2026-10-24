
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { LeaveSummary } from '../models/leave-summary.model';

@Injectable({
  providedIn: 'root'
})
export class LeaveSummaryService {

  private apiUrl = 'http://localhost:8080/api/leaves/my-summary';

  constructor(private http: HttpClient) {}

  getMyLeaveSummary(): Observable<LeaveSummary> {
    return this.http.get<LeaveSummary>(this.apiUrl);
  }
}
