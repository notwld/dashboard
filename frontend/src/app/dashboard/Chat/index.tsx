import React, { useState, useEffect, useRef } from 'react';
import { useToast } from '../../../hooks/use-toaster';
import { Avatar } from '../../../components/ui/avatar';
import { Button } from '../../../components/ui/button';
import { Card } from '../../../components/ui/card';
import { ScrollArea } from '../../../components/ui/scroll-area';
import { Textarea } from '../../../components/ui/textarea';
import { User, Message, Conversation } from './types';
import { 
  getOrCreateConversation, 
  sendMessage, 
  listenToMessages, 
  listenToConversations, 
  markMessagesAsRead 
} from './chatService';

import { baseurl } from '../../../config/baseurl';

export default function Chat() {
  const [users, setUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversation, setCurrentConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Fetch current user and all users
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;

        const res = await fetch(`${baseurl}/user/profile`, {
          method: 'GET',
          headers: {
            'x-access-token': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        
        if (!res.ok) throw new Error('Failed to fetch current user');
        
        const data = await res.json();
        setCurrentUser(data);
      } catch (error) {
        console.error('Error fetching current user:', error);
        toast({
          title: 'Error',
          description: 'Failed to fetch your profile',
          variant: 'destructive',
        });
      }
    };

    const fetchUsers = async () => {
      try {
        setIsLoading(true);
        const token = localStorage.getItem('token');
        if (!token) return;

        const res = await fetch(`${baseurl}/user/get-users`, {
          method: 'GET',
          headers: {
            'x-access-token': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        
        if (!res.ok) throw new Error('Failed to fetch users');
        
        const data = await res.json();
        setUsers(data);
      } catch (error) {
        console.error('Error fetching users:', error);
        toast({
          title: 'Error',
          description: 'Failed to fetch users',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchCurrentUser();
    fetchUsers();
  }, [toast]);

  // Listen to conversations when current user is set
  useEffect(() => {
    if (!currentUser) return;

    const unsubscribe = listenToConversations(currentUser.id, (newConversations) => {
      setConversations(newConversations);
    });

    return () => unsubscribe();
  }, [currentUser]);

  // Listen to messages when current conversation is set
  useEffect(() => {
    if (!currentConversation) return;

    const unsubscribe = listenToMessages(currentConversation.id, (newMessages) => {
      setMessages(newMessages);
    });

    return () => unsubscribe();
  }, [currentConversation]);

  // Mark messages as read when conversation changes
  useEffect(() => {
    if (!currentUser || !currentConversation) return;

    markMessagesAsRead(currentConversation.id, currentUser.id);
  }, [currentUser, currentConversation, messages]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Handle selecting a user to chat with
  const handleSelectUser = async (user: User) => {
    if (!currentUser) return;
    
    setSelectedUser(user);
    setIsLoading(true);
    
    try {
      const conversation = await getOrCreateConversation(currentUser.id, user.id);
      setCurrentConversation(conversation);
    } catch (error) {
      console.error('Error getting conversation:', error);
      toast({
        title: 'Error',
        description: 'Failed to load conversation',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle selecting a conversation
  const handleSelectConversation = async (conversation: Conversation) => {
    setCurrentConversation(conversation);
    
    // Find the other participant
    if (!currentUser) return;
    
    const otherParticipantId = conversation.participants.find(id => id !== currentUser.id);
    if (!otherParticipantId) return;
    
    const otherUser = users.find(user => user.id === otherParticipantId);
    if (otherUser) {
      setSelectedUser(otherUser);
    }
  };

  // Handle sending a message
  const handleSendMessage = async () => {
    if (!newMessage.trim() || !currentUser || !selectedUser || !currentConversation) return;
    
    try {
      await sendMessage(currentConversation.id, {
        senderId: currentUser.id,
        receiverId: selectedUser.id,
        content: newMessage,
        read: false,
      });
      
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: 'Error',
        description: 'Failed to send message',
        variant: 'destructive',
      });
    }
  };

  // Get user by ID
  const getUserById = (userId: number) => {
    return users.find(user => user.id === userId);
  };

  // Format timestamp
  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  // Format date
  const formatDate = (date: Date) => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
      }).format(date);
    }
  };

  return (
    <div className="flex h-[calc(100vh-4rem)] overflow-hidden">
      {/* Left sidebar - Conversations */}
      <div className="w-80 border-r flex flex-col bg-background">
        <div className="p-4 border-b flex items-center justify-between">
          <h2 className="text-xl font-semibold">Messages</h2>
          {isLoading && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>}
        </div>
        
        <ScrollArea className="flex-1">
          {conversations.length > 0 ? (
            <div className="space-y-1 p-2">
              {conversations.map((conversation) => {
                const otherParticipantId = conversation.participants.find(id => currentUser && id !== currentUser.id);
                const otherUser = otherParticipantId ? getUserById(otherParticipantId) : null;
                
                if (!otherUser) return null;
                
                const isSelected = currentConversation?.id === conversation.id;
                const hasUnread = conversation.lastMessage && 
                  !conversation.lastMessage.read && 
                  conversation.lastMessage.receiverId === currentUser?.id;
                
                return (
                  <div
                    key={conversation.id}
                    className={`flex items-center p-3 rounded-lg cursor-pointer hover:bg-accent/50 ${
                      isSelected ? 'bg-accent' : ''
                    }`}
                    onClick={() => handleSelectConversation(conversation)}
                  >
                    <Avatar className="h-10 w-10 mr-3">
                      <div className="bg-primary text-primary-foreground rounded-full h-full w-full flex items-center justify-center">
                        {otherUser.name.charAt(0)}
                      </div>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center">
                        <p className="font-medium truncate">{otherUser.name}</p>
                        {conversation.lastMessage && (
                          <span className="text-xs text-muted-foreground">
                            {formatDate(conversation.updatedAt)}
                          </span>
                        )}
                      </div>
                      {conversation.lastMessage && (
                        <p className={`text-sm truncate ${hasUnread ? 'font-semibold' : 'text-muted-foreground'}`}>
                          {conversation.lastMessage.senderId === currentUser?.id ? 'You: ' : ''}
                          {conversation.lastMessage.content}
                        </p>
                      )}
                    </div>
                    {hasUnread && (
                      <div className="ml-2 h-2 w-2 bg-primary rounded-full"></div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-4 text-center text-muted-foreground">
              No conversations yet
            </div>
          )}
        </ScrollArea>
      </div>
      
      {/* Middle - Chat */}
      <div className="flex-1 flex flex-col">
        {selectedUser ? (
          <>
            {/* Chat header */}
            <div className="p-4 border-b flex items-center">
              <Avatar className="h-10 w-10 mr-3">
                <div className="bg-primary text-primary-foreground rounded-full h-full w-full flex items-center justify-center">
                  {selectedUser.name.charAt(0)}
                </div>
              </Avatar>
              <div>
                <h2 className="text-lg font-semibold">{selectedUser.name}</h2>
                <p className="text-sm text-muted-foreground">{selectedUser.department}</p>
              </div>
            </div>
            
            {/* Messages */}
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {messages.length > 0 ? (
                  messages.map((message, index) => {
                    const isCurrentUser = currentUser && message.senderId === currentUser.id;
                    const sender = getUserById(message.senderId);
                    
                    const showDateSeparator = index === 0 || 
                      new Date(messages[index - 1].timestamp).toDateString() !== 
                      new Date(message.timestamp).toDateString();
                    
                    return (
                      <React.Fragment key={message.id}>
                        {showDateSeparator && (
                          <div className="flex justify-center my-4">
                            <div className="bg-muted px-3 py-1 rounded-full text-xs text-muted-foreground">
                              {formatDate(message.timestamp)}
                            </div>
                          </div>
                        )}
                        
                        <div className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}>
                          <div className={`flex items-start max-w-[70%] ${isCurrentUser ? 'flex-row-reverse' : 'flex-row'}`}>
                            {!isCurrentUser && (
                              <Avatar className="h-8 w-8 mx-2 flex-shrink-0">
                                <div className="bg-primary text-primary-foreground rounded-full h-full w-full flex items-center justify-center">
                                  {sender?.name.charAt(0) || '?'}
                                </div>
                              </Avatar>
                            )}
                            
                            <div>
                              <Card className={`p-3 ${
                                isCurrentUser 
                                  ? 'bg-primary text-primary-foreground' 
                                  : 'bg-muted'
                              }`}>
                                <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
                              </Card>
                              <div className={`text-xs mt-1 text-muted-foreground ${
                                isCurrentUser ? 'text-right' : ''
                              }`}>
                                {formatTime(message.timestamp)}
                                {isCurrentUser && (
                                  <span className="ml-1">
                                    {message.read ? '• Read' : ''}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </React.Fragment>
                    );
                  })
                ) : (
                  <div className="h-full flex items-center justify-center text-muted-foreground">
                    <p>No messages yet. Start the conversation!</p>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>
            
            {/* Message input */}
            <div className="p-4 border-t">
              <div className="flex space-x-2">
                <Textarea
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 min-h-[80px] max-h-[160px]"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                />
                <Button 
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim()}
                  className="self-end"
                >
                  Send
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="h-full flex items-center justify-center text-muted-foreground">
            <div className="text-center">
              <h3 className="text-lg font-medium mb-2">Select a conversation</h3>
              <p>Choose a user from the sidebar to start chatting</p>
            </div>
          </div>
        )}
      </div>

      {/* Right sidebar - Users list */}
      <div className="w-80 border-l flex flex-col bg-background">
        <div className="p-4 border-b">
          <h3 className="text-xl font-semibold">DMs</h3>
        </div>
        <ScrollArea className="flex-1">
          <div className="p-4 space-y-2">
            {users
              .filter(user => currentUser && user.id !== currentUser.id)
              .map(user => (
                <div
                  key={user.id}
                  className="flex items-center p-3 rounded-lg cursor-pointer hover:bg-accent/50"
                  onClick={() => handleSelectUser(user)}
                >
                  <Avatar className="h-10 w-10 mr-3">
                    <div className="bg-primary text-primary-foreground rounded-full h-full w-full flex items-center justify-center">
                      {user.name.charAt(0)}
                    </div>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{user.name}</p>
                    <p className="text-sm text-muted-foreground truncate">{user.department}</p>
                  </div>
                </div>
              ))}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
