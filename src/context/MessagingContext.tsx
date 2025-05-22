import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
  useRef,
} from "react";
import { useUser } from "./UserContext";

export type Message = {
  id: string;
  content: string;
  sender: {
    id: string;
    username: string;
    avatar?: string;
  };
  timestamp: Date;
};

export type Chat = {
  id: string;
  name: string;
  lastMessage?: string;
  isGroup: boolean;
  unread: number;
  avatar?: string;
};

interface MessagingContextType {
  directChats: Chat[];
  groupChats: Chat[];
  selectedChat: string | null;
  messages: Message[];
  setDirectChats: React.Dispatch<React.SetStateAction<Chat[]>>;
  setGroupChats: React.Dispatch<React.SetStateAction<Chat[]>>;
  setSelectedChat: React.Dispatch<React.SetStateAction<string | null>>;
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  handleSendMessage: (message: string) => void;
  handleChatSelect: (chatId: string) => void;
  handleAddDirectMessage: (username: string) => void;
  handleAddGroupChat: (name: string, members: string[]) => void;
  currentChat: Chat | undefined;
  connectionStatus: "connected" | "connecting" | "disconnected";
}

const MessagingContext = createContext<MessagingContextType | undefined>(
  undefined
);

export const useMessaging = () => {
  const context = useContext(MessagingContext);
  if (!context) {
    throw new Error("useMessaging must be used within a MessagingProvider");
  }
  return context;
};

type WebSocketEventType =
  | "SEND_MESSAGE"
  | "NEW_MESSAGE"
  | "ADD_DIRECT_CHAT"
  | "ADD_GROUP_CHAT"
  | "READ_MESSAGES"
  | "FETCH_INITIAL_DATA";

interface WebSocketEvent {
  type: WebSocketEventType;
  payload: any;
}

export const MessagingProvider = ({ children }: { children: ReactNode }) => {
  const [directChats, setDirectChats] = useState<Chat[]>([]);
  const [groupChats, setGroupChats] = useState<Chat[]>([]);
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [connectionStatus, setConnectionStatus] = useState<
    "connected" | "connecting" | "disconnected"
  >("disconnected");
  const { currentUser } = useUser();
  const wsRef = useRef<WebSocket | null>(null);

  const [chatMessages, setChatMessages] = useState<Map<string, Message[]>>(
    new Map()
  );

  const currentChat = [...directChats, ...groupChats].find(
    (chat) => chat.id === selectedChat
  );

  useEffect(() => {
    if (!currentUser) return;

    const connectWebSocket = () => {
      setConnectionStatus("connecting");
      const wsUrl = "ws://localhost:8000/";
      const ws = new WebSocket(`${wsUrl}?userId=${currentUser.id}`);
      wsRef.current = ws;

      ws.onopen = () => {
        setConnectionStatus("connected");

        sendWsEvent({
          type: "FETCH_INITIAL_DATA",
          payload: { userId: currentUser.id, username: currentUser.username },
        });
      };

      ws.onmessage = (event) => {
        try {
          const data: WebSocketEvent = JSON.parse(event.data);

          handleWebSocketMessage(data);
        } catch (error) {
          console.error("Error parsing WebSocket message:", error);
        }
      };

      ws.onerror = (error) => {
        console.error("WebSocket error:", error);
        setConnectionStatus("disconnected");
      };

      ws.onclose = () => {
        setConnectionStatus("disconnected");

        setTimeout(() => {
          if (currentUser) {
            connectWebSocket();
          }
        }, 3000);
      };
    };

    connectWebSocket();

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [currentUser]);

  const sendWsEvent = (event: WebSocketEvent) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(event));
    } else {
      console.warn("WebSocket not connected. Cannot send event:", event);
    }
  };

  const handleWebSocketMessage = (event: WebSocketEvent) => {
    switch (event.type) {
      case "NEW_MESSAGE":
        handleIncomingMessage(event.payload);
        break;
      case "ADD_DIRECT_CHAT":
        addDirectChatFromServer(event.payload);
        break;
      case "ADD_GROUP_CHAT":
        addGroupChatFromServer(event.payload);
        break;
      default:
    }
  };
  const handleIncomingMessage = (messageData: any) => {
    const { chatId: incomingChatId, message } = messageData;
    const processedMessage: Message = {
      ...message,
      timestamp: new Date(message.timestamp),
    };

    let allMessagesForIncomingChat: Message[] = [];
    setChatMessages((prevChatMessages) => {
      const newMap = new Map(prevChatMessages);
      const existingMessages = newMap.get(incomingChatId) || [];
      allMessagesForIncomingChat = [...existingMessages, processedMessage];
      newMap.set(incomingChatId, allMessagesForIncomingChat);
      return newMap;
    });

    if (selectedChat !== incomingChatId) {
      setSelectedChat(incomingChatId);
    }

    setMessages(allMessagesForIncomingChat);

    if (currentUser) {
      sendWsEvent({
        type: "READ_MESSAGES",
        payload: {
          chatId: incomingChatId,
          userId: currentUser.id,
        },
      });
    }

    const updateChatDetails = (chat: Chat): Chat => {
      if (chat.id === incomingChatId) {
        return {
          ...chat,
          lastMessage:
            processedMessage.content.length > 30
              ? `${processedMessage.content.substring(0, 30)}...`
              : processedMessage.content,
          unread: 0,
        };
      }
      return chat;
    };

    setDirectChats((prevDirectChats) => prevDirectChats.map(updateChatDetails));
    setGroupChats((prevGroupChats) => prevGroupChats.map(updateChatDetails));
  };

  const addDirectChatFromServer = (chatData: Chat) => {
    setDirectChats((prev) => {
      if (prev.some((chat) => chat.id === chatData.id)) {
        return prev;
      }
      return [...prev, chatData];
    });

    setChatMessages((prev) => {
      const newMap = new Map(prev);
      if (!newMap.has(chatData.id)) {
        newMap.set(chatData.id, []);
      }
      return newMap;
    });
  };

  const addGroupChatFromServer = (chatData: Chat) => {
    setGroupChats((prev) => {
      if (prev.some((chat) => chat.id === chatData.id)) {
        return prev;
      }
      return [...prev, chatData];
    });

    setChatMessages((prev) => {
      const newMap = new Map(prev);
      if (!newMap.has(chatData.id)) {
        newMap.set(chatData.id, []);
      }
      return newMap;
    });
  };

  const handleChatSelect = (chatId: string) => {
    setSelectedChat(chatId);
    const selectedChatMessages = chatMessages.get(chatId) || [];
    setMessages(selectedChatMessages);

    setDirectChats((prev) =>
      prev.map((chat) => (chat.id === chatId ? { ...chat, unread: 0 } : chat))
    );
    setGroupChats((prev) =>
      prev.map((chat) => (chat.id === chatId ? { ...chat, unread: 0 } : chat))
    );

    if (currentUser) {
      sendWsEvent({
        type: "READ_MESSAGES",
        payload: {
          chatId,
          userId: currentUser.id,
        },
      });
    }
  };

  const handleSendMessage = (message: string) => {
    if (!currentUser || !message.trim() || !selectedChat) return;

    const newMessage = {
      id: `msg-${Date.now()}`,
      content: message,
      sender: {
        id: currentUser.id,
        username: currentUser.username,
        avatar: currentUser.avatar,
      },
      timestamp: new Date(),
    };

    setMessages((prevMessages) => [...prevMessages, newMessage]);

    setChatMessages((prevChatMessages) => {
      const newMap = new Map(prevChatMessages);
      const existingMessages = newMap.get(selectedChat) || [];
      newMap.set(selectedChat, [...existingMessages, newMessage]);
      return newMap;
    });

    if (currentChat) {
      const updatedChat = {
        ...currentChat,
        lastMessage:
          message.length > 30 ? `${message.substring(0, 30)}...` : message,
      };

      if (currentChat.isGroup) {
        setGroupChats((prev) =>
          prev.map((chat) => (chat.id === currentChat.id ? updatedChat : chat))
        );
      } else {
        setDirectChats((prev) =>
          prev.map((chat) => (chat.id === currentChat.id ? updatedChat : chat))
        );
      }
    }

    sendWsEvent({
      type: "SEND_MESSAGE",
      payload: {
        chatId: selectedChat,
        message: newMessage,
      },
    });
  };

  const handleAddDirectMessage = (username: string) => {
    if (!currentUser) return;

    const tempChatId = `temp-chat-${Date.now()}`;
    const newChat = {
      id: tempChatId,
      name: username,
      lastMessage: "",
      isGroup: false,
      unread: 0,
    };

    setDirectChats((prevChats) => [...prevChats, newChat]);
    setSelectedChat(tempChatId);
    setMessages([]);

    setChatMessages((prevChatMessages) => {
      const newMap = new Map(prevChatMessages);
      newMap.set(tempChatId, []);
      return newMap;
    });

    sendWsEvent({
      type: "ADD_DIRECT_CHAT",
      payload: {
        userId: currentUser.id,
        username: currentUser.username,
        recipientUsername: username,
        tempChatId,
      },
    });
  };

  const handleAddGroupChat = (name: string, members: string[]) => {
    if (!currentUser) return;

    const tempGroupId = `temp-group-${Date.now()}`;
    const newGroup = {
      id: tempGroupId,
      name,
      lastMessage: "",
      isGroup: true,
      unread: 0,
    };

    setGroupChats((prevGroups) => [...prevGroups, newGroup]);
    setSelectedChat(tempGroupId);
    setMessages([]);

    setChatMessages((prevChatMessages) => {
      const newMap = new Map(prevChatMessages);
      newMap.set(tempGroupId, []);
      return newMap;
    });
    sendWsEvent({
      type: "ADD_GROUP_CHAT",
      payload: {
        createdBy: currentUser.id,
        username: currentUser.username,
        name,
        members,
        tempGroupId,
      },
    });
  };

  const value = {
    directChats,
    groupChats,
    selectedChat,
    messages,
    setDirectChats,
    setGroupChats,
    setSelectedChat,
    setMessages,
    handleSendMessage,
    handleChatSelect,
    handleAddDirectMessage,
    handleAddGroupChat,
    currentChat,
    connectionStatus,
    chatMessages,
  };

  return (
    <MessagingContext.Provider value={value}>
      {children}
    </MessagingContext.Provider>
  );
};
