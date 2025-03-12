import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://hxltrbreivwvaxomnoes.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh4bHRyYnJlaXZ3dmF4b21ub2VzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE3ODEwNjksImV4cCI6MjA1NzM1NzA2OX0.VtfGx18C8w6Ro9T1Hw6Jm0oTF8m3_nspNqbeio_SOk8";
            
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Types for the messages table
export type Attachment = {
  id: string;
  message_id: string;
  file_name: string;
  file_size: number;
  file_type: string;
  url: string;
  created_at: string;
};

export type Message = {
  id: string;
  sender_id: number;
  receiver_id: number;
  conversation_id: string;
  content: string;
  created_at: string;
  read: boolean;
  reply_to?: string;
  edited: boolean;
  has_attachment: boolean;
  attachments?: Attachment[];
};

// Types for the conversations table
export type Conversation = {
  id: string;
  participants: number[];
  created_at: string;
  updated_at: string;
  last_message?: Message;
}; 