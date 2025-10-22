export type AssistantChatProps = {
  universityId: string;
  userId: string;
  user: {
    name: string;
    avatar: string;
  };
  onError?: (error: Error) => void;
};

export type ChatMessage = {
  id: string;
  content: string;
  chatId: string;
  userId: string | null; // Allow null for AI messages
  senderId: string | null; // Allow null for AI messages
  direction: 'inbound' | 'outgoing';
  createdAt: string;
  updatedAt: string;
};

export type Chat = {
  id: string;
  name: string;
  userId: string;
  universityId: string;
  createdAt: string;
  updatedAt: string;
};

export type AssistantRuntimeConfig = {
  universityId: string;
  userId: string;
  apiEndpoint: string;
  onError?: (error: Error) => void;
};
