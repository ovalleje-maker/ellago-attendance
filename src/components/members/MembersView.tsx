import type {
  FormEvent,
} from "react";

import AddMemberForm from "@/components/members/AddMemberForm";
import MembersDirectory from "@/components/members/MembersDirectory";

import type {
  Member,
  Organization,
} from "@/types/member";

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

  onDeleteMember: (member: Member) => void;
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
  onSearchChange,
  onFullNameChange,
  onFamilyNameChange,
  onOrganizationChange,
  onRecentConvertChange,
  onAddMember,
  onDeleteMember,
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
          filteredMembers={
            filteredMembers
          }
          memberSearch={memberSearch}
          loadingMembers={loadingMembers}
          canManageMembers={
            canManageMembers
          }
          onSearchChange={onSearchChange}
          onDeleteMember={
            onDeleteMember
          }
        />
      </div>
    </section>
  );
}