export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      admin: {
        Row: {
          created_at: string
          deleted_at: string | null
          first_name: string
          id: string
          last_name: string
          phone: string
          role: Database["public"]["Enums"]["admin_role"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          deleted_at?: string | null
          first_name: string
          id: string
          last_name: string
          phone: string
          role: Database["public"]["Enums"]["admin_role"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          deleted_at?: string | null
          first_name?: string
          id?: string
          last_name?: string
          phone?: string
          role?: Database["public"]["Enums"]["admin_role"]
          updated_at?: string
        }
        Relationships: []
      }
      applications: {
        Row: {
          arrival_date: string
          assigned_to: string | null
          contact_email: string
          created_at: string
          destination_country_id: string
          gov_fee: number
          id: string
          processing_fee: number
          profile_id: string
          status: Database["public"]["Enums"]["application_status"]
          total_fee: number
          turnaround_fee: number
          turnaround_time_id: number
          updated_at: string
          visa_type_id: number
        }
        Insert: {
          arrival_date: string
          assigned_to?: string | null
          contact_email: string
          created_at?: string
          destination_country_id: string
          gov_fee?: number
          id?: string
          processing_fee?: number
          profile_id: string
          status: Database["public"]["Enums"]["application_status"]
          total_fee?: number
          turnaround_fee?: number
          turnaround_time_id: number
          updated_at?: string
          visa_type_id: number
        }
        Update: {
          arrival_date?: string
          assigned_to?: string | null
          contact_email?: string
          created_at?: string
          destination_country_id?: string
          gov_fee?: number
          id?: string
          processing_fee?: number
          profile_id?: string
          status?: Database["public"]["Enums"]["application_status"]
          total_fee?: number
          turnaround_fee?: number
          turnaround_time_id?: number
          updated_at?: string
          visa_type_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "applications_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "admin"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "applications_destination_country_id_fkey"
            columns: ["destination_country_id"]
            isOneToOne: false
            referencedRelation: "countries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "applications_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "applications_turnaround_time_id_fkey"
            columns: ["turnaround_time_id"]
            isOneToOne: false
            referencedRelation: "turnaround_times"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "applications_visa_type_id_fkey"
            columns: ["visa_type_id"]
            isOneToOne: false
            referencedRelation: "visa_types"
            referencedColumns: ["id"]
          },
        ]
      }
      countries: {
        Row: {
          created_at: string
          id: string
          is_disabled: boolean
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id: string
          is_disabled?: boolean
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          is_disabled?: boolean
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      products: {
        Row: {
          created_at: string
          deleted_at: string | null
          gov_fee_override: number | null
          id: number
          is_disabled: boolean
          processing_fee_override: number | null
          updated_at: string
          visa_rule_id: number
          visa_type_id: number
        }
        Insert: {
          created_at?: string
          deleted_at?: string | null
          gov_fee_override?: number | null
          id?: number
          is_disabled?: boolean
          processing_fee_override?: number | null
          updated_at?: string
          visa_rule_id: number
          visa_type_id: number
        }
        Update: {
          created_at?: string
          deleted_at?: string | null
          gov_fee_override?: number | null
          id?: number
          is_disabled?: boolean
          processing_fee_override?: number | null
          updated_at?: string
          visa_rule_id?: number
          visa_type_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "products_visa_rule_id_fkey"
            columns: ["visa_rule_id"]
            isOneToOne: false
            referencedRelation: "visa_rules"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_visa_type_id_fkey"
            columns: ["visa_type_id"]
            isOneToOne: false
            referencedRelation: "visa_types"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          email: string
          first_name: string
          id: string
          last_name: string
          phone: string
          stripe_customer_id: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          first_name: string
          id: string
          last_name: string
          phone: string
          stripe_customer_id?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          first_name?: string
          id?: string
          last_name?: string
          phone?: string
          stripe_customer_id?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      travellers: {
        Row: {
          application_id: string
          country_of_birth: string
          country_of_residence: string
          created_at: string
          date_of_birth: string
          first_name: string
          gov_fee: number
          id: string
          last_name: string
          nationality: string
          passport_expiry_date: string
          passport_number: string
          processing_fee: number
          product_id: number
          updated_at: string
        }
        Insert: {
          application_id: string
          country_of_birth: string
          country_of_residence: string
          created_at?: string
          date_of_birth: string
          first_name: string
          gov_fee: number
          id?: string
          last_name: string
          nationality: string
          passport_expiry_date: string
          passport_number: string
          processing_fee: number
          product_id: number
          updated_at?: string
        }
        Update: {
          application_id?: string
          country_of_birth?: string
          country_of_residence?: string
          created_at?: string
          date_of_birth?: string
          first_name?: string
          gov_fee?: number
          id?: string
          last_name?: string
          nationality?: string
          passport_expiry_date?: string
          passport_number?: string
          processing_fee?: number
          product_id?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_travellers_product_id"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "travellers_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "applications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "travellers_country_of_birth_fkey"
            columns: ["country_of_birth"]
            isOneToOne: false
            referencedRelation: "countries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "travellers_country_of_residence_fkey"
            columns: ["country_of_residence"]
            isOneToOne: false
            referencedRelation: "countries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "travellers_nationality_fkey"
            columns: ["nationality"]
            isOneToOne: false
            referencedRelation: "countries"
            referencedColumns: ["id"]
          },
        ]
      }
      turnaround_times: {
        Row: {
          created_at: string
          fee: number
          id: number
          index: number
          is_disabled: boolean
          name: string
          turnaround_time_hours: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          fee?: number
          id?: number
          index?: number
          is_disabled?: boolean
          name: string
          turnaround_time_hours?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          fee?: number
          id?: number
          index?: number
          is_disabled?: boolean
          name?: string
          turnaround_time_hours?: number
          updated_at?: string
        }
        Relationships: []
      }
      visa_rules: {
        Row: {
          created_at: string
          destination_country: string
          id: number
          is_supported: boolean
          is_visa_required: boolean
          nationality: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          destination_country: string
          id?: number
          is_supported?: boolean
          is_visa_required?: boolean
          nationality: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          destination_country?: string
          id?: number
          is_supported?: boolean
          is_visa_required?: boolean
          nationality?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "visa_rules_destination_country_fkey"
            columns: ["destination_country"]
            isOneToOne: false
            referencedRelation: "countries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "visa_rules_nationality_fkey"
            columns: ["nationality"]
            isOneToOne: false
            referencedRelation: "countries"
            referencedColumns: ["id"]
          },
        ]
      }
      visa_types: {
        Row: {
          created_at: string
          deleted_at: string | null
          destination_country: string
          gov_fee: number
          id: number
          is_disabled: boolean
          max_stay: number
          name: string
          number_of_entries: number
          processing_fee: number
          updated_at: string
          valid_for: string
        }
        Insert: {
          created_at?: string
          deleted_at?: string | null
          destination_country: string
          gov_fee?: number
          id?: number
          is_disabled?: boolean
          max_stay: number
          name: string
          number_of_entries: number
          processing_fee?: number
          updated_at?: string
          valid_for: string
        }
        Update: {
          created_at?: string
          deleted_at?: string | null
          destination_country?: string
          gov_fee?: number
          id?: number
          is_disabled?: boolean
          max_stay?: number
          name?: string
          number_of_entries?: number
          processing_fee?: number
          updated_at?: string
          valid_for?: string
        }
        Relationships: [
          {
            foreignKeyName: "visa_types_destination_country_fkey"
            columns: ["destination_country"]
            isOneToOne: false
            referencedRelation: "countries"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_active_product_counts_by_visa_type_ids: {
        Args: { type_ids: number[] }
        Returns: {
          product_count: number
          visa_type_id: number
        }[]
      }
      get_admin_by_id: { Args: { p_id: string }; Returns: Json }
      get_admins: {
        Args: {
          p_limit?: number
          p_order?: string
          p_page?: number
          p_role?: string
          p_search?: string
          p_sort?: string
        }
        Returns: Json
      }
      get_product_stats_by_visa_rule_ids: {
        Args: { rule_ids: number[] }
        Returns: {
          product_count: number
          visa_rule_id: number
          visa_type_count: number
        }[]
      }
      is_admin: { Args: never; Returns: boolean }
      list_applications_admin:
        | {
            Args: {
              p_assigned_to_id?: string
              p_destination_id?: string
              p_limit?: number
              p_nationality_id?: string
              p_order?: string
              p_page?: number
              p_search?: string
              p_sort?: string
              p_status?: string
            }
            Returns: Json
          }
        | {
            Args: {
              p_assigned_to_id?: string
              p_destination_id?: string
              p_filter_unassigned?: boolean
              p_limit?: number
              p_nationality_id?: string
              p_order?: string
              p_page?: number
              p_search?: string
              p_sort?: string
              p_status?: string
            }
            Returns: Json
          }
    }
    Enums: {
      admin_role: "ADMIN" | "SUPER_ADMIN"
      application_status:
        | "NOT_STARTED"
        | "IN_PROGRESS"
        | "COMPLETED"
        | "REJECTED"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      admin_role: ["ADMIN", "SUPER_ADMIN"],
      application_status: [
        "NOT_STARTED",
        "IN_PROGRESS",
        "COMPLETED",
        "REJECTED",
      ],
    },
  },
} as const
