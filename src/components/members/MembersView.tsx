import type {
  FormEvent,
} from "react";

import AddMemberForm from "@/components/members/AddMemberForm";
import MembersDirectory from "@/components/members/MembersDirectory";
import EditMemberModal from "@/components/members/EditMemberModal";

import type {
  Member,
  Organization,
} from "@/types/member";
import { canChangeMemberStatus } from "@/utils/permissions";

type MembersViewProps = {
  members: Member[];
  filteredMembers: Member[];

  memberSearch: string;
  fullName: string;
  familyName: string;
  organization: Organization;
  recentConvert: boolean;

  loadingMembers: boolean;
  savingMember: boolean;
  canManageMembers: boolean;
  canChangeMemberStatus: boolean;

  editingMember: Member | null;
  savingMemberEdit: boolean;

  onSearchChange: (value: string) => void;
  onFullNameChange: (value: string) => void;
  onFamilyNameChange: (value: string) => void;

  onOrganizationChange: (
    value: Organization,
  ) => void;

  onRecentConvertChange: (
    value: boolean,
  ) => void;

  onAddMember: (
    event: FormEvent<HTMLFormElement>,
  ) => void;

  onViewMember: (member: Member) => void;

  onStartEditMember: (
    member: Member,
  ) => void;

  onCancelEditMember: () => void;

  onSaveMemberEdit: (values: {
    fullName: string;
    familyName: string;
    organization: Organization;
    recentConvert: boolean;
  }) => void;

  onDeactivateMember: (
    member: Member,
  ) => void;
};

export default function MembersView({
  members,
  filteredMembers,
  memberSearch,
  fullName,
  familyName,
  organization,
  recentConvert,
  loadingMembers,
  savingMember,
  canManageMembers,
  canChangeMemberStatus,
  editingMember,
  savingMemberEdit,
  onViewMember,
  onSearchChange,
  onFullNameChange,
  onFamilyNameChange,
  onOrganizationChange,
  onRecentConvertChange,
  onAddMember,
  onStartEditMember,
  onCancelEditMember,
  onSaveMemberEdit,
  onDeactivateMember,
}: MembersViewProps) {
  return (
    <section>
      {canManageMembers && (
        <AddMemberForm
          fullName={fullName}
          familyName={familyName}
          organization={organization}
          recentConvert={recentConvert}
          savingMember={savingMember}
          onFullNameChange={
            onFullNameChange
          }
          onFamilyNameChange={
            onFamilyNameChange
          }
          onOrganizationChange={
            onOrganizationChange
          }
          onRecentConvertChange={
            onRecentConvertChange
          }
          onSubmit={onAddMember}
        />
      )}

      <div
        className={
          canManageMembers ? "mt-4" : ""
        }
      >
       <MembersDirectory
  members={members}
  filteredMembers={filteredMembers}
  memberSearch={memberSearch}
  loadingMembers={loadingMembers}
  canManageMembers={canManageMembers}
  canChangeMemberStatus={canChangeMemberStatus}
  onSearchChange={onSearchChange}
  onViewMember={onViewMember}
  onEditMember={onStartEditMember}
  onDeactivateMember={onDeactivateMember}
/>
      </div>
      {editingMember && (
  <EditMemberModal
    key={editingMember.id}
    member={editingMember}
    saving={savingMemberEdit}
    onClose={onCancelEditMember}
    onSave={onSaveMemberEdit}
  />
)}
    </section>
  );
}