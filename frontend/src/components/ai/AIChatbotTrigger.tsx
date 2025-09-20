import React, { useState } from 'react';
import { MessageCircle, X } from 'lucide-react';
import { SmartAIChatbot } from './SmartAIChatbot';

interface AIChatbotTriggerProps {
  onServiceSelect?: (service: any) => void;
}

export const AIChatbotTrigger: React.FC<AIChatbotTriggerProps> = ({
  onServiceSelect
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Floating AI Chatbot Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 bg-ucsp-green-500 hover:bg-ucsp-green-600 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 z-40 group"
          title="Open AI Assistant"
        >
          <MessageCircle className="w-6 h-6 group-hover:scale-110 transition-transform duration-200" />
        </button>
      )}

      {/* AI Chatbot */}
      <SmartAIChatbot
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onServiceSelect={onServiceSelect}
      />
    </>
  );
};
