import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "../ui/sidebar";
type ChatHeaderProps = {
  chatName: string;
  isGroup: boolean;
  avatar?: string;
};

const ChatHeader = ({ chatName, isGroup, avatar }: ChatHeaderProps) => {
  return (
    <div className="border-b border-border p-3 flex justify-between items-center">
      <div className="flex items-center gap-3">
        <div className="md:hidden">
          <SidebarTrigger />
        </div>
        <Avatar>
          <AvatarImage src={avatar} />
          <AvatarFallback>
            {isGroup ? "G" : chatName.substring(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div>
          <h2 className="font-semibold">{chatName}</h2>
          <p className="text-xs text-muted-foreground">
            {isGroup ? "Group Chat" : "Direct Message"}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ChatHeader;
