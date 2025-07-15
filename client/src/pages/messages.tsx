import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import AppLayout from "@/layouts/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Hash, Lock, Users, Plus, Send, Smile, Paperclip, MoreVertical, ArrowLeft, MessageCircle } from "lucide-react";
import type { Channel, Message } from "@shared/schema";

interface MessagesPageProps {}

export default function MessagesPage({}: MessagesPageProps) {
  const { user, currentRole } = useAuth();
  const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null);
  const [messageContent, setMessageContent] = useState("");
  const [showNewChannelDialog, setShowNewChannelDialog] = useState(false);
  const [showChannelList, setShowChannelList] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch user channels
  const { data: channels = [] } = useQuery<Channel[]>({
    queryKey: ['/api/channels/my'],
    enabled: !!user,
  });

  // Fetch messages for selected channel
  const { data: messages = [] } = useQuery<Message[]>({
    queryKey: ['/api/channels', selectedChannel?.id, 'messages'],
    enabled: !!selectedChannel?.id,
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (data: { channelId: string; content: string }) => {
      return apiRequest('/api/messages', {
        method: 'POST',
        body: data,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/channels', selectedChannel?.id, 'messages'] });
      setMessageContent("");
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      });
    },
  });

  // Create channel mutation
  const createChannelMutation = useMutation({
    mutationFn: async (data: { name: string; type: string; schoolId?: string }) => {
      return apiRequest('/api/channels', {
        method: 'POST',
        body: data,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/channels/my'] });
      setShowNewChannelDialog(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create channel",
        variant: "destructive",
      });
    },
  });

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Select first channel by default
  useEffect(() => {
    if (channels.length > 0 && !selectedChannel) {
      setSelectedChannel(channels[0]);
    }
  }, [channels, selectedChannel]);

  const handleSendMessage = () => {
    if (!messageContent.trim() || !selectedChannel) return;
    
    sendMessageMutation.mutate({
      channelId: selectedChannel.id,
      content: messageContent.trim(),
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const getChannelIcon = (type: string) => {
    switch (type) {
      case 'public':
        return <Hash className="h-4 w-4" />;
      case 'private':
        return <Lock className="h-4 w-4" />;
      case 'dm':
        return <Users className="h-4 w-4" />;
      default:
        return <Hash className="h-4 w-4" />;
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffDays === 1) {
      return 'Yesterday ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else {
      return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
  };

  const getUserInitials = (message: any) => {
    if (message.senderName) {
      const names = message.senderName.split(' ');
      return names.length > 1 
        ? (names[0][0] + names[1][0]).toUpperCase()
        : names[0].substring(0, 2).toUpperCase();
    }
    return message.senderId.substring(0, 2).toUpperCase();
  };

  const getUserDisplayName = (message: any) => {
    return message.senderName || `User ${message.senderId.substring(0, 8)}`;
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <AppLayout user={user} currentRole={currentRole}>
      <div className="flex h-[calc(100vh-8rem)] lg:h-[calc(100vh-4rem)] bg-white dark:bg-gray-900">
        {/* Channel List - Mobile: Full screen, Desktop: Sidebar */}
        <div className={`${
          showChannelList ? 'flex' : 'hidden'
        } lg:flex w-full lg:w-80 bg-gray-50 dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex-col`}>
          {/* Header */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <h1 className="text-xl lg:text-lg font-semibold text-gray-900 dark:text-white">Messages</h1>
              <Dialog open={showNewChannelDialog} onOpenChange={setShowNewChannelDialog}>
                <DialogTrigger asChild>
                  <Button size="sm" variant="ghost">
                    <Plus className="h-5 w-5 lg:h-4 lg:w-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create New Channel</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 pt-4">
                    <Input placeholder="Channel name" />
                    <Button 
                      onClick={() => createChannelMutation.mutate({ 
                        name: "New Channel", 
                        type: "public" 
                      })}
                      disabled={createChannelMutation.isPending}
                    >
                      Create Channel
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {/* Channels List */}
          <ScrollArea className="flex-1">
            <div className="p-2 space-y-2">
              {channels.map((channel) => (
                <div
                  key={channel.id}
                  onClick={() => {
                    setSelectedChannel(channel);
                    setShowChannelList(false); // Hide channel list on mobile when selecting
                  }}
                  className={`flex items-center gap-3 p-4 lg:p-3 rounded-lg cursor-pointer transition-colors ${
                    selectedChannel?.id === channel.id
                      ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200'
                      : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  {getChannelIcon(channel.type)}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-base lg:text-sm truncate">
                        {channel.name || `${channel.type} channel`}
                      </span>
                      <Badge variant="secondary" className="ml-2 text-xs">
                        {channel.type}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 truncate mt-1">
                      Tap to open conversation
                    </p>
                  </div>
                </div>
              ))}
              
              {channels.length === 0 && (
                <div className="text-center py-8">
                  <MessageCircle className="h-12 w-12 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
                  <p className="text-gray-600 dark:text-gray-400">No channels yet</p>
                  <p className="text-sm text-gray-500 dark:text-gray-500">Create a channel to start messaging</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </div>

        {/* Main Chat Area */}
        {selectedChannel ? (
          <div className={`${
            showChannelList ? 'hidden' : 'flex'
          } lg:flex flex-1 flex-col w-full`}>
            {/* Chat Header */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {/* Back button for mobile */}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="lg:hidden"
                    onClick={() => setShowChannelList(true)}
                  >
                    <ArrowLeft className="h-5 w-5" />
                  </Button>
                  {getChannelIcon(selectedChannel.type)}
                  <div>
                    <h2 className="font-semibold text-lg lg:text-base text-gray-900 dark:text-white">
                      {selectedChannel.name || `${selectedChannel.type} channel`}
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {selectedChannel.type === 'public' ? 'Public channel' : 
                       selectedChannel.type === 'private' ? 'Private channel' : 'Direct message'}
                    </p>
                  </div>
                </div>
                <Button variant="ghost" size="sm">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Messages Area */}
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {messages.length === 0 ? (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    <Hash className="h-12 w-12 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
                    <p className="text-lg font-medium">No messages yet</p>
                    <p>Start the conversation by sending a message!</p>
                  </div>
                ) : (
                  messages.map((message) => (
                    <div key={message.id} className="flex gap-3">
                      <Avatar className="h-8 w-8 mt-1">
                        <AvatarFallback className="text-xs">
                          {getUserInitials(message)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-gray-900 dark:text-white">
                            {getUserDisplayName(message)}
                          </span>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {formatTime(message.sentAt || message.createdAt)}
                          </span>
                          {message.isUrgent && (
                            <Badge variant="destructive" className="text-xs">
                              Urgent
                            </Badge>
                          )}
                          {message.isPinned && (
                            <Badge variant="secondary" className="text-xs">
                              Pinned
                            </Badge>
                          )}
                        </div>
                        <div className="text-gray-800 dark:text-gray-200 whitespace-pre-wrap">
                          {message.content}
                        </div>
                      </div>
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* Message Input */}
            <div className="p-3 lg:p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
              <div className="flex gap-3 items-end">
                <div className="flex-1 relative">
                  <Textarea
                    value={messageContent}
                    onChange={(e) => setMessageContent(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder={`Message ${selectedChannel.name || 'this channel'}...`}
                    className="min-h-[48px] lg:min-h-[44px] max-h-32 resize-none pr-16 lg:pr-20 dark:bg-gray-800 dark:border-gray-600 text-base lg:text-sm rounded-xl"
                    rows={1}
                  />
                  <div className="absolute right-2 bottom-2 flex gap-1">
                    <Button variant="ghost" size="sm" className="h-7 w-7 lg:h-6 lg:w-6 p-0">
                      <Smile className="h-5 w-5 lg:h-4 lg:w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" className="h-7 w-7 lg:h-6 lg:w-6 p-0">
                      <Paperclip className="h-5 w-5 lg:h-4 lg:w-4" />
                    </Button>
                  </div>
                </div>
                <Button
                  onClick={handleSendMessage}
                  disabled={!messageContent.trim() || sendMessageMutation.isPending}
                  className="h-12 w-12 lg:h-10 lg:w-10 p-0 rounded-full"
                  size="sm"
                >
                  <Send className="h-5 w-5 lg:h-4 lg:w-4" />
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className={`${
            showChannelList ? 'hidden' : 'flex'
          } lg:flex flex-1 items-center justify-center bg-gray-50 dark:bg-gray-800`}>
            <div className="text-center px-4">
              <MessageCircle className="h-16 w-16 mx-auto text-gray-300 dark:text-gray-600" />
              <Button 
                onClick={() => setShowChannelList(true)}
                className="lg:hidden mt-4"
                variant="outline"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to channels
              </Button>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}