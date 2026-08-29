import { localStore } from "./local";
import { supabaseStore } from "./supabase";
import type { Store } from "./types";

const useLocal =
  process.env.STORAGE_BACKEND === "local" ||
  !process.env.NEXT_PUBLIC_SUPABASE_URL ||
  process.env.NEXT_PUBLIC_SUPABASE_URL.includes("tu-proyecto");

export const store: Store = useLocal ? localStore : supabaseStore;

export const usingLocalBackend = useLocal;
