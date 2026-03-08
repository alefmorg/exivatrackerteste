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
      boneco_logs: {
        Row: {
          action: string
          boneco_id: string
          boneco_name: string
          created_at: string
          id: string
          notes: string
          user_id: string
          username: string
        }
        Insert: {
          action: string
          boneco_id: string
          boneco_name: string
          created_at?: string
          id?: string
          notes?: string
          user_id: string
          username?: string
        }
        Update: {
          action?: string
          boneco_id?: string
          boneco_name?: string
          created_at?: string
          id?: string
          notes?: string
          user_id?: string
          username?: string
        }
        Relationships: [
          {
            foreignKeyName: "boneco_logs_boneco_id_fkey"
            columns: ["boneco_id"]
            isOneToOne: false
            referencedRelation: "bonecos"
            referencedColumns: ["id"]
          },
        ]
      }
      bonecos: {
        Row: {
          acessos: string[]
          activity: string
          axe: number
          club: number
          created_at: string
          distance: number
          email: string
          fist: number
          full_bless: boolean
          id: string
          last_access: string | null
          level: number
          location: string
          magic_level: number
          name: string
          observations: string
          password: string
          premium_active: boolean
          quests: string[]
          shielding: number
          status: string
          sword_skill: number
          tibia_coins: number
          totp_secret: string
          used_by: string
          vocation: string
          world: string
        }
        Insert: {
          acessos?: string[]
          activity?: string
          axe?: number
          club?: number
          created_at?: string
          distance?: number
          email?: string
          fist?: number
          full_bless?: boolean
          id?: string
          last_access?: string | null
          level?: number
          location?: string
          magic_level?: number
          name: string
          observations?: string
          password?: string
          premium_active?: boolean
          quests?: string[]
          shielding?: number
          status?: string
          sword_skill?: number
          tibia_coins?: number
          totp_secret?: string
          used_by?: string
          vocation?: string
          world?: string
        }
        Update: {
          acessos?: string[]
          activity?: string
          axe?: number
          club?: number
          created_at?: string
          distance?: number
          email?: string
          fist?: number
          full_bless?: boolean
          id?: string
          last_access?: string | null
          level?: number
          location?: string
          magic_level?: number
          name?: string
          observations?: string
          password?: string
          premium_active?: boolean
          quests?: string[]
          shielding?: number
          status?: string
          sword_skill?: number
          tibia_coins?: number
          totp_secret?: string
          used_by?: string
          vocation?: string
          world?: string
        }
        Relationships: []
      }
      level_history: {
        Row: {
          char_name: string
          id: string
          level: number
          recorded_at: string
        }
        Insert: {
          char_name: string
          id?: string
          level: number
          recorded_at?: string
        }
        Update: {
          char_name?: string
          id?: string
          level?: number
          recorded_at?: string
        }
        Relationships: []
      }
      login_history: {
        Row: {
          char_name: string
          id: string
          recorded_at: string
          status: string
        }
        Insert: {
          char_name: string
          id?: string
          recorded_at?: string
          status: string
        }
        Update: {
          char_name?: string
          id?: string
          recorded_at?: string
          status?: string
        }
        Relationships: []
      }
      map_pins: {
        Row: {
          char_name: string
          city_id: string
          id: string
          note: string
          pos_x: number
          pos_y: number
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          char_name: string
          city_id?: string
          id?: string
          note?: string
          pos_x?: number
          pos_y?: number
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          char_name?: string
          city_id?: string
          id?: string
          note?: string
          pos_x?: number
          pos_y?: number
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      member_annotations: {
        Row: {
          annotation: string
          char_name: string
          id: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          annotation?: string
          char_name: string
          id?: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          annotation?: string
          char_name?: string
          id?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      member_categories: {
        Row: {
          category: string
          char_name: string
          id: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          category?: string
          char_name: string
          id?: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          category?: string
          char_name?: string
          id?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      monitored_guilds: {
        Row: {
          created_at: string
          id: string
          last_update: string
          member_count: number
          name: string
          world: string
        }
        Insert: {
          created_at?: string
          id?: string
          last_update?: string
          member_count?: number
          name: string
          world?: string
        }
        Update: {
          created_at?: string
          id?: string
          last_update?: string
          member_count?: number
          name?: string
          world?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          id: string
          user_id: string
          username: string
        }
        Insert: {
          created_at?: string
          id?: string
          user_id: string
          username?: string
        }
        Update: {
          created_at?: string
          id?: string
          user_id?: string
          username?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      user_settings: {
        Row: {
          id: string
          settings: Json
          updated_at: string
          user_id: string
        }
        Insert: {
          id?: string
          settings?: Json
          updated_at?: string
          user_id: string
        }
        Update: {
          id?: string
          settings?: Json
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "user" | "master_admin"
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
      app_role: ["admin", "user", "master_admin"],
    },
  },
} as const
