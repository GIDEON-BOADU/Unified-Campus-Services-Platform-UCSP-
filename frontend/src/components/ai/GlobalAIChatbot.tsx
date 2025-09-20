import React from 'react';
import { useAIChatbot } from '../../contexts/AIChatbotContext';
import { SmartAIChatbot } from './SmartAIChatbot';

export const GlobalAIChatbot: React.FC = () => {
  const { isOpen, closeChatbot } = useAIChatbot();

  return (
    <SmartAIChatbot
      isOpen={isOpen}
      onClose={closeChatbot}
      onServiceSelect={(service) => {
        // Handle service selection - could navigate to service detail or open modal
        console.log('Service selected:', service);
      }}
    />
  );
};
