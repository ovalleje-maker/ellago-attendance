"use client";

import {
  useCallback,
  useEffect,
  useState,
} from "react";
import { supabase } from "@/lib/supabase";
import type {
  UserProfile,
} from "@/types/profile";

export function useUserProfile() {
  const [profile, setProfile] =
    useState<UserProfile | null>(null);

  const [loadingProfile, setLoadingProfile] =
    useState(true);

  const [profileError, setProfileError] =
    useState("");

  const loadProfile = useCallback(async () => {
    setLoadingProfile(true);
    setProfileError("");

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      console.error(
        "No se pudo comprobar el usuario:",
        userError,
      );

      setProfileError(
        "No fue posible comprobar el usuario.",
      );

      setLoadingProfile(false);
      return;
    }

    const { data, error } = await supabase
      .from("profiles")
      .select(
        `
          id,
          full_name,
          role,
          organization,
          created_at
        `,
      )
      .eq("id", user.id)
      .single();

    if (error || !data) {
      console.error(
        "No se pudo cargar el perfil:",
        error,
      );

      setProfileError(
        "Tu cuenta existe, pero no tiene un perfil autorizado.",
      );

      setLoadingProfile(false);
      return;
    }

    setProfile(data as UserProfile);
    setLoadingProfile(false);
  }, []);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  return {
    profile,
    loadingProfile,
    profileError,
    reloadProfile: loadProfile,
  };
}