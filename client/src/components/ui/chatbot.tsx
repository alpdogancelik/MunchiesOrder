import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MessageCircle, X, Send, User, Bot } from "lucide-react";

interface ChatMessage {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

interface ChatbotProps {
  userType: 'student' | 'restaurant' | 'courier';
}

export function Chatbot({ userType }: ChatbotProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      text: getUserTypeGreeting(userType),
      sender: 'bot',
      timestamp: new Date()
    }
  ]);
  const [inputText, setInputText] = useState('');

  function getUserTypeGreeting(type: string): string {
    switch (type) {
      case 'restaurant':
        return 'Hello! I\'m here to help with restaurant management, orders, and menu questions.';
      case 'courier':
        return 'Hi courier! I can help you with delivery questions, navigation, and earnings.';
      default:
        return 'Welcome to Munchies! How can I help you with your food ordering experience?';
    }
  }

  const sendMessage = async () => {
    if (!inputText.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      text: inputText,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');

    // Simulate AI response
    setTimeout(() => {
      const botMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        text: getAIResponse(inputText, userType),
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botMessage]);
    }, 1000);
  };

  function getAIResponse(input: string, type: string): string {
    const lowerInput = input.toLowerCase();
    
    // Common responses
    if (lowerInput.includes('order') && lowerInput.includes('status')) {
      return 'You can track your order status in real-time. Check the "Active Orders" section for updates.';
    }
    if (lowerInput.includes('payment')) {
      return 'We accept cash on delivery, card at door, and online payments through iyzico.';
    }
    if (lowerInput.includes('delivery')) {
      return 'Delivery typically takes 20-45 minutes depending on restaurant and location.';
    }

    // User type specific responses
    if (type === 'restaurant') {
      if (lowerInput.includes('menu')) {
        return 'You can manage your menu items in the Menu Management section. Add, edit, or remove items anytime.';
      }
      if (lowerInput.includes('courier')) {
        return 'You can assign couriers to your restaurant in the Courier Management section.';
      }
    }
    
    if (type === 'courier') {
      if (lowerInput.includes('navigate')) {
        return 'Use the Navigate button on each order to open Google Maps for directions.';
      }
      if (lowerInput.includes('earning')) {
        return 'Your earnings are calculated based on deliveries completed. Check the earnings report for details.';
      }
    }

    return 'I understand you need help. Our support team will assist you shortly. Is there anything specific about the app I can explain?';
  }

  if (!isOpen) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Button
          onClick={() => setIsOpen(true)}
          className="rounded-full w-14 h-14 bg-orange-500 hover:bg-orange-600 shadow-lg"
        >
          <MessageCircle className="w-6 h-6 text-white" />
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 w-80 h-96 max-w-[calc(100vw-2rem)] max-h-[calc(100vh-2rem)] sm:w-80 sm:h-96">
      <Card className="h-full flex flex-col shadow-xl">
        <CardHeader className="flex-row items-center justify-between p-4 bg-orange-500 text-white rounded-t-lg">
          <CardTitle className="text-sm font-medium">
            Munchies Support
          </CardTitle>
          <Badge variant="secondary" className="text-xs">
            {userType === 'restaurant' ? 'Restaurant' : userType === 'courier' ? 'Courier' : 'Student'}
          </Badge>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsOpen(false)}
            className="text-white hover:bg-orange-600 h-6 w-6 p-0"
          >
            <X className="w-4 h-4" />
          </Button>
        </CardHeader>
        
        <CardContent className="flex-1 flex flex-col p-0">
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-2 ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {message.sender === 'bot' && (
                  <div className="w-6 h-6 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0">
                    <Bot className="w-3 h-3 text-orange-600" />
                  </div>
                )}
                <div
                  className={`max-w-xs rounded-lg p-3 text-sm ${
                    message.sender === 'user'
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-900'
                  }`}
                >
                  {message.text}
                </div>
                {message.sender === 'user' && (
                  <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <User className="w-3 h-3 text-blue-600" />
                  </div>
                )}
              </div>
            ))}
          </div>
          
          <div className="border-t p-4">
            <div className="flex gap-2">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                placeholder="Type your message..."
                className="flex-1 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
              <Button
                onClick={sendMessage}
                size="sm"
                className="bg-orange-500 hover:bg-orange-600"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}