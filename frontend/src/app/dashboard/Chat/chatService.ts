import { supabase, Message, Conversation, Attachment } from '../../../lib/supabase';

// Get or create a conversation between two users
export const getOrCreateConversation = async (userId1: number, userId2: number): Promise<Conversation> => {
  // Check if conversation already exists
  const { data: existingConversation } = await supabase
    .from('conversations')
    .select('*')
    .contains('participants', [userId1, userId2])
    .single();

  if (existingConversation) {
    return existingConversation as Conversation;
  }

  // Create new conversation
  const { data: newConversation, error } = await supabase
    .from('conversations')
    .insert([
      {
        participants: [userId1, userId2],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
    ])
    .select()
    .single();

  if (error) throw error;
  return newConversation as Conversation;
};

// Send a message
export const sendMessage = async (
  conversationId: string, 
  message: { sender_id: number; receiver_id: number; content: string; reply_to?: string }
) => {
  const { data: newMessage, error } = await supabase
    .from('messages')
    .insert([
      {
        conversation_id: conversationId,
        ...message,
        created_at: new Date().toISOString(),
        read: false,
        edited: false,
      }
    ])
    .select()
    .single();

  if (error) throw error;

  // Update conversation's last_message and updated_at
  await supabase
    .from('conversations')
    .update({ 
      last_message: newMessage,
      updated_at: new Date().toISOString()
    })
    .eq('id', conversationId);

  return newMessage as Message;
};

// Edit a message
export const editMessage = async (messageId: string, newContent: string) => {
  const { data: updatedMessage, error } = await supabase
    .from('messages')
    .update({ 
      content: newContent,
      edited: true 
    })
    .eq('id', messageId)
    .select()
    .single();

  if (error) throw error;
  return updatedMessage as Message;
};

// Delete a message
export const deleteMessage = async (messageId: string) => {
  const { error } = await supabase
    .from('messages')
    .delete()
    .eq('id', messageId);

  if (error) throw error;
};

// Subscribe to messages in a conversation
export const subscribeToMessages = (conversationId: string, callback: (messages: Message[]) => void) => {
  const channel = supabase
    .channel(`messages:${conversationId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'messages',
        filter: `conversation_id=eq.${conversationId}`
      },
      async () => {
        // Fetch all messages when there's a change
        const { data } = await supabase
          .from('messages')
          .select(`
            *,
            attachments (
              id,
              message_id,
              file_name,
              file_size,
              file_type,
              url,
              created_at
            )
          `)
          .eq('conversation_id', conversationId)
          .order('created_at', { ascending: true });
        
        if (data) callback(data as Message[]);
      }
    )
    .subscribe();

  // Initial fetch of messages
  supabase
    .from('messages')
    .select(`
      *,
      attachments (
        id,
        message_id,
        file_name,
        file_size,
        file_type,
        url,
        created_at
      )
    `)
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true })
    .then(({ data }) => {
      if (data) callback(data as Message[]);
    });

  return channel;
};

// Subscribe to user conversations
export const subscribeToConversations = (userId: number, callback: (conversations: Conversation[]) => void) => {
  const channel = supabase
    .channel(`conversations:${userId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'conversations',
        filter: `participants=cs.{${userId}}`
      },
      async () => {
        // Fetch all conversations when there's a change
        const { data } = await supabase
          .from('conversations')
          .select('*')
          .contains('participants', [userId])
          .order('updated_at', { ascending: false });
        
        if (data) callback(data as Conversation[]);
      }
    )
    .subscribe();

  // Initial fetch of conversations
  supabase
    .from('conversations')
    .select('*')
    .contains('participants', [userId])
    .order('updated_at', { ascending: false })
    .then(({ data }) => {
      if (data) callback(data as Conversation[]);
    });

  return channel;
};

// Mark messages as read
export const markMessagesAsRead = async (conversationId: string, userId: number) => {
  const { error } = await supabase
    .from('messages')
    .update({ read: true })
    .eq('conversation_id', conversationId)
    .eq('receiver_id', userId)
    .eq('read', false);

  if (error) throw error;
};

// Upload a file to Supabase Storage
export const uploadFile = async (file: File): Promise<string> => {
  const fileExt = file.name.split('.').pop();
  const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
  const filePath = `attachments/${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from('chat-attachments')
    .upload(filePath, file);

  if (uploadError) throw uploadError;

  const { data: { publicUrl } } = supabase.storage
    .from('chat-attachments')
    .getPublicUrl(filePath);

  return publicUrl;
};

// Create an attachment record
export const createAttachment = async (
  messageId: string,
  file: File,
  url: string
): Promise<Attachment> => {
  const { data: attachment, error } = await supabase
    .from('attachments')
    .insert([
      {
        message_id: messageId,
        file_name: file.name,
        file_size: file.size,
        file_type: file.type,
        url: url,
        created_at: new Date().toISOString(),
      }
    ])
    .select()
    .single();

  if (error) throw error;
  return attachment as Attachment;
};

// Send a message with attachments
export const sendMessageWithAttachments = async (
  conversationId: string,
  message: { sender_id: number; receiver_id: number; content: string; reply_to?: string },
  files: File[]
) => {
  // First, create the message
  const { data: newMessage, error: messageError } = await supabase
    .from('messages')
    .insert([
      {
        conversation_id: conversationId,
        ...message,
        created_at: new Date().toISOString(),
        read: false,
        edited: false,
        has_attachment: true,
      }
    ])
    .select()
    .single();

  if (messageError) throw messageError;

  // Upload files and create attachment records
  await Promise.all(files.map(async (file) => {
    const url = await uploadFile(file);
    return createAttachment(newMessage.id, file, url);
  }));

  // Fetch the complete message with attachments
  const { data: messageWithAttachments } = await supabase
    .from('messages')
    .select(`
      *,
      attachments (
        id,
        message_id,
        file_name,
        file_size,
        file_type,
        url,
        created_at
      )
    `)
    .eq('id', newMessage.id)
    .single();

  // Update conversation's last_message and updated_at
  await supabase
    .from('conversations')
    .update({
      last_message: messageWithAttachments,
      updated_at: new Date().toISOString()
    })
    .eq('id', conversationId);

  return messageWithAttachments as Message;
};

// Get attachments for a message
export const getMessageAttachments = async (messageId: string): Promise<Attachment[]> => {
  const { data: attachments, error } = await supabase
    .from('attachments')
    .select('*')
    .eq('message_id', messageId)
    .order('created_at', { ascending: true });

  if (error) throw error;
  return attachments as Attachment[];
};

// Delete an attachment
export const deleteAttachment = async (attachmentId: string) => {
  const { error } = await supabase
    .from('attachments')
    .delete()
    .eq('id', attachmentId);

  if (error) throw error;
}; 