/**
 * Generated types for Supabase schema `pomp`.
 *
 * NOTE: This file is a stub. Regenerate with:
 *   supabase gen types typescript --project-id <id> --schema pomp > supabase/types.ts
 */

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  pomp: {
    Tables: {
      exercises: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          category: 'Rygg' | 'Bryst' | 'Ben' | 'Skuldre' | 'Biceps' | 'Triceps' | 'Magemuskler';
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          category: 'Rygg' | 'Bryst' | 'Ben' | 'Skuldre' | 'Biceps' | 'Triceps' | 'Magemuskler';
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          category?: 'Rygg' | 'Bryst' | 'Ben' | 'Skuldre' | 'Biceps' | 'Triceps' | 'Magemuskler';
          created_at?: string;
        };
        Relationships: [];
      };
      routines: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      routine_exercises: {
        Row: {
          id: string;
          routine_id: string;
          exercise_id: string;
          order_index: number;
        };
        Insert: {
          id?: string;
          routine_id: string;
          exercise_id: string;
          order_index: number;
        };
        Update: {
          id?: string;
          routine_id?: string;
          exercise_id?: string;
          order_index?: number;
        };
        Relationships: [
          {
            foreignKeyName: 'routine_exercises_routine_id_fkey';
            columns: ['routine_id'];
            isOneToOne: false;
            referencedRelation: 'routines';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'routine_exercises_exercise_id_fkey';
            columns: ['exercise_id'];
            isOneToOne: false;
            referencedRelation: 'exercises';
            referencedColumns: ['id'];
          },
        ];
      };
      workouts: {
        Row: {
          id: string;
          user_id: string;
          routine_id: string | null;
          started_at: string;
          ended_at: string | null;
          note: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          routine_id?: string | null;
          started_at?: string;
          ended_at?: string | null;
          note?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          routine_id?: string | null;
          started_at?: string;
          ended_at?: string | null;
          note?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'workouts_routine_id_fkey';
            columns: ['routine_id'];
            isOneToOne: false;
            referencedRelation: 'routines';
            referencedColumns: ['id'];
          },
        ];
      };
      workout_sets: {
        Row: {
          id: string;
          workout_id: string;
          exercise_id: string;
          set_number: number;
          weight_kg: number;
          reps: number;
          note: string | null;
          completed: boolean;
          logged_at: string;
        };
        Insert: {
          id?: string;
          workout_id: string;
          exercise_id: string;
          set_number: number;
          weight_kg: number;
          reps: number;
          note?: string | null;
          completed?: boolean;
          logged_at?: string;
        };
        Update: {
          id?: string;
          workout_id?: string;
          exercise_id?: string;
          set_number?: number;
          weight_kg?: number;
          reps?: number;
          note?: string | null;
          completed?: boolean;
          logged_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'workout_sets_workout_id_fkey';
            columns: ['workout_id'];
            isOneToOne: false;
            referencedRelation: 'workouts';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'workout_sets_exercise_id_fkey';
            columns: ['exercise_id'];
            isOneToOne: false;
            referencedRelation: 'exercises';
            referencedColumns: ['id'];
          },
        ];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};

// Convenience type aliases
export type Tables<T extends keyof Database['pomp']['Tables']> =
  Database['pomp']['Tables'][T]['Row'];
export type InsertTables<T extends keyof Database['pomp']['Tables']> =
  Database['pomp']['Tables'][T]['Insert'];
export type UpdateTables<T extends keyof Database['pomp']['Tables']> =
  Database['pomp']['Tables'][T]['Update'];

export type Exercise = Tables<'exercises'>;
export type Routine = Tables<'routines'>;
export type RoutineExercise = Tables<'routine_exercises'>;
export type Workout = Tables<'workouts'>;
export type WorkoutSet = Tables<'workout_sets'>;
