import React, { useState } from "react";
import {
  SidebarProvider,
  Sidebar,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import ChatSidebar from "../sidebar/ChatSidebar";
import ChatArea from "./ChatArea";
import { useUser } from "@/context/UserContext";
import AuthForm from "../auth/AuthForm";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { MessageSquare, Users } from "lucide-react";
import NewDirectMessageDialog from "../dialogs/NewDirectMessageDialog";
import NewGroupChatDialog from "../dialogs/NewGroupChatDialog";
import { MessagingProvider, useMessaging } from "@/context/MessagingContext";

const ChatContent = () => {
  const { isAuthenticated } = useUser();
  const {
    directChats,
    groupChats,
    selectedChat,
    messages,
    handleSendMessage,
    handleChatSelect,
    handleAddDirectMessage,
    handleAddGroupChat,
    currentChat,
  } = useMessaging();

  const [showAuthDialog, setShowAuthDialog] = useState(!isAuthenticated);
  const [showNewDirectMessageDialog, setShowNewDirectMessageDialog] =
    useState(false);
  const [showNewGroupChatDialog, setShowNewGroupChatDialog] = useState(false);

  const handleNewChat = () => {
    setShowNewDirectMessageDialog(true);
  };

  const handleNewGroup = () => {
    setShowNewGroupChatDialog(true);
  };

  if (!isAuthenticated) {
    return (
      <Dialog open={showAuthDialog} onOpenChange={setShowAuthDialog}>
        <DialogContent className="sm:max-w-md" hideCloseButton={true}>
          <AuthForm onClose={() => setShowAuthDialog(false)} />
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex min-h-screen bg-background w-full">
        <Sidebar className="border-r border-border">
          <ChatSidebar
            directChats={directChats}
            groupChats={groupChats}
            onChatSelect={handleChatSelect}
            onNewChat={handleNewChat}
            onNewGroup={handleNewGroup}
            selectedChatId={selectedChat || undefined}
          />
        </Sidebar>
        <div className="flex-1 flex flex-col">
          {currentChat ? (
            <ChatArea
              chatId={currentChat.id}
              chatName={currentChat.name}
              isGroup={currentChat.isGroup}
              messages={messages}
              onSendMessage={handleSendMessage}
            />
          ) : (
            <div className="flex flex-col items-center justify-center h-full p-6 text-center">
              <p className="text-xl font-medium mb-6">
                Start a new conversation
              </p>
              <div className="flex gap-4 flex-col md:flex-row">
                <Button
                  onClick={handleNewChat}
                  className="flex items-center gap-2"
                >
                  <MessageSquare className="h-4 w-4" />
                  New Direct Message
                </Button>
                <Button
                  onClick={handleNewGroup}
                  className="flex items-center gap-2"
                >
                  <Users className="h-4 w-4" />
                  New Group Chat
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      <NewDirectMessageDialog
        open={showNewDirectMessageDialog}
        onOpenChange={setShowNewDirectMessageDialog}
        onAddChat={handleAddDirectMessage}
      />

      <NewGroupChatDialog
        open={showNewGroupChatDialog}
        onOpenChange={setShowNewGroupChatDialog}
        onAddGroup={handleAddGroupChat}
      />
    </SidebarProvider>
  );
};

const ChatLayout = () => {
  return (
    <MessagingProvider>
      <ChatContent />
    </MessagingProvider>
  );
};

export default ChatLayout;
