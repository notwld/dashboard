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
  subscribeToMessages, 
  subscribeToConversations, 
  markMessagesAsRead,
  editMessage,
  deleteMessage,
  sendMessageWithAttachments
} from './chatService';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../../../components/ui/Dropdown/dropdown';
import { MoreHorizontal, Reply, Edit, Trash2, Paperclip, X, Download, FileIcon } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../../components/ui/Modal/dialog';
import { baseurl } from '../../../config/baseurl';
import { formatBytes } from '../../../lib/utils';

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
  const [editingMessage, setEditingMessage] = useState<Message | null>(null);
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editContent, setEditContent] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

    const channel = subscribeToConversations(currentUser.id, (newConversations) => {
      setConversations(newConversations);
    });

    return () => {
      channel.unsubscribe();
    };
  }, [currentUser]);

  // Listen to messages when current conversation is set
  useEffect(() => {
    if (!currentConversation) return;

    const channel = subscribeToMessages(currentConversation.id, (newMessages) => {
      setMessages(newMessages);
    });

    return () => {
      channel.unsubscribe();
    };
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

  // Handle editing a message
  const handleEditMessage = async () => {
    if (!editingMessage || !editContent.trim()) return;
    
    try {
      await editMessage(editingMessage.id, editContent);
      setEditingMessage(null);
      setEditContent('');
      setEditDialogOpen(false);
    } catch (error) {
      console.error('Error editing message:', error);
      toast({
        title: 'Error',
        description: 'Failed to edit message',
        variant: 'destructive',
      });
    }
  };

  // Handle deleting a message
  const handleDeleteMessage = async (message: Message) => {
    try {
      await deleteMessage(message.id);
      toast({
        title: 'Success',
        description: 'Message deleted',
        variant: 'default',
      });
    } catch (error) {
      console.error('Error deleting message:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete message',
        variant: 'destructive',
      });
    }
  };

  // Handle file selection
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setSelectedFiles(prev => [...prev, ...files]);
  };

  // Handle file removal
  const handleFileRemove = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  // Handle sending a message
  const handleSendMessage = async () => {
    if ((!newMessage.trim() && selectedFiles.length === 0) || !currentUser || !selectedUser || !currentConversation) return;
    
    try {
      if (selectedFiles.length > 0) {
        await sendMessageWithAttachments(currentConversation.id, {
          sender_id: currentUser.id,
          receiver_id: selectedUser.id,
          content: newMessage,
          reply_to: replyingTo?.id,
        }, selectedFiles);
      } else {
        await sendMessage(currentConversation.id, {
          sender_id: currentUser.id,
          receiver_id: selectedUser.id,
          content: newMessage,
          reply_to: replyingTo?.id,
        });
      }
      
      setNewMessage('');
      setReplyingTo(null);
      setSelectedFiles([]);
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
                const hasUnread = conversation.last_message && 
                  !conversation.last_message.read && 
                  conversation.last_message.receiver_id === currentUser?.id;
                
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
                        {conversation.last_message && (
                          <span className="text-xs text-muted-foreground">
                            {formatDate(new Date(conversation.updated_at))}
                          </span>
                        )}
                      </div>
                      {conversation.last_message && (
                        <p className={`text-sm truncate ${hasUnread ? 'font-semibold' : 'text-muted-foreground'}`}>
                          {conversation.last_message.sender_id === currentUser?.id ? 'You: ' : ''}
                          {conversation.last_message.content}
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
                    const isCurrentUser = currentUser && message.sender_id === currentUser.id;
                    const sender = getUserById(message.sender_id);
                    const replyToMessage = message.reply_to ? messages.find(m => m.id === message.reply_to) : null;
                    
                    const showDateSeparator = index === 0 || 
                      new Date(messages[index - 1].created_at).toDateString() !== 
                      new Date(message.created_at).toDateString();
                    
                    return (
                      <React.Fragment key={message.id}>
                        {showDateSeparator && (
                          <div className="flex justify-center my-4">
                            <div className="bg-muted px-3 py-1 rounded-full text-xs text-muted-foreground">
                              {formatDate(new Date(message.created_at))}
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
                              {replyToMessage && (
                                <div className="mb-1 text-sm text-muted-foreground">
                                  <div className="flex items-center gap-1">
                                    <Reply className="h-3 w-3" />
                                    <span>Replying to {getUserById(replyToMessage.sender_id)?.name}</span>
                                  </div>
                                  <div className="pl-4 border-l-2 border-muted-foreground/30">
                                    {replyToMessage.content}
                                  </div>
                                </div>
                              )}
                              
                              <div className="group relative">
                                <Card className={`p-3 ${
                                  isCurrentUser 
                                    ? 'bg-primary text-primary-foreground' 
                                    : 'bg-muted'
                                }`}>
                                  <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
                                  {message.edited && (
                                    <span className="text-xs opacity-70">(edited)</span>
                                  )}
                                  
                                  {/* Attachments */}
                                  {message.has_attachment && message.attachments && message.attachments.length > 0 && (
                                    <div className="mt-2 space-y-2">
                                      {message.attachments.map((attachment) => (
                                        <div
                                          key={attachment.id}
                                          className="flex items-center gap-2 p-2 rounded-md bg-background/10"
                                        >
                                          <FileIcon className="h-4 w-4" />
                                          <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium truncate">
                                              {attachment.file_name}
                                            </p>
                                            <p className="text-xs opacity-70">
                                              {formatBytes(attachment.file_size)}
                                            </p>
                                          </div>
                                          <a
                                            href={attachment.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="p-1 hover:bg-background/20 rounded"
                                            onClick={(e) => e.stopPropagation()}
                                          >
                                            <Download className="h-4 w-4" />
                                          </a>
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </Card>
                                
                                <div className={`absolute top-0 ${isCurrentUser ? 'left-0 -translate-x-full' : 'right-0 translate-x-full'} opacity-0 group-hover:opacity-100 transition-opacity`}>
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button variant="ghost" size="icon" className="h-8 w-8">
                                        <MoreHorizontal className="h-4 w-4" />
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align={isCurrentUser ? "end" : "start"}>
                                      <DropdownMenuItem onClick={() => setReplyingTo(message)}>
                                        <Reply className="h-4 w-4 mr-2" />
                                        Reply
                                      </DropdownMenuItem>
                                      {isCurrentUser && (
                                        <>
                                          <DropdownMenuItem onClick={() => {
                                            setEditingMessage(message);
                                            setEditContent(message.content);
                                            setEditDialogOpen(true);
                                          }}>
                                            <Edit className="h-4 w-4 mr-2" />
                                            Edit
                                          </DropdownMenuItem>
                                          <DropdownMenuItem 
                                            onClick={() => handleDeleteMessage(message)}
                                            className="text-destructive"
                                          >
                                            <Trash2 className="h-4 w-4 mr-2" />
                                            Delete
                                          </DropdownMenuItem>
                                        </>
                                      )}
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                </div>
                              </div>
                              
                              <div className={`text-xs mt-1 text-muted-foreground ${
                                isCurrentUser ? 'text-right' : ''
                              }`}>
                                {formatTime(new Date(message.created_at))}
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
              {replyingTo && (
                <div className="mb-2 p-2 bg-muted rounded-lg flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Reply className="h-4 w-4" />
                    <span className="text-sm">
                      Replying to {getUserById(replyingTo.sender_id)?.name}
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setReplyingTo(null)}
                  >
                    Cancel
                  </Button>
                </div>
              )}
              {/* Selected files */}
              {selectedFiles.length > 0 && (
                <div className="mb-2 space-y-2">
                  {selectedFiles.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 p-2 rounded-md bg-muted"
                    >
                      <FileIcon className="h-4 w-4" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{file.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatBytes(file.size)}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleFileRemove(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
              <div className="flex space-x-2">
                <div className="flex-1 flex flex-col space-y-2">
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
                  <div className="flex items-center gap-2">
                    <input
                      type="file"
                      ref={fileInputRef}
                      className="hidden"
                      multiple
                      onChange={handleFileSelect}
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Paperclip className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <Button 
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim() && selectedFiles.length === 0}
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

      {/* Edit Message Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Message</DialogTitle>
          </DialogHeader>
          <Textarea
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            className="min-h-[100px]"
          />
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setEditDialogOpen(false);
                setEditingMessage(null);
                setEditContent('');
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleEditMessage}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
