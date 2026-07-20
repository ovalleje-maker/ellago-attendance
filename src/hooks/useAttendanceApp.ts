"use client";

import {
  type FormEvent,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import { supabase } from "@/lib/supabase";

import { useAttendanceHistory } from "@/hooks/useAttendanceHistory";
import { useUserProfile } from "@/hooks/useUserProfile";

import {
  addAttendance,
  addFamilyAttendance,
  clearAttendance,
  getPresentMemberIds,
  removeAttendance,
  removeFamilyAttendance,
} from "@/services/attendanceService";

import {
  createMember,
  deactivateMember as deactivateMemberRecord,
  getActiveMembers,
  getInactiveMembers,
  reactivateMember as reactivateMemberRecord,
  updateMember,
} from "@/services/membersService";

import {
  getMemberAttendanceHistory,
  getMemberAttendanceSummary,
  type MemberAttendanceHistoryItem,
  type MemberAttendanceSummary,
} from "@/services/memberProfileService";

import {
  getOrCreateMeeting,
} from "@/services/meetingsService";

import type {
  Member,
  Organization,
} from "@/types/member";

import type {
  AppTab,
} from "@/types/navigation";

import {
  formatMeetingDate,
  getMostRecentSunday,
} from "@/utils/dates";

export function useAttendanceApp() {
  /*
   * PERFIL Y PERMISOS
   */

  const {
    profile,
    loadingProfile,
    profileError,
  } = useUserProfile();

  const canManageMembers =
    profile?.role === "bishop" ||
    profile?.role === "counselor";

  const canRecordAttendance =
    profile?.role === "bishop" ||
    profile?.role === "counselor" ||
    profile?.role === "secretary" ||
    profile?.role === "leader";

  /*
   * NAVEGACIÓN
   */

  const [activeTab, setActiveTab] =
    useState<AppTab>("dashboard");

  /*
   * MIEMBROS Y ASISTENCIA
   */

  const [members, setMembers] =
    useState<Member[]>([]);

    const [
  inactiveMembers,
  setInactiveMembers,
] = useState<Member[]>([]);

  const [
    presentMemberIds,
    setPresentMemberIds,
  ] = useState<Set<string>>(new Set());

  const [meetingDate, setMeetingDate] =
    useState(getMostRecentSunday());

  const [meetingId, setMeetingId] =
    useState<string | null>(null);

  /*
   * BÚSQUEDAS
   */

  const [
    attendanceSearch,
    setAttendanceSearch,
  ] = useState("");

  const [memberSearch, setMemberSearch] =
    useState("");

    const [
  inactiveMemberSearch,
  setInactiveMemberSearch,
] = useState("");

  /*
   * FORMULARIO DE MIEMBROS
   */

  const [fullName, setFullName] =
    useState("");

  const [familyName, setFamilyName] =
    useState("");

  const [
    organization,
    setOrganization,
  ] = useState<Organization>(
    "Cuórum de Élderes",
  );

  const [
    recentConvert,
    setRecentConvert,
  ] = useState(false);

  /*
   * ESTADOS DE CARGA
   */

  const [
    loadingMembers,
    setLoadingMembers,
  ] = useState(true);

  const [
  loadingInactiveMembers,
  setLoadingInactiveMembers,
] = useState(true);

  const [
    loadingAttendance,
    setLoadingAttendance,
  ] = useState(true);

  const [
    savingMember,
    setSavingMember,
  ] = useState(false);

  const [
  editingMember,
  setEditingMember,
] = useState<Member | null>(null);

const [
  selectedMember,
  setSelectedMember,
] = useState<Member | null>(null);

const [
  memberAttendanceSummary,
  setMemberAttendanceSummary,
] =
  useState<MemberAttendanceSummary>({
    totalMeetings: 0,
    attendanceCount: 0,
    attendancePercentage: 0,
    absenceCount: 0,
  });

const [
  loadingMemberAttendanceSummary,
  setLoadingMemberAttendanceSummary,
] = useState(false);

const [
  memberAttendanceHistory,
  setMemberAttendanceHistory,
] = useState<
  MemberAttendanceHistoryItem[]
>([]);

const [
  loadingMemberAttendanceHistory,
  setLoadingMemberAttendanceHistory,
] = useState(false);

const [
  savingMemberEdit,
  setSavingMemberEdit,
] = useState(false);

const [
  reactivatingMemberId,
  setReactivatingMemberId,
] = useState<string | null>(null);

  const [
    changingAttendance,
    setChangingAttendance,
  ] = useState<string | null>(null);

   const [    errorMessage,
    setErrorMessage,
  ] = useState("");

  /*
   * HISTORIAL
   */

  const {
    historicalMeetings,
    memberHistories,
    loadingHistory,
    historyError,
    reloadHistory,
  } = useAttendanceHistory({
    members,
    endDate: meetingDate,
    numberOfWeeks: 8,
  });

  /*
   * CARGAR MIEMBROS
   */

  const loadMembers =
    useCallback(async () => {
      setLoadingMembers(true);
      setErrorMessage("");

      try {
        const loadedMembers =
          await getActiveMembers();

        setMembers(loadedMembers);
      } catch (error) {
        console.error(
          "Error cargando miembros:",
          error,
        );

        setErrorMessage(
          error instanceof Error
            ? `No fue posible cargar los miembros: ${error.message}`
            : "No fue posible cargar los miembros.",
        );
      } finally {
        setLoadingMembers(false);
      }
    }, []);

    const loadInactiveMembers =
  useCallback(async () => {
    setLoadingInactiveMembers(true);
    setErrorMessage("");

    try {
      const loadedInactiveMembers =
        await getInactiveMembers();

      setInactiveMembers(
        loadedInactiveMembers,
      );
    } catch (error) {
      console.error(
        "Error cargando miembros inactivos:",
        error,
      );

      setErrorMessage(
        error instanceof Error
          ? `No fue posible cargar los miembros inactivos: ${error.message}`
          : "No fue posible cargar los miembros inactivos.",
      );
    } finally {
      setLoadingInactiveMembers(false);
    }
  }, []);

  /*
   * CARGAR REUNIÓN Y ASISTENCIA
   */

  const loadMeetingAndAttendance =
    useCallback(async (date: string) => {
      if (!date) return;

      setLoadingAttendance(true);
      setErrorMessage("");

      try {
        const meeting =
          await getOrCreateMeeting(date);

        setMeetingId(meeting.id);

        const memberIds =
          await getPresentMemberIds(
            meeting.id,
          );

        setPresentMemberIds(memberIds);
      } catch (error) {
        console.error(
          "Error cargando reunión:",
          error,
        );

        if (
          error instanceof Error &&
          error.message.includes(
            "meetings_sunday_check",
          )
        ) {
          setErrorMessage(
            "La fecha seleccionada no es domingo. Selecciona una fecha de domingo para registrar la reunión sacramental.",
          );

          return;
        }

        setErrorMessage(
          error instanceof Error
            ? `No fue posible cargar la reunión: ${error.message}`
            : "No fue posible cargar la reunión.",
        );
      } finally {
        setLoadingAttendance(false);
      }
    }, []);

  /*
   * CARGA INICIAL
   */

  useEffect(() => {
    loadMembers();
  }, [loadMembers]);

  useEffect(() => {
  loadInactiveMembers();
}, [loadInactiveMembers]);

  useEffect(() => {
    loadMeetingAndAttendance(
      meetingDate,
    );
  }, [
    meetingDate,
    loadMeetingAndAttendance,
  ]);

  useEffect(() => {
  if (
    activeTab !== "members" &&
    selectedMember
  ) {
    setSelectedMember(null);
  }
}, [activeTab, selectedMember]);

  /*
   * FILTRO PARA LA PANTALLA DE ASISTENCIA
   */

  const filteredAttendanceMembers =
    useMemo(() => {
      const search =
        attendanceSearch
          .trim()
          .toLowerCase();

      return members.filter((member) => {
        const searchableText = [
          member.full_name,
          member.family_name ?? "",
          member.organization,
        ]
          .join(" ")
          .toLowerCase();

        return searchableText.includes(
          search,
        );
      });
    }, [
      members,
      attendanceSearch,
    ]);

  /*
   * FILTRO PARA EL DIRECTORIO
   */

  const filteredDirectoryMembers =
    useMemo(() => {
      const search =
        memberSearch
          .trim()
          .toLowerCase();

      return members.filter((member) => {
        const searchableText = [
          member.full_name,
          member.family_name ?? "",
          member.organization,
        ]
          .join(" ")
          .toLowerCase();

        return searchableText.includes(
          search,
        );
      });
    }, [
      members,
      memberSearch,
    ]);

    /*
 * FILTRO PARA MIEMBROS INACTIVOS
 */

const filteredInactiveMembers =
  useMemo(() => {
    const search =
      inactiveMemberSearch
        .trim()
        .toLowerCase();

    return inactiveMembers.filter(
      (member) => {
        const searchableText = [
          member.full_name,
          member.family_name ?? "",
          member.organization,
        ]
          .join(" ")
          .toLowerCase();

        return searchableText.includes(
          search,
        );
      },
    );
  }, [
    inactiveMembers,
    inactiveMemberSearch,
  ]);

  /*
   * PRESENTES Y AUSENTES
   */

  const presentMembers = useMemo(
    () =>
      members.filter((member) =>
        presentMemberIds.has(
          member.id,
        ),
      ),
    [
      members,
      presentMemberIds,
    ],
  );

  const absentMembers = useMemo(
    () =>
      members.filter(
        (member) =>
          !presentMemberIds.has(
            member.id,
          ),
      ),
    [
      members,
      presentMemberIds,
    ],
  );

  const attendancePercentage =
    members.length === 0
      ? 0
      : Math.round(
          (presentMembers.length /
            members.length) *
            100,
        );

  /*
   * AGRUPAR MIEMBROS POR FAMILIA
   */

  const families = useMemo<
    [string, Member[]][]
  >(() => {
    const familyMap =
      new Map<string, Member[]>();

    members.forEach((member) => {
      const family =
        member.family_name?.trim() ||
        "Sin familia";

      const familyMembers =
        familyMap.get(family) ?? [];

      familyMembers.push(member);

      familyMap.set(
        family,
        familyMembers,
      );
    });

    return Array.from(
      familyMap.entries(),
    ).sort(
      ([familyA], [familyB]) =>
        familyA.localeCompare(
          familyB,
          "es",
        ),
    );
  }, [members]);

  /*
   * AGREGAR MIEMBRO
   */

  async function addMember(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (!canManageMembers) {
      setErrorMessage(
        "Tu cuenta no tiene permiso para agregar miembros.",
      );

      return;
    }

    const cleanName =
      fullName.trim();

    const cleanFamily =
      familyName.trim();

    if (!cleanName) {
      setErrorMessage(
        "Escribe el nombre completo del miembro.",
      );

      return;
    }

    setSavingMember(true);
    setErrorMessage("");

    try {
      const newMember =
        await createMember({
          fullName: cleanName,
          familyName: cleanFamily,
          organization,
          recentConvert,
        });

      setMembers(
        (currentMembers) =>
          [
            ...currentMembers,
            newMember,
          ].sort(
            (
              memberA,
              memberB,
            ) =>
              memberA.full_name.localeCompare(
                memberB.full_name,
                "es",
              ),
          ),
      );

      setFullName("");
      setFamilyName("");
      setOrganization(
        "Cuórum de Élderes",
      );
      setRecentConvert(false);
    } catch (error) {
      console.error(
        "Error agregando miembro:",
        error,
      );

      setErrorMessage(
        error instanceof Error
          ? `No fue posible agregar el miembro: ${error.message}`
          : "No fue posible agregar el miembro.",
      );
    } finally {
      setSavingMember(false);
    }
  }

  /*
   * ELIMINAR MIEMBRO
   */

   /*
   * MARCAR O DESMARCAR UN MIEMBRO
   */

async function loadMemberAttendanceSummary(
  memberId: string,
) {
  try {
    setLoadingMemberAttendanceSummary(
      true,
    );

    const summary =
      await getMemberAttendanceSummary(
        memberId,
      );

    setMemberAttendanceSummary(
      summary,
    );
  } catch (error) {
    console.error(
      "Error al cargar el resumen de asistencia del miembro:",
      error,
    );

    setMemberAttendanceSummary({
      totalMeetings: 0,
      attendanceCount: 0,
      attendancePercentage: 0,
      absenceCount: 0,
    });

    window.alert(
      "No se pudo cargar el resumen de asistencia del miembro.",
    );
  } finally {
    setLoadingMemberAttendanceSummary(
      false,
    );
  }
}

async function loadMemberAttendanceHistory(
  memberId: string,
) {
  try {
    setLoadingMemberAttendanceHistory(
      true,
    );

    const history =
      await getMemberAttendanceHistory(
        memberId,
      );

    setMemberAttendanceHistory(
      history,
    );
  } catch (error) {
    console.error(
      "Error al cargar el historial de asistencia del miembro:",
      error,
    );

    setMemberAttendanceHistory([]);

    window.alert(
      "No se pudo cargar el historial de asistencia del miembro.",
    );
  } finally {
    setLoadingMemberAttendanceHistory(
      false,
    );
  }
}

async function openMemberProfile(
  member: Member,
) {
  setSelectedMember(member);

  setMemberAttendanceSummary({
    totalMeetings: 0,
    attendanceCount: 0,
    attendancePercentage: 0,
    absenceCount: 0,
  });

  setMemberAttendanceHistory([]);

  await Promise.all([
    loadMemberAttendanceSummary(
      member.id,
    ),
    loadMemberAttendanceHistory(
      member.id,
    ),
  ]);
}

function closeMemberProfile() {
  setSelectedMember(null);

  setMemberAttendanceSummary({
    totalMeetings: 0,
    attendanceCount: 0,
    attendancePercentage: 0,
    absenceCount: 0,
  });

  setMemberAttendanceHistory([]);

  setLoadingMemberAttendanceSummary(
    false,
  );

  setLoadingMemberAttendanceHistory(
    false,
  );
}

  function startEditMember(
  member: Member,
) {
  if (!canManageMembers) {
    setErrorMessage(
      "Tu cuenta no tiene permiso para editar miembros.",
    );

    return;
  }

  setErrorMessage("");
  setEditingMember(member);
}

function cancelEditMember() {
  if (savingMemberEdit) return;

  setEditingMember(null);
}

async function saveMemberEdit(values: {
  fullName: string;
  familyName: string;
  organization: Organization;
  recentConvert: boolean;
}) {
  if (!canManageMembers) {
    setErrorMessage(
      "Tu cuenta no tiene permiso para editar miembros.",
    );

    return;
  }

  if (!editingMember) {
    setErrorMessage(
      "No hay un miembro seleccionado para editar.",
    );

    return;
  }

  setSavingMemberEdit(true);
  setErrorMessage("");

  try {
    const updatedMember =
      await updateMember(
        editingMember.id,
        values,
      );

    setMembers((currentMembers) =>
      currentMembers
        .map((member) =>
          member.id === updatedMember.id
            ? updatedMember
            : member,
        )
        .sort((memberA, memberB) =>
          memberA.full_name.localeCompare(
            memberB.full_name,
            "es",
          ),
        ),
    );

    setEditingMember(null);
  } catch (error) {
    console.error(
      "Error actualizando miembro:",
      error,
    );

    setErrorMessage(
      error instanceof Error
        ? `No fue posible actualizar el miembro: ${error.message}`
        : "No fue posible actualizar el miembro.",
    );
  } finally {
    setSavingMemberEdit(false);
  }
}

async function deactivateMember(
  member: Member,
) {
  if (!canManageMembers) {
    setErrorMessage(
      "Tu cuenta no tiene permiso para desactivar miembros.",
    );

    return;
  }

  const confirmed = window.confirm(
    `¿Deseas desactivar a ${member.full_name}? Su historial de asistencia se conservará.`,
  );

  if (!confirmed) return;

  setErrorMessage("");

  try {
    await deactivateMemberRecord(
      member.id,
    );

    setMembers((currentMembers) =>
      currentMembers.filter(
        (currentMember) =>
          currentMember.id !== member.id,
      ),
    );

setInactiveMembers(
  (currentMembers) =>
    [
      ...currentMembers.filter(
        (currentMember) =>
          currentMember.id !== member.id,
      ),
      {
        ...member,
        active: false,
      },
    ].sort((memberA, memberB) =>
      memberA.full_name.localeCompare(
        memberB.full_name,
        "es",
      ),
    ),
);

    setPresentMemberIds(
      (currentIds) => {
        const updatedIds =
          new Set(currentIds);

        updatedIds.delete(member.id);

        return updatedIds;
      },
    );

    if (
      editingMember?.id === member.id
    ) {
      setEditingMember(null);
    }

    await reloadHistory();
  } catch (error) {
    console.error(
      "Error desactivando miembro:",
      error,
    );

    setErrorMessage(
      error instanceof Error
        ? `No fue posible desactivar el miembro: ${error.message}`
        : "No fue posible desactivar el miembro.",
    );
  }
}

async function reactivateMember(
  member: Member,
) {
  if (!canManageMembers) {
  window.alert(
    "No tienes permisos para reactivar miembros.",
  );

  return;
}

if (reactivatingMemberId) {
  return;
}
  if (!canManageMembers) {
    setErrorMessage(
      "Tu cuenta no tiene permiso para reactivar miembros.",
    );

    return;
  }

  const confirmed = window.confirm(
    `¿Deseas reactivar a ${member.full_name}? Su historial de asistencia se conservará.`,
  );

  if (!confirmed) return;

  setReactivatingMemberId(member.id);
  setErrorMessage("");

  try {
    await reactivateMemberRecord(
      member.id,
    );

    setInactiveMembers(
      (currentMembers) =>
        currentMembers.filter(
          (currentMember) =>
            currentMember.id !== member.id,
        ),
    );

    setMembers((currentMembers) =>
      [
        ...currentMembers,
        {
          ...member,
          active: true,
        },
      ].sort((memberA, memberB) =>
        memberA.full_name.localeCompare(
          memberB.full_name,
          "es",
        ),
      ),
    );

    await reloadHistory();
  } catch (error) {
    console.error(
      "Error reactivando miembro:",
      error,
    );

    setErrorMessage(
      error instanceof Error
        ? `No fue posible reactivar el miembro: ${error.message}`
        : "No fue posible reactivar el miembro.",
    );
  } finally {
    setReactivatingMemberId(null);
  }
}

  async function toggleAttendance(
    member: Member,
  ) {
    if (!canRecordAttendance) {
      setErrorMessage(
        "Tu cuenta no tiene permiso para registrar asistencia.",
      );

      return;
    }

    if (!meetingId) {
      setErrorMessage(
        "La reunión todavía no está lista.",
      );

      return;
    }

    setChangingAttendance(
      member.id,
    );

    setErrorMessage("");

    const currentlyPresent =
      presentMemberIds.has(
        member.id,
      );

    try {
      if (currentlyPresent) {
        await removeAttendance(
          meetingId,
          member.id,
        );

        setPresentMemberIds(
          (currentIds) => {
            const updatedIds =
              new Set(currentIds);

            updatedIds.delete(
              member.id,
            );

            return updatedIds;
          },
        );
      } else {
        const {
          data: { user },
          error: userError,
        } =
          await supabase.auth.getUser();

        if (userError || !user) {
          throw new Error(
            "No existe una sesión válida.",
          );
        }

        await addAttendance(
          meetingId,
          member.id,
          user.id,
        );

        setPresentMemberIds(
          (currentIds) => {
            const updatedIds =
              new Set(currentIds);

            updatedIds.add(
              member.id,
            );

            return updatedIds;
          },
        );
      }

      await reloadHistory();
    } catch (error) {
      console.error(
        "Error cambiando asistencia:",
        error,
      );

      setErrorMessage(
        error instanceof Error
          ? `No fue posible cambiar la asistencia: ${error.message}`
          : "No fue posible cambiar la asistencia.",
      );
    } finally {
      setChangingAttendance(null);
    }
  }

  /*
   * MARCAR O DESMARCAR UNA FAMILIA
   */

  async function markWholeFamily(
    familyMembers: Member[],
  ) {
    if (!canRecordAttendance) {
      setErrorMessage(
        "Tu cuenta no tiene permiso para registrar asistencia.",
      );

      return;
    }

    if (!meetingId) {
      setErrorMessage(
        "La reunión todavía no está lista.",
      );

      return;
    }

    setErrorMessage("");

    const familyMemberIds =
      familyMembers.map(
        (member) => member.id,
      );

    const allPresent =
      familyMemberIds.every(
        (memberId) =>
          presentMemberIds.has(
            memberId,
          ),
      );

    try {
      if (allPresent) {
        await removeFamilyAttendance(
          meetingId,
          familyMemberIds,
        );

        setPresentMemberIds(
          (currentIds) => {
            const updatedIds =
              new Set(currentIds);

            familyMemberIds.forEach(
              (memberId) =>
                updatedIds.delete(
                  memberId,
                ),
            );

            return updatedIds;
          },
        );

        await reloadHistory();

        return;
      }

      const {
        data: { user },
        error: userError,
      } =
        await supabase.auth.getUser();

      if (userError || !user) {
        throw new Error(
          "No existe una sesión válida.",
        );
      }

      const missingMemberIds =
        familyMemberIds.filter(
          (memberId) =>
            !presentMemberIds.has(
              memberId,
            ),
        );

      await addFamilyAttendance(
        meetingId,
        missingMemberIds,
        user.id,
      );

      setPresentMemberIds(
        (currentIds) => {
          const updatedIds =
            new Set(currentIds);

          missingMemberIds.forEach(
            (memberId) =>
              updatedIds.add(
                memberId,
              ),
          );

          return updatedIds;
        },
      );

      await reloadHistory();
    } catch (error) {
      console.error(
        "Error cambiando familia:",
        error,
      );

      setErrorMessage(
        error instanceof Error
          ? `No fue posible cambiar la familia: ${error.message}`
          : "No fue posible cambiar la familia.",
      );
    }
  }

  /*
   * LIMPIAR ASISTENCIA DEL DÍA
   */

  async function clearMeetingAttendance() {
    if (!canRecordAttendance) {
      setErrorMessage(
        "Tu cuenta no tiene permiso para limpiar la asistencia.",
      );

      return;
    }

    if (!meetingId) {
      setErrorMessage(
        "La reunión todavía no está lista.",
      );

      return;
    }

    const confirmed =
      window.confirm(
        `¿Deseas borrar toda la asistencia del ${formatMeetingDate(
          meetingDate,
        )}?`,
      );

    if (!confirmed) return;

    setErrorMessage("");

    try {
      await clearAttendance(
        meetingId,
      );

      setPresentMemberIds(
        new Set(),
      );

      await reloadHistory();
    } catch (error) {
      console.error(
        "Error limpiando asistencia:",
        error,
      );

      setErrorMessage(
        error instanceof Error
          ? `No fue posible limpiar la asistencia: ${error.message}`
          : "No fue posible limpiar la asistencia.",
      );
    }
  }

  /*
   * ESTADO GLOBAL DE CARGA
   */

const loading =
  loadingMembers ||
  loadingInactiveMembers ||
  loadingAttendance ||
  loadingProfile ||
  loadingHistory;

  /*
   * DATOS Y FUNCIONES DISPONIBLES
   * PARA page.tsx
   */

  return {
    profile,

    activeTab,
    setActiveTab,

    members,
    inactiveMembers,
    presentMemberIds,
    selectedMember,
    openMemberProfile,
    closeMemberProfile,
    memberAttendanceSummary,
    loadingMemberAttendanceSummary,
    memberAttendanceHistory,
    loadingMemberAttendanceHistory,

    meetingDate,
    setMeetingDate,

    attendanceSearch,
    setAttendanceSearch,

    memberSearch,
    setMemberSearch,

    inactiveMemberSearch,
    setInactiveMemberSearch,

    fullName,
    setFullName,

    familyName,
    setFamilyName,

    organization,
    setOrganization,

    recentConvert,
    setRecentConvert,

    loading,
    loadingMembers,
    loadingInactiveMembers,
    loadingAttendance,
    savingMember,
    editingMember,
    savingMemberEdit,
    reactivatingMemberId,
    changingAttendance,

    profileError,
    errorMessage,
    historyError,

    canManageMembers,
    canRecordAttendance,

    filteredAttendanceMembers,
    filteredDirectoryMembers,
    filteredInactiveMembers,

    presentMembers,
    absentMembers,
    attendancePercentage,
    families,

    historicalMeetings,
    memberHistories,

    addMember,
    startEditMember,
    cancelEditMember,
    saveMemberEdit,
    deactivateMember,
    reactivateMember,
    toggleAttendance,
    markWholeFamily,
    clearMeetingAttendance,

    reloadMembers: loadMembers,
    reloadInactiveMembers:
  loadInactiveMembers,
    reloadMeetingAndAttendance:
      loadMeetingAndAttendance,
    reloadHistory,
  };
}