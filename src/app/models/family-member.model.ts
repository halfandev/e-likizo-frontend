
export type FamilyRelationship =
  | 'SPOUSE'
  | 'CHILD'
  | 'PARENT'
  | 'SIBLING'
  | 'OTHER';

export interface FamilyMember {
  id: number;
  employeeId: number;
  fullName: string;
  relationship: FamilyRelationship;
  dateOfBirth: string | null;
  notes: string | null;
}

export interface FamilyMemberRequest {
  fullName: string;
  relationship: FamilyRelationship;
  dateOfBirth: string | null;
  notes: string | null;
}
