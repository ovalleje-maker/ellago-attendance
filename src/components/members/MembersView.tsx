"use client";

import {
  useState,
  type FormEvent,
} from "react";

import AddMemberForm from "@/components/members/AddMemberForm";
import EditMemberModal from "@/components/members/EditMemberModal";
import ImportMembersCsv from "@/components/members/ImportMembersCsv";
import MembersDirectory from "@/components/members/MembersDirectory";

import type {
  Member,
  Organization,
} from "@/types/member";

type MembersTab =
  | "directory"
  | "import";

type MembersViewProps = {
  members: Member[];
  inactiveMembers: Member[];
  filteredMembers: Member[];

  memberSearch: string;
  firstName: string;
  lastName: string;
  marriedLastName: string;
  familyName: string;
  organization: Organization;
  recentConvert: boolean;

  loadingMembers: boolean;
  savingMember: boolean;
  canManageMembers: boolean;
  canChangeMemberStatus: boolean;

  editingMember: Member | null;
  savingMemberEdit: boolean;

  onSearchChange: (
    value: string,
  ) => void;

  onFirstNameChange: (
    value: string,
  ) => void;

  onLastNameChange: (
    value: string,
  ) => void;

  onMarriedLastNameChange: (
    value: string,
  ) => void;

  onFamilyNameChange: (
    value: string,
  ) => void;

  onOrganizationChange: (
    value: Organization,
  ) => void;

  onRecentConvertChange: (
    value: boolean,
  ) => void;

  onAddMember: (
    event: FormEvent<HTMLFormElement>,
  ) => void;

  onViewMember: (
    member: Member,
  ) => void;

  onStartEditMember: (
    member: Member,
  ) => void;

  onCancelEditMember: () => void;

  onSaveMemberEdit: (
    values: {
      firstName: string;
      lastName: string;
      marriedLastName: string;
      familyName: string;
      organization: Organization;
      recentConvert: boolean;
    },
  ) => void;

  onDeactivateMember: (
    member: Member,
  ) => void;

  onMembersImported: (
  importedMembers: Member[],
) => void;
};

export default function MembersView({
  members,
  inactiveMembers,
  filteredMembers,
  memberSearch,
  firstName,
  lastName,
  marriedLastName,
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
  onFirstNameChange,
  onLastNameChange,
  onMarriedLastNameChange,
  onFamilyNameChange,
  onOrganizationChange,
  onRecentConvertChange,
  onAddMember,
  onStartEditMember,
  onCancelEditMember,
  onSaveMemberEdit,
  onDeactivateMember,
  onMembersImported,
}: MembersViewProps) {
  const [activeTab, setActiveTab] =
    useState<MembersTab>(
      "directory",
    );

  return (
    <section className="space-y-4">
      {canManageMembers && (
        <div className="border-b border-gray-200">
          <nav
            className="-mb-px flex gap-6"
            aria-label="Secciones de miembros"
          >
            <button
              type="button"
              onClick={() =>
                setActiveTab(
                  "directory",
                )
              }
              className={`border-b-2 px-1 py-3 text-sm font-medium ${
                activeTab ===
                "directory"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
              }`}
            >
              Directorio
            </button>

            <button
              type="button"
              onClick={() =>
                setActiveTab(
                  "import",
                )
              }
              className={`border-b-2 px-1 py-3 text-sm font-medium ${
                activeTab ===
                "import"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
              }`}
            >
              Importar CSV
            </button>
          </nav>
        </div>
      )}

      {activeTab ===
        "directory" && (
        <>
          {canManageMembers && (
            <AddMemberForm
              firstName={
                firstName
              }
              lastName={
                lastName
              }
              marriedLastName={
                marriedLastName
              }
              familyName={
                familyName
              }
              organization={
                organization
              }
              recentConvert={
                recentConvert
              }
              savingMember={
                savingMember
              }
              onFirstNameChange={
                onFirstNameChange
              }
              onLastNameChange={
                onLastNameChange
              }
              onMarriedLastNameChange={
                onMarriedLastNameChange
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
              onSubmit={
                onAddMember
              }
            />
          )}

          <MembersDirectory
            members={
              members
            }
            filteredMembers={
              filteredMembers
            }
            memberSearch={
              memberSearch
            }
            loadingMembers={
              loadingMembers
            }
            canManageMembers={
              canManageMembers
            }
            canChangeMemberStatus={
              canChangeMemberStatus
            }
            onSearchChange={
              onSearchChange
            }
            onViewMember={
              onViewMember
            }
            onEditMember={
              onStartEditMember
            }
            onDeactivateMember={
              onDeactivateMember
            }
          />
        </>
      )}

      {activeTab ===
        "import" &&
        canManageMembers && (
          <ImportMembersCsv
            members={[
              ...members,
              ...inactiveMembers,
            ]}
            onMembersImported={
              onMembersImported
            }
          />
        )}
      
      {editingMember && (
        <EditMemberModal
          key={
            editingMember.id
          }
          member={
            editingMember
          }
          saving={
            savingMemberEdit
          }
          onClose={
            onCancelEditMember
          }
          onSave={
            onSaveMemberEdit
          }
        />
      )}
    </section>
  );
}