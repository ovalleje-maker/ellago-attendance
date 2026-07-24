/**
 * Categoría con la que una persona aparece
 * en una reunión sacramental.
 *
 * Los valores coinciden exactamente con los permitidos
 * por meeting_visitors_type_check en Supabase.
 */
export type VisitorType = "friend" | "visitor";

/**
 * Ficha permanente de una persona visitante.
 *
 * Corresponde a la tabla:
 * public.visitors
 */
export interface Visitor {
  id: string;
  full_name: string;
  phone: string | null;
  notes: string | null;
  active: boolean;
  created_at: string;
  created_by: string | null;
}

/**
 * Registro que conecta a un visitante con una reunión.
 *
 * Corresponde a la tabla:
 * public.meeting_visitors
 */
export interface MeetingVisitor {
  id: string;
  meeting_id: string;
  visitor_id: string;
  visitor_type: VisitorType;
  invited_by: string | null;
  notes: string | null;
  created_at: string;
  created_by: string | null;
}

/**
 * Registro de asistencia acompañado por la información
 * permanente del visitante.
 *
 * Lo utilizaremos cuando Supabase haga una consulta
 * relacionada entre meeting_visitors y visitors.
 */
export interface MeetingVisitorWithVisitor extends MeetingVisitor {
  visitor: Visitor;
}

/**
 * Datos necesarios para crear una nueva ficha
 * en public.visitors.
 *
 * created_by no se envía porque Supabase lo completa
 * automáticamente con auth.uid().
 */
export interface NewVisitorInput {
  full_name: string;
  phone?: string | null;
  notes?: string | null;
}

/**
 * Campos que podrán modificarse posteriormente
 * en una ficha de visitante.
 */
export interface UpdateVisitorInput {
  full_name?: string;
  phone?: string | null;
  notes?: string | null;
  active?: boolean;
}

/**
 * Datos requeridos para registrar a un visitante
 * en una reunión.
 */
export interface NewMeetingVisitorInput {
  meeting_id: string;
  visitor_id: string;
  visitor_type: VisitorType;
  invited_by?: string | null;
  notes?: string | null;
}

/**
 * Campos que podrán modificarse en la asistencia
 * de un visitante.
 */
export interface UpdateMeetingVisitorInput {
  visitor_type?: VisitorType;
  invited_by?: string | null;
  notes?: string | null;
}

export interface RegisterVisitorAttendanceInput {
  meeting_id: string;
  full_name: string;
  visitor_type: VisitorType;
  phone?: string | null;
  invited_by?: string | null;
  visitor_notes?: string | null;
  attendance_notes?: string | null;
}