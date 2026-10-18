
export interface Administrative {
  id?: number;
  name: string;
  code: string;
  description?: string | null;
  active: boolean;
  createdAt?: string | null;
  createdBy?: string | null;
  updatedAt?: string | null;
  updatedBy?: string | null;
}

export interface Region {
  id?: number;
  name: string;
  code: string;
  description?: string | null;
  active: boolean;
  administrativeId: number;
  administrativeName?: string;
  createdAt?: string | null;
  createdBy?: string | null;
  updatedAt?: string | null;
  updatedBy?: string | null;
}

export interface District {
  id?: number;
  name: string;
  code: string;
  description?: string | null;
  active: boolean;
  regionId: number;
  regionName?: string;
  createdAt?: string | null;
  createdBy?: string | null;
  updatedAt?: string | null;
  updatedBy?: string | null;
}

export interface Station {
  id?: number;
  name: string;
  code: string;
  description?: string | null;
  active: boolean;
  districtId: number;
  districtName?: string;
  createdAt?: string | null;
  createdBy?: string | null;
  updatedAt?: string | null;
  updatedBy?: string | null;
}
