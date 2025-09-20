import React, { createContext, useContext, useState, ReactNode } from 'react';

interface AIChatbotContextType {
  isOpen: boolean;
  openChatbot: () => void;
  closeChatbot: () => void;
  toggleChatbot: () => void;
}

const AIChatbotContext = createContext<AIChatbotContextType | undefined>(undefined);

export const useAIChatbot = () => {
  const context = useContext(AIChatbotContext);
  if (!context) {
    throw new Error('useAIChatbot must be used within an AIChatbotProvider');
  }
  return context;
};

interface AIChatbotProviderProps {
  children: ReactNode;
}

export const AIChatbotProvider: React.FC<AIChatbotProviderProps> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);

  const openChatbot = () => setIsOpen(true);
  const closeChatbot = () => setIsOpen(false);
  const toggleChatbot = () => setIsOpen(prev => !prev);

  return (
    <AIChatbotContext.Provider value={{
      isOpen,
      openChatbot,
      closeChatbot,
      toggleChatbot
    }}>
      {children}
    </AIChatbotContext.Provider>
  );
};
