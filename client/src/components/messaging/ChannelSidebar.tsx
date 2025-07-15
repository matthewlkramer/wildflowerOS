import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Hash, Lock, Users, Settings, Archive, Trash2, MoreVertical, ChevronDown, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { Channel } from "@shared/schema";
import { useAuth } from "@/hooks/useAuth";

interface ChannelSidebarProps {
  selectedChannel: Channel | null;
  onChannelSelect: (channel: Channel) => void;
  onClose?: () => void;
}

interface ChannelGroup {
  title: string;
  channels: Channel[];
  icon: React.ReactNode;
  canCreate: boolean;
  defaultType: string;
  scope: string;
}

export default function ChannelSidebar({ selectedChannel, onChannelSelect, onClose }: ChannelSidebarProps) {
  const { user, currentRole } = useAuth();
  const [showNewChannelDialog, setShowNewChannelDialog] = useState(false);
  const [newChannelData, setNewChannelData] = useState({
    name: "",
    msgDisplayName: "",
    description: "",
    type: "public" as const,
    scope: "school" as const
  });
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({
    foundation: true,
    teacher: true,
    school: true,
    classroom: true
  });
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch user channels
  const { data: channels = [] } = useQuery<Channel[]>({
    queryKey: ['/api/channels/my'],
    enabled: !!user,
  });

  // Create channel mutation
  const createChannelMutation = useMutation({
    mutationFn: async (data: typeof newChannelData) => {
      return apiRequest('/api/channels', {
        method: 'POST',
        body: data,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/channels/my'] });
      setShowNewChannelDialog(false);
      setNewChannelData({
        name: "",
        msgDisplayName: "",
        description: "",
        type: "public",
        scope: "school"
      });
      toast({
        title: "Success",
        description: "Channel created successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create channel",
        variant: "destructive",
      });
    },
  });

  // Archive channel mutation
  const archiveChannelMutation = useMutation({
    mutationFn: async (channelId: string) => {
      return apiRequest(`/api/channels/${channelId}/archive`, {
        method: 'POST',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/channels/my'] });
      toast({
        title: "Success",
        description: "Channel archived successfully",
      });
    },
  });

  // Delete channel mutation
  const deleteChannelMutation = useMutation({
    mutationFn: async (channelId: string) => {
      return apiRequest(`/api/channels/${channelId}`, {
        method: 'DELETE',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/channels/my'] });
      toast({
        title: "Success",
        description: "Channel deleted successfully",
      });
    },
  });

  // Group channels by category
  const channelGroups: ChannelGroup[] = [
    {
      title: "Foundation",
      channels: channels.filter(c => c.scope === "network" && c.name.startsWith("foundation-")),
      icon: <Users className="h-4 w-4" />,
      canCreate: currentRole?.includes("sysadmin") || false,
      defaultType: "public",
      scope: "network"
    },
    {
      title: "Teacher Channels",
      channels: channels.filter(c => c.scope === "network" && !c.name.startsWith("foundation-")),
      icon: <Hash className="h-4 w-4" />,
      canCreate: currentRole?.includes("educator") || false,
      defaultType: "public", 
      scope: "network"
    },
    {
      title: "School Channels",
      channels: channels.filter(c => c.scope === "school"),
      icon: <Hash className="h-4 w-4" />,
      canCreate: currentRole?.includes("educator") || false,
      defaultType: "public",
      scope: "school"
    },
    {
      title: "Classroom Channels",
      channels: channels.filter(c => c.scope === "classroom"),
      icon: <Lock className="h-4 w-4" />,
      canCreate: currentRole?.includes("educator") || false,
      defaultType: "private",
      scope: "classroom"
    }
  ];

  const toggleGroup = (groupTitle: string) => {
    setExpandedGroups(prev => ({
      ...prev,
      [groupTitle.toLowerCase()]: !prev[groupTitle.toLowerCase()]
    }));
  };

  const handleCreateChannel = () => {
    createChannelMutation.mutate(newChannelData);
  };

  const getChannelIcon = (channel: Channel) => {
    if (channel.type === "private") return <Lock className="h-3 w-3" />;
    if (channel.scope === "classroom") return <Users className="h-3 w-3" />;
    return <Hash className="h-3 w-3" />;
  };

  const getChannelDisplayName = (channel: Channel) => {
    // For school-specific channels, we would use school.msgDisplayName + channel suffix
    // For now, just use the channel name
    return channel.name;
  };

  return (
    <div className="w-64 border-r bg-background flex flex-col">
      <div className="p-4 border-b">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-lg">Channels</h2>
          <Dialog open={showNewChannelDialog} onOpenChange={setShowNewChannelDialog}>
            <DialogTrigger asChild>
              <Button size="sm" variant="ghost">
                <Plus className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Channel</DialogTitle>
                <DialogDescription>
                  Create a new channel for team communication
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="channel-name">Channel Name</Label>
                  <Input
                    id="channel-name"
                    placeholder="e.g., wildrose-primary"
                    value={newChannelData.name}
                    onChange={(e) => setNewChannelData(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="channel-display-name">Display Name</Label>
                  <Input
                    id="channel-display-name"
                    placeholder="e.g., Wildrose Primary"
                    value={newChannelData.msgDisplayName}
                    onChange={(e) => setNewChannelData(prev => ({ ...prev, msgDisplayName: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="channel-description">Description</Label>
                  <Textarea
                    id="channel-description"
                    placeholder="What is this channel for?"
                    value={newChannelData.description}
                    onChange={(e) => setNewChannelData(prev => ({ ...prev, description: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="channel-type">Type</Label>
                  <Select value={newChannelData.type} onValueChange={(value) => setNewChannelData(prev => ({ ...prev, type: value as any }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="public">Public</SelectItem>
                      <SelectItem value="private">Private</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="channel-scope">Scope</Label>
                  <Select value={newChannelData.scope} onValueChange={(value) => setNewChannelData(prev => ({ ...prev, scope: value as any }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="network">Network-wide</SelectItem>
                      <SelectItem value="school">School</SelectItem>
                      <SelectItem value="classroom">Classroom</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button 
                  onClick={handleCreateChannel}
                  disabled={!newChannelData.name || createChannelMutation.isPending}
                  className="w-full"
                >
                  {createChannelMutation.isPending ? "Creating..." : "Create Channel"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-2">
          {channelGroups.map((group) => (
            <div key={group.title} className="mb-4">
              <div 
                className="flex items-center justify-between py-2 px-2 hover:bg-accent rounded cursor-pointer"
                onClick={() => toggleGroup(group.title)}
              >
                <div className="flex items-center gap-2">
                  {expandedGroups[group.title.toLowerCase()] ? 
                    <ChevronDown className="h-3 w-3" /> : 
                    <ChevronRight className="h-3 w-3" />
                  }
                  {group.icon}
                  <span className="text-sm font-medium">{group.title}</span>
                  <Badge variant="secondary" className="text-xs">
                    {group.channels.length}
                  </Badge>
                </div>
                {group.canCreate && (
                  <Button 
                    size="sm" 
                    variant="ghost"
                    onClick={(e) => {
                      e.stopPropagation();
                      setNewChannelData(prev => ({ 
                        ...prev, 
                        type: group.defaultType as any, 
                        scope: group.scope as any 
                      }));
                      setShowNewChannelDialog(true);
                    }}
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                )}
              </div>

              {expandedGroups[group.title.toLowerCase()] && (
                <div className="ml-4 space-y-1">
                  {group.channels.map((channel) => (
                    <div 
                      key={channel.id}
                      className={`flex items-center justify-between p-2 rounded hover:bg-accent cursor-pointer ${
                        selectedChannel?.id === channel.id ? 'bg-accent' : ''
                      }`}
                      onClick={() => onChannelSelect(channel)}
                    >
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        {getChannelIcon(channel)}
                        <span className="text-sm truncate">{getChannelDisplayName(channel)}</span>
                        {channel.isArchived && (
                          <Badge variant="outline" className="text-xs">Archived</Badge>
                        )}
                      </div>
                      
                      {(channel.canDelete || channel.canArchive) && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
                              <MoreVertical className="h-3 w-3" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => {}}>
                              <Settings className="h-3 w-3 mr-2" />
                              Settings
                            </DropdownMenuItem>
                            {channel.canArchive && (
                              <DropdownMenuItem onClick={() => archiveChannelMutation.mutate(channel.id)}>
                                <Archive className="h-3 w-3 mr-2" />
                                Archive
                              </DropdownMenuItem>
                            )}
                            {channel.canDelete && (
                              <>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem 
                                  onClick={() => deleteChannelMutation.mutate(channel.id)}
                                  className="text-destructive"
                                >
                                  <Trash2 className="h-3 w-3 mr-2" />
                                  Delete
                                </DropdownMenuItem>
                              </>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </div>
                  ))}
                  
                  {group.channels.length === 0 && (
                    <div className="text-sm text-muted-foreground p-2">
                      No channels yet
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}