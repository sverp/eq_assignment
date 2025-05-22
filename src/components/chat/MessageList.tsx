import { useUser } from "@/context/UserContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { format } from "date-fns";
import { Message } from "@/context/MessagingContext";

type MessageListProps = {
  messages: Message[];
};

const MessageList = ({ messages }: MessageListProps) => {
  const { currentUser } = useUser();

  if (messages.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">No messages yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {messages.map((message) => {
        const isOwn = message.sender.id === currentUser?.id;

        return (
          <div
            key={message.id}
            className={`flex ${
              isOwn ? "justify-end" : "justify-start"
            } message-appear`}
          >
            <div
              className={`flex ${
                isOwn ? "flex-row-reverse" : "flex-row"
              } items-start gap-2 max-w-[80%]`}
            >
              {!isOwn && (
                <Avatar className="h-8 w-8">
                  <AvatarImage
                    src={message.sender.avatar}
                    alt={message.sender.username}
                  />
                  <AvatarFallback>
                    {message.sender.username.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              )}
              <div>
                <div
                  className={`flex items-center gap-2 ${
                    isOwn ? "justify-end" : "justify-start"
                  } mb-1`}
                >
                  {!isOwn && (
                    <span className="text-sm font-medium">
                      {message.sender.username}
                    </span>
                  )}
                  <span className="text-xs text-muted-foreground">
                    {format(message.timestamp, "p")}
                  </span>
                </div>
                <div
                  className={`rounded-lg px-4 py-2 ${
                    isOwn
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary"
                  }`}
                >
                  <p className="text-sm">{message.content}</p>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default MessageList;
