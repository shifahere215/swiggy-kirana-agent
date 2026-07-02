"use client";

import { useChat } from 'ai/react';
import { Send, Bot, User, Sparkles } from 'lucide-react';
import { useEffect, useRef } from 'react';

export default function AgentPage() {
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
    api: '/api/chat'
  });
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  return (
    <div className="agent-container">
      <div className="header">
        <h1><Sparkles size={18} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '4px' }} /> Kirana Agent</h1>
      </div>

      <div className="agent-messages">
        {messages.length === 0 ? (
          <div className="agent-empty">
            <Bot size={48} color="var(--primary)" />
            <h2>Kirana Assistant</h2>
            <p>I can help you find products, check your reorder nudges, and answer any shopping questions!</p>
          </div>
        ) : (
          messages.map(m => (
            <div key={m.id} className={`message-bubble ${m.role}`}>
              <div className="message-avatar">
                {m.role === 'user' ? <User size={16} /> : <Bot size={16} />}
              </div>
              <div className="message-content">
                {m.content}
                {m.toolInvocations && m.toolInvocations.map(tool => (
                  <div key={tool.toolCallId} style={{ marginTop: '8px', padding: '8px', backgroundColor: 'rgba(0,0,0,0.05)', borderRadius: '8px', fontSize: '0.8rem' }}>
                    <Sparkles size={12} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'middle' }} />
                    <em>Calling tool: {tool.toolName}</em>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
        {isLoading && (
          <div className="message-bubble assistant">
            <div className="message-avatar"><Bot size={16} /></div>
            <div className="message-content">
              <span className="dot-typing"></span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSubmit} className="agent-input-form">
        <input
          value={input}
          onChange={handleInputChange}
          placeholder="Ask me anything..."
          className="agent-input"
        />
        <button type="submit" disabled={!input.trim() || isLoading} className="agent-send-btn">
          <Send size={20} />
        </button>
      </form>
    </div>
  );
}
