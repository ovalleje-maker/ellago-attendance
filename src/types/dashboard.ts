import type { Organization } from "@/types/member";

export type OrganizationStatistic = {
  organization: Organization;
  total: number;
  present: number;
  absent: number;
  percentage: number;
};

export type FamilyStatistic = {
  familyName: string;
  total: number;
  present: number;
  absent: number;
  allPresent: boolean;
  allAbsent: boolean;
};