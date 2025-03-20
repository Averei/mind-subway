import React, { useState, useRef, useEffect } from 'react';
import { RAGService } from '../services/ragService';
import type { Outlet } from '../types/outlet';

interface Props {
  outlets: Outlet[];
}

interface Message {
  text: string;
  isUser: boolean;
  timestamp: Date;
}

export default function ChatBox({ outlets }: Props) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [modelStatus, setModelStatus] = useState('Loading AI model...');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [rag, setRag] = useState<RAGService | null>(null);

  useEffect(() => {
    initializeRAG();
  }, []);

  const initializeRAG = async () => {
    try {
      const ragService = await RAGService.getInstance();
      await ragService.indexDocuments(outlets);
      setRag(ragService);
      setModelStatus('AI Ready');
      
      // Add welcome message
      setMessages([{
        text: "Hello! I can help you find information about Subway outlets in KL. Try asking about closing times or specific locations!",
        isUser: false,
        timestamp: new Date()
      }]);
    } catch (error) {
      console.error('RAG Init Error:', error);
      setModelStatus('Error initializing AI model');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !rag) return;

    const userMessage = input.trim();
    setInput('');
    setIsLoading(true);

    // Add user message
    setMessages(prev => [...prev, {
      text: userMessage,
      isUser: true,
      timestamp: new Date()
    }]);

    try {
      const response = await rag.processQuery(userMessage, outlets);
      setMessages(prev => [...prev, {
        text: response,
        isUser: false,
        timestamp: new Date()
      }]);
    } catch (error) {
      console.error('Query Error:', error);
      setMessages(prev => [...prev, {
        text: "I apologize, but I'm having trouble processing your request.",
        isUser: false,
        timestamp: new Date()
      }]);
    }

    setIsLoading(false);
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="w-96 h-[500px] bg-white rounded-lg shadow-lg flex flex-col">
      <div className="p-3 border-b bg-blue-500 text-white rounded-t-lg">
        <h3 className="text-sm font-medium">Subway Assistant</h3>
        <p className="text-xs opacity-75">{modelStatus}</p>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((m, i) => (
          <div
            key={i}
            className={`flex ${m.isUser ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] p-2 rounded-lg ${
                m.isUser
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-800'
              }`}
            >
              <p className="text-sm whitespace-pre-wrap">{m.text}</p>
              <span className="text-xs opacity-50 mt-1 block">
                {m.timestamp.toLocaleTimeString()}
              </span>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSubmit} className="p-3 border-t">
        <div className="flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about outlets..."
            disabled={isLoading || !rag}
            className="flex-1 text-sm px-3 py-2 border rounded-md focus:ring-1 focus:ring-blue-500"
          />
          <button
            type="submit"
            disabled={isLoading || !rag}
            className="px-3 py-2 bg-blue-500 text-white text-sm rounded-md 
              hover:bg-blue-600 disabled:opacity-50"
          >
            {isLoading ? '...' : 'Send'}
          </button>
        </div>
      </form>
    </div>
  );
}