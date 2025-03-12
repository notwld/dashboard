export interface User {
  id: number;
  name: string;
  email: string;
  department: string;
  role: {
    id: number;
    name: string;
  };
  avatar?: string;
}

export interface Attachment {
  id: string;
  message_id: string;
  file_name: string;
  file_size: number;
  file_type: string;
  url: string;
  created_at: string;
}

export interface Message {
  id: string;
  sender_id: number;
  receiver_id: number;
  conversation_id: string;
  content: string;
  created_at: string;
  read: boolean;
  reply_to?: string;
  edited: boolean;
  has_attachment?: boolean;
  attachments?: Attachment[];
}

export interface Conversation {
  id: string;
  participants: number[];
  created_at: string;
  updated_at: string;
  last_message?: Message;
} 