export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      instruments: {
        Row: {
          id: string
          slug: string
          name: string
          manufacturer: string
          category: 'synth' | 'drum_machine' | 'sampler' | 'groovebox' | 'other'
          description: string | null
          image_path: string | null
          manual_path: string | null
          is_published: boolean
          created_at: string
        }
        Insert: {
          id?: string
          slug: string
          name: string
          manufacturer: string
          category: 'synth' | 'drum_machine' | 'sampler' | 'groovebox' | 'other'
          description?: string | null
          image_path?: string | null
          manual_path?: string | null
          is_published?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          slug?: string
          name?: string
          manufacturer?: string
          category?: 'synth' | 'drum_machine' | 'sampler' | 'groovebox' | 'other'
          description?: string | null
          image_path?: string | null
          manual_path?: string | null
          is_published?: boolean
        }
      }
      document_chunks: {
        Row: {
          id: string
          instrument_id: string
          content: string
          embedding: number[] | null
          chunk_index: number
          section_title: string | null
          page_start: number | null
          page_end: number | null
          metadata: Json
        }
        Insert: {
          id?: string
          instrument_id: string
          content: string
          embedding?: number[] | null
          chunk_index: number
          section_title?: string | null
          page_start?: number | null
          page_end?: number | null
          metadata?: Json
        }
        Update: {
          content?: string
          embedding?: number[] | null
          section_title?: string | null
          page_start?: number | null
          page_end?: number | null
          metadata?: Json
        }
      }
      chat_sessions: {
        Row: {
          id: string
          user_id: string
          instrument_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          instrument_id: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          instrument_id?: string
          updated_at?: string
        }
      }
      chat_messages: {
        Row: {
          id: string
          session_id: string
          role: 'user' | 'assistant'
          content: string
          highlighted_controls: string[]
          sources: Json
          created_at: string
        }
        Insert: {
          id?: string
          session_id: string
          role: 'user' | 'assistant'
          content: string
          highlighted_controls?: string[]
          sources?: Json
          created_at?: string
        }
        Update: {
          content?: string
          highlighted_controls?: string[]
          sources?: Json
        }
      }
    }
    Functions: {
      match_chunks: {
        Args: {
          query_embedding: number[]
          match_instrument_id: string
          match_count?: number
        }
        Returns: {
          id: string
          content: string
          section_title: string | null
          page_start: number | null
          similarity: number
        }[]
      }
    }
  }
}

export type Instrument = Database['public']['Tables']['instruments']['Row']
export type ChatSession = Database['public']['Tables']['chat_sessions']['Row']
export type ChatMessage = Database['public']['Tables']['chat_messages']['Row']
