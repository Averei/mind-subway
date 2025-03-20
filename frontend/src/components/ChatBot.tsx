import { useState, useRef, useEffect } from 'react';
import type { Outlet } from '../types/outlet';

interface Props {
  outlets: Outlet[];
}

interface Message {
  text: string;
  isUser: boolean;
  timestamp: Date;
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export default function ChatBot({ outlets }: Props) {
  const [messages, setMessages] = useState<Message[]>([{
    text: `Hi! I can help you find information about ${outlets.length} Subway outlets in KL. Try asking:
    1. Which outlets close the latest?
    2. How many outlets are in Bangsar?`,
    isUser: false,
    timestamp: new Date()
  }]);
  const [input, setInput] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = input.trim();
    setInput('');
    
    // Add user message
    setMessages(prev => [...prev, {
      text: userMessage,
      isUser: true,
      timestamp: new Date()
    }]);

    try {
      const response = await fetch(`${API_URL}/api/chat/query`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage })
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      const data = await response.json();
      setMessages(prev => [...prev, {
        text: data.response,
        isUser: false,
        timestamp: new Date()
      }]);
    } catch (error) {
      console.error('Chat Error:', error);
      setMessages(prev => [...prev, {
        text: "Sorry, I'm having trouble connecting to the server.",
        isUser: false,
        timestamp: new Date()
      }]);
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 bg-blue-500 text-white p-4 rounded-full shadow-lg hover:bg-blue-600 z-50"
        aria-label="Open chat"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
        </svg>
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 w-96 h-[500px] bg-white rounded-lg shadow-xl flex flex-col z-50">
      <div className="p-4 bg-blue-500 text-white rounded-t-lg flex justify-between items-center">
        <h3 className="font-medium">Subway Assistant</h3>
        <button
          onClick={() => setIsOpen(false)}
          className="text-white hover:text-gray-200"
          aria-label="Close chat"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M4 10a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1z" clipRule="evenodd" />
          </svg>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex ${msg.isUser ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[75%] p-3 rounded-lg ${
                msg.isUser
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-800'
              }`}
            >
              <p className="whitespace-pre-wrap">{msg.text}</p>
              <span className="text-xs opacity-50 mt-1 block">
                {msg.timestamp.toLocaleTimeString()}
              </span>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSubmit} className="p-4 border-t">
        <div className="flex space-x-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about outlets..."
            className="flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
}