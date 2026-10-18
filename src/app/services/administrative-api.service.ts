
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import {
  Administrative,
  Region,
  District,
  Station
} from '../models/administrative.models';

@Injectable({
  providedIn: 'root'
})
export class AdministrativeApiService {

  private readonly baseUrl = 'http://localhost:8080/api/admin';

  constructor(private http: HttpClient) {}

  // =========================
  // ADMINISTRATIVE
  // =========================

  getAdministratives(): Observable<Administrative[]> {
    return this.http.get<Administrative[]>(
      `${this.baseUrl}/administratives`
    );
  }

  getAdministrative(id: number): Observable<Administrative> {
    return this.http.get<Administrative>(
      `${this.baseUrl}/administratives/${id}`
    );
  }

  createAdministrative(
    data: Administrative
  ): Observable<Administrative> {
    return this.http.post<Administrative>(
      `${this.baseUrl}/administratives`,
      data
    );
  }

  updateAdministrative(
    id: number,
    data: Administrative
  ): Observable<Administrative> {
    return this.http.put<Administrative>(
      `${this.baseUrl}/administratives/${id}`,
      data
    );
  }

  deleteAdministrative(id: number): Observable<void> {
    return this.http.delete<void>(
      `${this.baseUrl}/administratives/${id}`
    );
  }

  // =========================
  // REGION
  // =========================

  getRegions(): Observable<Region[]> {
    return this.http.get<Region[]>(
      `${this.baseUrl}/regions`
    );
  }

  getRegion(id: number): Observable<Region> {
    return this.http.get<Region>(
      `${this.baseUrl}/regions/${id}`
    );
  }

  getRegionsByAdministrative(
    administrativeId: number
  ): Observable<Region[]> {
    return this.http.get<Region[]>(
      `${this.baseUrl}/regions/by-administrative/${administrativeId}`
    );
  }

  createRegion(data: Region): Observable<Region> {
    return this.http.post<Region>(
      `${this.baseUrl}/regions`,
      data
    );
  }

  updateRegion(id: number, data: Region): Observable<Region> {
    return this.http.put<Region>(
      `${this.baseUrl}/regions/${id}`,
      data
    );
  }

  deleteRegion(id: number): Observable<void> {
    return this.http.delete<void>(
      `${this.baseUrl}/regions/${id}`
    );
  }

  // =========================
  // DISTRICT
  // =========================

  getDistricts(): Observable<District[]> {
    return this.http.get<District[]>(
      `${this.baseUrl}/districts`
    );
  }

  getDistrict(id: number): Observable<District> {
    return this.http.get<District>(
      `${this.baseUrl}/districts/${id}`
    );
  }

  getDistrictsByRegion(regionId: number): Observable<District[]> {
    return this.http.get<District[]>(
      `${this.baseUrl}/districts/by-region/${regionId}`
    );
  }

  createDistrict(data: District): Observable<District> {
    return this.http.post<District>(
      `${this.baseUrl}/districts`,
      data
    );
  }

  updateDistrict(id: number, data: District): Observable<District> {
    return this.http.put<District>(
      `${this.baseUrl}/districts/${id}`,
      data
    );
  }

  deleteDistrict(id: number): Observable<void> {
    return this.http.delete<void>(
      `${this.baseUrl}/districts/${id}`
    );
  }

  // =========================
  // STATION
  // =========================

  getStations(): Observable<Station[]> {
    return this.http.get<Station[]>(
      `${this.baseUrl}/stations`
    );
  }

  getStation(id: number): Observable<Station> {
    return this.http.get<Station>(
      `${this.baseUrl}/stations/${id}`
    );
  }

  getStationsByDistrict(districtId: number): Observable<Station[]> {
    return this.http.get<Station[]>(
      `${this.baseUrl}/stations/by-district/${districtId}`
    );
  }

  createStation(data: Station): Observable<Station> {
    return this.http.post<Station>(
      `${this.baseUrl}/stations`,
      data
    );
  }

  updateStation(id: number, data: Station): Observable<Station> {
    return this.http.put<Station>(
      `${this.baseUrl}/stations/${id}`,
      data
    );
  }

  deleteStation(id: number): Observable<void> {
    return this.http.delete<void>(
      `${this.baseUrl}/stations/${id}`
    );
  }
}
