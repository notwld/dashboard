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

export interface Message {
  id: string;
  senderId: number;
  receiverId: number;
  content: string;
  timestamp: Date;
  read: boolean;
}

export interface Conversation {
  id: string;
  participants: number[];
  lastMessage?: Message;
  updatedAt: Date;
} 