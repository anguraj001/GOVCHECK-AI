import React, { useState, useRef, useEffect } from 'react';
import { 
  Sparkles, 
  Send, 
  Bot, 
  User as UserIcon, 
  AlertTriangle, 
  HelpCircle, 
  FileText, 
  Sliders, 
  ShieldCheck,
  Languages
} from 'lucide-react';
import { Application, GovService, Language, AIChatMessage } from '../types';
import { translations } from '../translations';
import { api } from '../services/api';

interface AIAssistantChatProps {
  language: Language;
  applicationContext?: Application | null;
  serviceContext?: GovService | null;
}

export const AIAssistantChat: React.FC<AIAssistantChatProps> = ({
  language,
  applicationContext,
  serviceContext,
}) => {
  const [messages, setMessages] = useState<AIChatMessage[]>([
    {
      id: 'msg-welcome',
      role: 'assistant',
      content: language === 'ta'
        ? `வணக்கம்! நான் GOVCHECK AI உதவியாளர். உங்கள் விண்ணப்பத்தின் ஆவணங்கள், பெயர் அல்லது முகவரி முரண்பாடுகள் மற்றும் தகுதி விதிகள் பற்றி நீங்கள் தமிழ், Tanglish அல்லது ஆங்கிலத்தில் கேட்கலாம்.`
        : `Hello! I am your GOVCHECK AI Assistant. I can help explain flagged application discrepancies, clarify documentary requirements, and guide you through the Correction Center before official submission.`,
      timestamp: new Date().toISOString(),
      suggestedActions: [
        'How is the risk score calculated?',
        'How do I fix a name mismatch?',
        'வருமானச் சான்றிதழுக்கு என்ன ஆவணங்கள் தேவை?',
        'En application la enna problem irukku?',
      ],
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const t = translations[language];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSendMessage = async (textToSend?: string) => {
    const query = textToSend || inputText;
    if (!query.trim() || isTyping) return;

    const userMsg: AIChatMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: query,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputText('');
    setIsTyping(true);

    try {
      const response = await api.sendChatMessage(query, language, applicationContext?.id);
      const assistantMsg: AIChatMessage = {
        id: `msg-${Date.now() + 1}`,
        role: 'assistant',
        content: response.text,
        timestamp: new Date().toISOString(),
        suggestedActions: response.suggestedActions || [],
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      const errorMsg: AIChatMessage = {
        id: `msg-err-${Date.now()}`,
        role: 'assistant',
        content: 'I encountered an issue processing your query. Please try again.',
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 h-[calc(100vh-8rem)] flex flex-col">
      
      {/* Header Banner */}
      <div className="bg-white p-4 sm:p-5 rounded-t-3xl border border-gray-200 border-b-0 shadow-xs flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-700 to-indigo-600 text-white flex items-center justify-center shadow-xs">
            <Sparkles className="w-5 h-5 text-amber-300" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-extrabold text-base text-gray-900">
                GOVCHECK AI Assistant
              </h2>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800">
                Bilingual (EN / தமிழ் / Tanglish)
              </span>
            </div>
            <p className="text-xs text-gray-500">
              {applicationContext ? `Context: Application ${applicationContext.applicationNumber}` : 'Pre-Submission Inquiry & Advice'}
            </p>
          </div>
        </div>

        {/* Disclaimer Pill */}
        <div className="hidden md:flex items-center gap-1.5 px-3 py-1 bg-amber-50 rounded-xl border border-amber-200 text-[11px] text-amber-800">
          <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
          <span>Independent AI Verification Assistant</span>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 bg-gray-50/70 border border-gray-200 p-4 sm:p-6 overflow-y-auto space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex items-start gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
          >
            {/* Avatar */}
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
              msg.role === 'user' ? 'bg-gray-900 text-white' : 'bg-blue-700 text-white'
            }`}>
              {msg.role === 'user' ? <UserIcon className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
            </div>

            {/* Message Bubble */}
            <div className={`max-w-xl space-y-2 ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
              <div
                className={`p-4 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-blue-700 text-white rounded-tr-xs shadow-xs font-medium'
                    : 'bg-white text-gray-800 border border-gray-200 rounded-tl-xs shadow-xs'
                }`}
              >
                <div className="whitespace-pre-wrap">{msg.content}</div>
              </div>

              {/* Suggested Action Pills (Assistant only) */}
              {msg.role === 'assistant' && msg.suggestedActions && msg.suggestedActions.length > 0 && (
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  {msg.suggestedActions.map((action, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSendMessage(action)}
                      className="px-2.5 py-1 bg-white hover:bg-blue-50 border border-gray-200 hover:border-blue-300 rounded-lg text-[11px] text-gray-700 hover:text-blue-700 transition-colors text-left"
                    >
                      {action}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-blue-700 text-white flex items-center justify-center">
              <Bot className="w-4 h-4" />
            </div>
            <div className="bg-white border border-gray-200 rounded-2xl px-4 py-2.5 text-xs text-gray-500 flex items-center gap-1.5 shadow-xs">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-bounce" />
              <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-bounce [animation-delay:0.2s]" />
              <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-bounce [animation-delay:0.4s]" />
              <span className="text-[11px] ml-1">Analyzing pre-submission rules...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Form Bar */}
      <div className="bg-white p-4 rounded-b-3xl border border-gray-200 border-t-0 shadow-xs">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-2"
        >
          <input
            id="input-ai-chat-text"
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={
              language === 'ta'
                ? 'உங்கள் கேள்வியை தமிழ், Tanglish அல்லது ஆங்கிலத்தில் தட்டச்சு செய்யவும்...'
                : 'Ask in English, தமிழ், or Tanglish (e.g. "Why was name mismatch flagged?")...'
            }
            className="flex-1 text-xs sm:text-sm border border-gray-300 rounded-xl px-4 py-3 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-600 outline-hidden font-medium"
          />
          <button
            id="btn-ai-chat-send"
            type="submit"
            disabled={!inputText.trim() || isTyping}
            className="px-5 py-3 bg-blue-700 hover:bg-blue-800 disabled:opacity-40 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-2"
          >
            <span>Send</span>
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>

    </div>
  );
};
