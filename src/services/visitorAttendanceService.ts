import { supabase } from "@/lib/supabase";

import type {
  Visitor,
  MeetingVisitor,
  MeetingVisitorWithVisitor,
  NewVisitorInput,
  UpdateVisitorInput,
  NewMeetingVisitorInput,
  UpdateMeetingVisitorInput,
  RegisterVisitorAttendanceInput,
} from "@/types/visitor";

/**
 * Obtiene visitantes según su estado.
 */
export async function getVisitorsByStatus(
  active: boolean,
): Promise<Visitor[]> {
  const { data, error } = await supabase
    .from("visitors")
    .select("*")
    .eq("active", active)
    .order("full_name");

  if (error) {
    throw error;
  }

  return data satisfies Visitor[];
}

/**
 * Obtiene todos los visitantes activos.
 */
export async function getVisitors(): Promise<Visitor[]> {
  return getVisitorsByStatus(true);
}

/**
 * Obtiene todos los visitantes inactivos.
 */
export async function getInactiveVisitors(): Promise<Visitor[]> {
  return getVisitorsByStatus(false);
}

/**
 * Obtiene un visitante por su id.
 */
export async function getVisitor(
  visitorId: string,
): Promise<Visitor | null> {
  const { data, error } = await supabase
    .from("visitors")
    .select("*")
    .eq("id", visitorId)
    .single();

  if (error) {
    throw error;
  }

  return data satisfies Visitor;
}

/**
 * Crea un nuevo visitante.
 */
export async function createVisitor(
  input: NewVisitorInput,
): Promise<Visitor> {
  const { data, error } = await supabase
    .from("visitors")
    .insert(input)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data satisfies Visitor;
}

/**
 * Actualiza la información de un visitante.
 */
export async function updateVisitor(
  visitorId: string,
  input: UpdateVisitorInput,
): Promise<Visitor> {
  const { data, error } = await supabase
    .from("visitors")
    .update(input)
    .eq("id", visitorId)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data satisfies Visitor;
}

/**
 * Desactiva un visitante.
 */
export async function deactivateVisitor(
  visitorId: string,
): Promise<void> {
  const { error } = await supabase
    .from("visitors")
    .update({
      active: false,
    })
    .eq("id", visitorId);

  if (error) {
    throw error;
  }
}

/**
 * Reactiva un visitante.
 */
export async function reactivateVisitor(
  visitorId: string,
): Promise<Visitor> {
  const { data, error } = await supabase
    .from("visitors")
    .update({
      active: true,
    })
    .eq("id", visitorId)
    .select("*")
    .single();

  if (error) {
    throw error;
  }

  return data satisfies Visitor;
}

/**
 * Obtiene todos los visitantes registrados
 * en una reunión específica.
 */
export async function getMeetingVisitors(
  meetingId: string,
): Promise<MeetingVisitorWithVisitor[]> {
  const { data, error } = await supabase
    .from("meeting_visitors")
    .select(`
      id,
      meeting_id,
      visitor_id,
      visitor_type,
      invited_by,
      notes,
      created_at,
      created_by,
      visitor:visitors (
        id,
        full_name,
        phone,
        notes,
        active,
        created_at,
        created_by
      )
    `)
    .eq("meeting_id", meetingId)
    .order("created_at");

  if (error) {
    throw error;
  }

  return (data ?? []).map((item) => {
    const visitor = Array.isArray(item.visitor)
      ? item.visitor[0]
      : item.visitor;

    if (!visitor) {
      throw new Error(
        "No se encontró la información del visitante relacionado.",
      );
    }

    return {
      id: item.id,
      meeting_id: item.meeting_id,
      visitor_id: item.visitor_id,
      visitor_type: item.visitor_type as MeetingVisitorWithVisitor["visitor_type"],
      invited_by: item.invited_by,
      notes: item.notes,
      created_at: item.created_at,
      created_by: item.created_by,
      visitor: {
        id: visitor.id,
        full_name: visitor.full_name,
        phone: visitor.phone,
        notes: visitor.notes,
        active: visitor.active,
        created_at: visitor.created_at,
        created_by: visitor.created_by,
      },
    };
  });
}

/**
 * Registra a un visitante en una reunión.
 */
export async function registerMeetingVisitor(
  input: NewMeetingVisitorInput,
): Promise<MeetingVisitor> {
  const { data, error } = await supabase
    .from("meeting_visitors")
    .insert(input)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data satisfies MeetingVisitor;
}

/**
 * Actualiza los datos asociados con la asistencia
 * de un visitante a una reunión.
 */
export async function updateMeetingVisitor(
  meetingVisitorId: string,
  input: UpdateMeetingVisitorInput,
): Promise<MeetingVisitor> {
  const { data, error } = await supabase
    .from("meeting_visitors")
    .update(input)
    .eq("id", meetingVisitorId)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data satisfies MeetingVisitor;
}

/**
 * Elimina únicamente el registro de asistencia
 * de un visitante para una reunión.
 *
 * No elimina la ficha permanente del visitante.
 */
export async function removeMeetingVisitor(
  meetingVisitorId: string,
): Promise<void> {
  const { error } = await supabase
    .from("meeting_visitors")
    .delete()
    .eq("id", meetingVisitorId);

  if (error) {
    throw error;
  }
}

/**
 * Normaliza un nombre para comparaciones.
 */
function normalizeVisitorName(value: string): string {
  return value
    .trim()
    .replace(/\s+/g, " ")
    .toLocaleLowerCase();
}

/**
 * Busca un visitante activo por nombre.
 *
 * La comparación final se hace en TypeScript
 * para ignorar mayúsculas y espacios duplicados.
 */
export async function findVisitorByName(
  fullName: string,
): Promise<Visitor | null> {
  const normalizedName = normalizeVisitorName(fullName);

  if (!normalizedName) {
    return null;
  }

  const { data, error } = await supabase
    .from("visitors")
    .select("*")
    .eq("active", true)
    .ilike("full_name", fullName.trim());

  if (error) {
    throw error;
  }

  const visitor =
    data.find(
      (item) =>
        normalizeVisitorName(item.full_name) === normalizedName,
    ) ?? null;

  return visitor as Visitor | null;
}

/**
 * Reutiliza un visitante existente o crea uno nuevo.
 */
export async function getOrCreateVisitor(
  input: NewVisitorInput,
): Promise<Visitor> {
  const fullName = input.full_name
    .trim()
    .replace(/\s+/g, " ");

  if (!fullName) {
    throw new Error(
      "El nombre completo del visitante es obligatorio.",
    );
  }

  const existingVisitor = await findVisitorByName(fullName);

  if (existingVisitor) {
    return existingVisitor;
  }

  return createVisitor({
    ...input,
    full_name: fullName,
    phone: input.phone?.trim() || null,
    notes: input.notes?.trim() || null,
  });
}

/**
 * Verifica si un visitante ya está registrado
 * en una reunión.
 */
export async function isVisitorRegisteredInMeeting(
  meetingId: string,
  visitorId: string,
): Promise<boolean> {
  const { data, error } = await supabase
    .from("meeting_visitors")
    .select("id")
    .eq("meeting_id", meetingId)
    .eq("visitor_id", visitorId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data !== null;
}

/**
 * Crea o reutiliza la ficha de un visitante
 * y registra su asistencia a una reunión.
 */
export async function registerVisitorAttendance(
  input: RegisterVisitorAttendanceInput,
): Promise<MeetingVisitorWithVisitor> {
  const visitor = await getOrCreateVisitor({
    full_name: input.full_name,
    phone: input.phone,
    notes: input.visitor_notes,
  });

  const alreadyRegistered =
  await isVisitorRegisteredInMeeting(
    input.meeting_id,
    visitor.id,
  );

if (alreadyRegistered) {
  const duplicateError = new Error(
    "Esta persona ya está registrada en la reunión seleccionada.",
  ) as Error & { code?: string };

  duplicateError.code =
    "VISITOR_ALREADY_REGISTERED";

  throw duplicateError;
}

  const meetingVisitor =
    await registerMeetingVisitor({
      meeting_id: input.meeting_id,
      visitor_id: visitor.id,
      visitor_type: input.visitor_type,
      invited_by:
        input.invited_by?.trim() || null,
      notes:
        input.attendance_notes?.trim() || null,
    });

  return {
    ...meetingVisitor,
    visitor,
  };
}