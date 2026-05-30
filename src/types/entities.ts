import { Database } from "@/lib/database.types";


export type User =
  Database['public']['Tables']['users']['Row'];

export type Match =
  Database['public']['Tables']['matches']['Row'];

export type Prediction =
  Database['public']['Tables']['predictions']['Row'];

export type Company =
  Database['public']['Tables']['companies']['Row'];