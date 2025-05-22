import React from "react";
import {
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import ThemeToggle from "../ThemeToggle";
import { useUser } from "@/context/UserContext";

type Chat = {
  id: string;
  name: string;
  lastMessage?: string;
  avatar?: string;
  isGroup: boolean;
  unread: number;
};

type ChatSidebarProps = {
  directChats: Chat[];
  groupChats: Chat[];
  onChatSelect: (chatId: string) => void;
  onNewChat: () => void;
  onNewGroup: () => void;
  selectedChatId?: string;
};

const ChatSidebar = ({
  directChats,
  groupChats,
  onChatSelect,
  onNewChat,
  onNewGroup,
  selectedChatId,
}: ChatSidebarProps) => {
  const { currentUser } = useUser();

  return (
    <SidebarContent>
      <div className="p-3 flex items-center justify-between">
        <div className="flex flex-row items-center">
          <Avatar>
            <AvatarFallback>
              {currentUser.username.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <h1 className="ml-2 text-lg font-bold">
            {currentUser.username.length > 12
              ? currentUser.username.substring(0, 12) + "..."
              : currentUser.username}
          </h1>{" "}
        </div>

        <div className="px-4 py-2 md:hidden">
          <SidebarTrigger />
        </div>
      </div>

      <SidebarGroup>
        <ThemeToggle />

        <div className="px-3 pb-2 flex justify-between items-center">
          <SidebarGroupLabel>Direct Messages</SidebarGroupLabel>
          <Button
            variant="ghost"
            size="icon"
            onClick={onNewChat}
            aria-label="New direct message"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        <SidebarGroupContent>
          <SidebarMenu>
            {directChats.length > 0 ? (
              directChats.map((chat) => (
                <SidebarMenuItem key={chat.id}>
                  <SidebarMenuButton
                    isActive={chat.id === selectedChatId}
                    onClick={() => onChatSelect(chat.id)}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-md"
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={chat.avatar} />
                      <AvatarFallback>
                        {chat.name.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 truncate text-left">
                      <div className="flex justify-between">
                        <span className="font-medium">{chat.name}</span>
                        {chat.unread > 0 && (
                          <span className="bg-primary text-primary-foreground text-xs px-2 rounded-full">
                            {chat.unread}
                          </span>
                        )}
                      </div>
                      {chat.lastMessage && (
                        <p className="text-xs text-muted-foreground truncate">
                          {chat.lastMessage}
                        </p>
                      )}
                    </div>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))
            ) : (
              <div className="px-3 py-2 text-sm text-muted-foreground">
                No direct messages yet. Click the + button to start a chat.
              </div>
            )}
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>

      <SidebarGroup>
        <div className="px-3 pb-2 flex justify-between items-center">
          <SidebarGroupLabel>Group Chats</SidebarGroupLabel>
          <Button
            variant="ghost"
            size="icon"
            onClick={onNewGroup}
            aria-label="New group chat"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        <SidebarGroupContent>
          <SidebarMenu>
            {groupChats.length > 0 ? (
              groupChats.map((chat) => (
                <SidebarMenuItem key={chat.id}>
                  <SidebarMenuButton
                    isActive={chat.id === selectedChatId}
                    onClick={() => onChatSelect(chat.id)}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-md"
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={chat.avatar} />
                      <AvatarFallback>
                        {chat.name.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 truncate text-left">
                      <div className="flex justify-between">
                        <span className="font-medium">{chat.name}</span>
                      </div>
                      {chat.lastMessage && (
                        <p className="text-xs text-muted-foreground truncate">
                          {chat.lastMessage}
                        </p>
                      )}
                    </div>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))
            ) : (
              <div className="px-3 py-2 text-sm text-muted-foreground">
                No group chats yet. Click the + button to create a group.
              </div>
            )}
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
    </SidebarContent>
  );
};

export default ChatSidebar;
