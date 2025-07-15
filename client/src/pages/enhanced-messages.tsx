import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Send, Smile, Paperclip, ArrowLeft, Hash, Lock, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import AppLayout from "@/layouts/AppLayout";
import ChannelSidebar from "@/components/messaging/ChannelSidebar";
import type { Channel, Message } from "@shared/schema";

export default function EnhancedMessagesPage() {
  const { user, currentRole } = useAuth();
  const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null);
  const [messageContent, setMessageContent] = useState("");
  const [showChannelList, setShowChannelList] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

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

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

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

  const getChannelIcon = (channel: Channel) => {
    if (channel.type === "private") return <Lock className="h-4 w-4" />;
    if (channel.scope === "classroom") return <Users className="h-4 w-4" />;
    return <Hash className="h-4 w-4" />;
  };

  const getChannelDisplayName = (channel: Channel) => {
    // For school-specific channels, we would use school.msgDisplayName + channel suffix
    // For now, just use the channel name
    return channel.name;
  };

  const getUserInitials = (message: Message) => {
    // In a real app, you'd fetch user data
    return "U";
  };

  const getUserDisplayName = (message: Message) => {
    // In a real app, you'd fetch user data
    return "User";
  };

  const formatTime = (date: Date | null) => {
    if (!date) return "";
    return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <AppLayout>
      <div className="flex h-[calc(100vh-4rem)] bg-background">
        {/* Channel Sidebar */}
        <div className={`${showChannelList ? 'flex' : 'hidden'} lg:flex`}>
          <ChannelSidebar
            selectedChannel={selectedChannel}
            onChannelSelect={(channel) => {
              setSelectedChannel(channel);
              setShowChannelList(false); // Hide sidebar on mobile after selection
            }}
          />
        </div>

        {/* Main Chat Area */}
        {selectedChannel ? (
          <div className={`${showChannelList ? 'hidden' : 'flex'} lg:flex flex-1 flex-col`}>
            {/* Chat Header */}
            <div className="p-4 border-b bg-card">
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
                  {getChannelIcon(selectedChannel)}
                  <div>
                    <h2 className="font-semibold text-lg lg:text-base">
                      {getChannelDisplayName(selectedChannel)}
                    </h2>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    {selectedChannel.scope}
                  </Badge>
                  {selectedChannel.isArchived && (
                    <Badge variant="secondary" className="text-xs">
                      Archived
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            {/* Messages Area */}
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {messages.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Hash className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
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
                          <span className="font-medium">
                            {getUserDisplayName(message)}
                          </span>
                          <span className="text-xs text-muted-foreground">
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
                        <div className="whitespace-pre-wrap">
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
            <div className="p-4 border-t bg-card">
              <div className="flex gap-2">
                <Button variant="ghost" size="sm">
                  <Paperclip className="h-4 w-4" />
                </Button>
                <div className="flex-1 relative">
                  <Textarea
                    value={messageContent}
                    onChange={(e) => setMessageContent(e.target.value)}
                    onKeyDown={handleKeyPress}
                    placeholder={`Message ${getChannelDisplayName(selectedChannel)}`}
                    className="min-h-[40px] max-h-[120px] resize-none pr-12"
                    rows={1}
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={!messageContent.trim() || sendMessageMutation.isPending}
                    size="sm"
                    className="absolute right-2 bottom-2 h-8 w-8 p-0"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
                <Button variant="ghost" size="sm">
                  <Smile className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className={`${showChannelList ? 'hidden' : 'flex'} lg:flex flex-1 items-center justify-center`}>
            <div className="text-center text-muted-foreground">
              <Hash className="h-16 w-16 mx-auto mb-4 text-muted-foreground/50" />
              <p className="text-xl font-medium mb-2">Select a channel</p>
              <p>Choose a channel from the sidebar to start messaging</p>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}