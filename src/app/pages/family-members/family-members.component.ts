
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { FamilyMemberService } from 'src/app/services/family-member.service';

import {
  FamilyMember,
  FamilyMemberRequest,
  FamilyRelationship
} from 'src/app/models/family-member.model';

@Component({
  selector: 'app-family-members',
  templateUrl: './family-members.component.html',
  styleUrls: ['./family-members.component.css']
})
export class FamilyMembersComponent implements OnInit {

  familyMembers: FamilyMember[] = [];

  memberForm!: FormGroup;

  relationships: FamilyRelationship[] = [
    'SPOUSE',
    'CHILD',
    'PARENT',
    'SIBLING',
    'OTHER'
  ];

  loading = false;
  saving = false;
  deletingId: number | null = null;

  modalOpen = false;
  editingId: number | null = null;

  successMessage = '';
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private familyMemberService: FamilyMemberService
  ) {}

  ngOnInit(): void {
    this.memberForm = this.fb.group({
      fullName: ['', [
        Validators.required,
        Validators.maxLength(200)
      ]],
      relationship: ['', Validators.required],
      dateOfBirth: [''],
      notes: ['', Validators.maxLength(500)]
    });

    this.loadFamilyMembers();
  }

  // Pakia wategemezi wa mfanyakazi aliyeingia.
  loadFamilyMembers(): void {
    this.loading = true;
    this.errorMessage = '';

    this.familyMemberService.getMyFamilyMembers().subscribe({
      next: (members) => {
        this.familyMembers = members || [];
        this.loading = false;
      },

      error: (error) => {
        console.error('Failed to load family members:', error);

        this.errorMessage =
          error.status === 401
            ? 'Session imeisha. Tafadhali ingia tena.'
            : error.error?.message ||
              'Imeshindwa kupakia wategemezi. Tafadhali jaribu tena.';

        this.loading = false;
      }
    });
  }

  // Fungua popup kwa ajili ya kuongeza mtegemezi.
  openAddModal(): void {
    this.successMessage = '';
    this.errorMessage = '';
    this.editingId = null;

    this.memberForm.reset({
      fullName: '',
      relationship: '',
      dateOfBirth: '',
      notes: ''
    });

    this.modalOpen = true;
  }

  // Fungua popup yenye taarifa za mtegemezi kwa ajili ya kuhariri.
  editFamilyMember(member: FamilyMember): void {
    this.successMessage = '';
    this.errorMessage = '';
    this.editingId = member.id;

    this.memberForm.reset({
      fullName: member.fullName,
      relationship: member.relationship,
      dateOfBirth: member.dateOfBirth || '',
      notes: member.notes || ''
    });

    this.modalOpen = true;
  }

  // Funga popup.
  closeModal(): void {
    if (this.saving) {
      return;
    }

    this.modalOpen = false;
    this.editingId = null;
    this.errorMessage = '';

    this.memberForm.reset({
      fullName: '',
      relationship: '',
      dateOfBirth: '',
      notes: ''
    });
  }

  // Hifadhi mtegemezi mpya au sasisha taarifa zilizopo.
  saveFamilyMember(): void {
    this.successMessage = '';
    this.errorMessage = '';

    if (this.memberForm.invalid) {
      this.memberForm.markAllAsTouched();
      return;
    }

    const formValue = this.memberForm.getRawValue();

    const request: FamilyMemberRequest = {
      fullName: String(formValue.fullName || '').trim(),
      relationship: formValue.relationship,
      dateOfBirth: formValue.dateOfBirth || null,
      notes: String(formValue.notes || '').trim() || null
    };

    if (!request.fullName) {
      this.memberForm.get('fullName')?.markAsTouched();
      this.errorMessage = 'Tafadhali weka jina kamili.';
      return;
    }

    const isEditing = this.editingId !== null;
    this.saving = true;

    const operation = isEditing
      ? this.familyMemberService.updateFamilyMember(
          this.editingId!,
          request
        )
      : this.familyMemberService.addFamilyMember(request);

    operation.subscribe({
      next: () => {
        this.successMessage = isEditing
          ? 'Taarifa za mtegemezi zimebadilishwa kikamilifu.'
          : 'Mtegemezi amesajiliwa kikamilifu.';

        this.saving = false;
        this.modalOpen = false;
        this.editingId = null;

        this.memberForm.reset({
          fullName: '',
          relationship: '',
          dateOfBirth: '',
          notes: ''
        });

        this.loadFamilyMembers();
      },

      error: (error) => {
        console.error('Failed to save family member:', error);

        this.errorMessage =
          error.error?.message ||
          'Imeshindwa kuhifadhi taarifa za mtegemezi. Tafadhali jaribu tena.';

        this.saving = false;
      }
    });
  }

  // Futa mtegemezi.
  deleteFamilyMember(member: FamilyMember): void {
    const confirmed = window.confirm(
      `Una uhakika unataka kumfuta ${member.fullName}?`
    );

    if (!confirmed) {
      return;
    }

    this.successMessage = '';
    this.errorMessage = '';
    this.deletingId = member.id;

    this.familyMemberService.deleteFamilyMember(member.id).subscribe({
      next: () => {
        this.successMessage =
          `${member.fullName} amefutwa kikamilifu.`;

        this.deletingId = null;
        this.loadFamilyMembers();
      },

      error: (error) => {
        console.error('Failed to delete family member:', error);

        this.errorMessage =
          error.error?.message ||
          'Imeshindwa kufuta mtegemezi. Tafadhali jaribu tena.';

        this.deletingId = null;
      }
    });
  }

  // Tafsiri aina ya uhusiano kwa Kiswahili.
  relationshipLabel(relationship: string): string {
    const labels: Record<string, string> = {
      SPOUSE: 'Mwenzi',
      CHILD: 'Mtoto',
      PARENT: 'Mzazi',
      SIBLING: 'Ndugu',
      OTHER: 'Mwingine'
    };

    return labels[relationship] || relationship;
  }

  // Namba ya mtegemezi ndani ya jedwali.
  trackByMemberId(
    index: number,
    member: FamilyMember
  ): number {
    return member.id;
  }
}
