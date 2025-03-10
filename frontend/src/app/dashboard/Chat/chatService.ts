import { 
  collection, 
  addDoc, 
  query, 
  where, 
  orderBy, 
  onSnapshot, 
  doc, 
  updateDoc, 
  serverTimestamp, 
  getDocs
} from 'firebase/firestore';
import { db } from './firebase';
import { Message, Conversation } from './types';

// Get or create a conversation between two users
export const getOrCreateConversation = async (userId1: number, userId2: number) => {
  // Check if conversation already exists
  const conversationsRef = collection(db, 'conversations');
  const q = query(
    conversationsRef,
    where('participants', 'array-contains', userId1)
  );

  const querySnapshot = await getDocs(q);
  let existingConversation: Conversation | null = null;

  querySnapshot.forEach((doc) => {
    const data = doc.data();
    if (data.participants.includes(userId2)) {
      existingConversation = { 
        id: doc.id, 
        participants: data.participants,
        updatedAt: data.updatedAt?.toDate() || new Date(),
        lastMessage: data.lastMessage ? {
          id: data.lastMessage.id || '',
          senderId: data.lastMessage.senderId,
          receiverId: data.lastMessage.receiverId,
          content: data.lastMessage.content,
          timestamp: data.lastMessage.timestamp?.toDate() || new Date(),
          read: data.lastMessage.read || false,
        } : undefined
      };
    }
  });

  if (existingConversation) {
    return existingConversation;
  }

  // Create new conversation
  const newConversation = {
    participants: [userId1, userId2],
    updatedAt: serverTimestamp(),
  };

  const docRef = await addDoc(conversationsRef, newConversation);
  return { 
    id: docRef.id, 
    participants: newConversation.participants,
    updatedAt: new Date()
  };
};

// Send a message
export const sendMessage = async (conversationId: string, message: Omit<Message, 'id' | 'timestamp'>) => {
  const messagesRef = collection(db, 'conversations', conversationId, 'messages');
  
  const newMessage = {
    ...message,
    timestamp: serverTimestamp(),
  };

  const docRef = await addDoc(messagesRef, newMessage);
  
  // Update the conversation's last message and timestamp
  const conversationRef = doc(db, 'conversations', conversationId);
  await updateDoc(conversationRef, {
    lastMessage: newMessage,
    updatedAt: serverTimestamp(),
  });

  return { id: docRef.id, ...newMessage };
};

// Listen to messages in a conversation
export const listenToMessages = (conversationId: string, callback: (messages: Message[]) => void) => {
  const messagesRef = collection(db, 'conversations', conversationId, 'messages');
  const q = query(messagesRef, orderBy('timestamp', 'asc'));

  return onSnapshot(q, (querySnapshot) => {
    const messages: Message[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      messages.push({
        id: doc.id,
        senderId: data.senderId,
        receiverId: data.receiverId,
        content: data.content,
        timestamp: data.timestamp?.toDate() || new Date(),
        read: data.read || false,
      });
    });
    callback(messages);
  });
};

// Listen to user conversations
export const listenToConversations = (userId: number, callback: (conversations: Conversation[]) => void) => {
  const conversationsRef = collection(db, 'conversations');
  const q = query(
    conversationsRef,
    where('participants', 'array-contains', userId),
    orderBy('updatedAt', 'desc')
  );

  return onSnapshot(q, (querySnapshot) => {
    const conversations: Conversation[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      conversations.push({
        id: doc.id,
        participants: data.participants,
        lastMessage: data.lastMessage ? {
          id: data.lastMessage.id || '',
          senderId: data.lastMessage.senderId,
          receiverId: data.lastMessage.receiverId,
          content: data.lastMessage.content,
          timestamp: data.lastMessage.timestamp?.toDate() || new Date(),
          read: data.lastMessage.read || false,
        } : undefined,
        updatedAt: data.updatedAt?.toDate() || new Date(),
      });
    });
    callback(conversations);
  });
};

// Mark messages as read
export const markMessagesAsRead = async (conversationId: string, userId: number) => {
  const messagesRef = collection(db, 'conversations', conversationId, 'messages');
  const q = query(
    messagesRef,
    where('receiverId', '==', userId),
    where('read', '==', false)
  );

  const querySnapshot = await getDocs(q);
  
  const batch = [];
  querySnapshot.forEach((document) => {
    const messageRef = doc(db, 'conversations', conversationId, 'messages', document.id);
    batch.push(updateDoc(messageRef, { read: true }));
  });

  await Promise.all(batch);
}; 