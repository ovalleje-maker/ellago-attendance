"use client";

import {
  useCallback,
  useEffect,
  useState,
} from "react";

import type {
  HistoricalMeeting,
  MemberAttendanceHistory,
} from "@/types/attendance";

import type { Member } from "@/types/member";

import {
  getAttendanceHistory,
} from "@/services/attendanceHistoryService";

type UseAttendanceHistoryParams = {
  members: Member[];
  endDate: string;
  numberOfWeeks?: number;
  enabled?: boolean;
};

export function useAttendanceHistory({
  members,
  endDate,
  numberOfWeeks = 8,
  enabled = true,
}: UseAttendanceHistoryParams) {
  const [
    historicalMeetings,
    setHistoricalMeetings,
  ] = useState<HistoricalMeeting[]>([]);

  const [
    memberHistories,
    setMemberHistories,
  ] = useState<MemberAttendanceHistory[]>([]);

  const [loadingHistory, setLoadingHistory] =
    useState(false);

  const [historyError, setHistoryError] =
    useState("");

  const loadHistory = useCallback(async () => {
    if (!enabled || !endDate) {
      setHistoricalMeetings([]);
      setMemberHistories([]);
      return;
    }

    setLoadingHistory(true);
    setHistoryError("");

    try {
      const result = await getAttendanceHistory({
        members,
        endDate,
        numberOfWeeks,
      });

      setHistoricalMeetings(result.meetings);
      setMemberHistories(result.histories);
    } catch (error) {
      console.error(
        "Error cargando historial:",
        error,
      );

      setHistoryError(
        error instanceof Error
          ? `No fue posible cargar el historial: ${error.message}`
          : "No fue posible cargar el historial.",
      );
    } finally {
      setLoadingHistory(false);
    }
  }, [
    enabled,
    endDate,
    members,
    numberOfWeeks,
  ]);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  return {
    historicalMeetings,
    memberHistories,
    loadingHistory,
    historyError,
    reloadHistory: loadHistory,
  };
}