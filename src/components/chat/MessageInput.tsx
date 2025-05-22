
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { SendIcon } from "lucide-react";

type MessageInputProps = {
  onSendMessage: (message: string) => void;
};

const MessageInput = ({ onSendMessage }: MessageInputProps) => {
  const [message, setMessage] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (message.trim()) {
      onSendMessage(message);
      setMessage("");
    }
  };

  return (
    <form 
      onSubmit={handleSubmit} 
      className="border-t border-border p-4 flex gap-2 items-center"
    >
      <input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Type your message..."
        className="flex-1 px-4 py-2 bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
        aria-label="Message input"
      />
      <Button type="submit" size="icon" aria-label="Send message">
        <SendIcon className="h-5 w-5" />
      </Button>
    </form>
  );
};

export default MessageInput;
