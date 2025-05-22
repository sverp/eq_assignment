import React, { useEffect, useRef } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import MessageInput from "./MessageInput";
import MessageList from "./MessageList";
import ChatHeader from "./ChatHeader";
import { Message } from "@/context/MessagingContext";

type ChatAreaProps = {
  messages: Message[];
  chatId: string;
  chatName: string;
  isGroup: boolean;
  onSendMessage: (message: string) => void;
};

const ChatArea = ({
  messages,
  chatName,
  isGroup,
  onSendMessage,
}: ChatAreaProps) => {
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollArea = scrollAreaRef.current;
      scrollArea.scrollTop = scrollArea.scrollHeight;
    }
  }, [messages]);

  return (
    <div className="flex flex-col h-full">
      <ChatHeader chatName={chatName} isGroup={isGroup} />
      <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
        <MessageList messages={messages} />
      </ScrollArea>
      <MessageInput onSendMessage={onSendMessage} />
    </div>
  );
};

export default ChatArea;
