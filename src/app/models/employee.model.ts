
export interface Employee {
  id: number;
  checknumber: string;
  forcenumber: string;
  firstname: string;
  middlename: string | null;
  lastname: string;
  email: string;
  gender: string;

  rank:
    | 'PC'
    | 'CPL'
    | 'SGT'
    | 'SSGT'
    | 'SM'
    | 'A_INSP'
    | 'INSP'
    | 'ASP'
    | 'SP'
    | 'SSP'
    | 'ACP'
    | 'SACP'
    | 'DCP'
    | 'CP'
    | 'IGP';

  administrative: string;
  region: string | null;
  district: string | null;
  station: string | null;
}

export interface EmployeeRequest {
  checknumber: string;
  forcenumber: string;
  firstname: string;
  middlename?: string | null;
  lastname: string;
  email: string;
  gender: string;
  rank: Employee['rank'];

  administrativeId: number;
  regionId?: number | null;
  districtId?: number | null;
  stationId?: number | null;
}
