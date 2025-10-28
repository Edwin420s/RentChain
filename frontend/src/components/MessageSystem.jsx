import React, { useState, useRef, useEffect } from 'react'
import { Send, Paperclip, Image, Smile, MoreVertical } from 'lucide-react'

const MessageSystem = ({ conversations, currentUser, onSendMessage }) => {
  const [activeConversation, setActiveConversation] = useState(null)
  const [newMessage, setNewMessage] = useState('')
  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [activeConversation?.messages])

  const handleSendMessage = () => {
    if (!newMessage.trim() || !activeConversation) return

    const message = {
      id: Date.now(),
      content: newMessage,
      sender: currentUser.id,
      timestamp: new Date(),
      type: 'text'
    }

    onSendMessage(activeConversation.id, message)
    setNewMessage('')
  }

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    })
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 h-96 flex">
      {/* Conversations Sidebar */}
      <div className="w-1/3 border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <h3 className="font-semibold text-text">Messages</h3>
        </div>
        <div className="flex-1 overflow-y-auto">
          {conversations.map(conversation => (
            <div
              key={conversation.id}
              onClick={() => setActiveConversation(conversation)}
              className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
                activeConversation?.id === conversation.id ? 'bg-blue-50' : ''
              }`}
            >
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white font-semibold">
                  {conversation.participant.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-text text-sm">
                      {conversation.participant.name}
                    </h4>
                    <span className="text-xs text-gray-500">
                      {formatTime(conversation.lastMessage.timestamp)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 truncate">
                    {conversation.lastMessage.content}
                  </p>
                  {conversation.unreadCount > 0 && (
                    <span className="inline-block bg-primary text-white text-xs rounded-full px-2 py-1 mt-1">
                      {conversation.unreadCount}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {activeConversation ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white font-semibold text-sm">
                  {activeConversation.participant.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h4 className="font-semibold text-text">
                    {activeConversation.participant.name}
                  </h4>
                  <p className="text-xs text-gray-600">
                    {activeConversation.participant.role} • Online
                  </p>
                </div>
              </div>
              <button className="text-gray-400 hover:text-gray-600 transition-colors">
                <MoreVertical className="h-5 w-5" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {activeConversation.messages.map(message => (
                <div
                  key={message.id}
                  className={`flex ${
                    message.sender === currentUser.id ? 'justify-end' : 'justify-start'
                  }`}
                >
                  <div
                    className={`max-w-xs lg:max-w-md rounded-lg p-3 ${
                      message.sender === currentUser.id
                        ? 'bg-primary text-white rounded-br-none'
                        : 'bg-gray-100 text-text rounded-bl-none'
                    }`}
                  >
                    <p className="text-sm">{message.content}</p>
                    <div
                      className={`text-xs mt-1 ${
                        message.sender === currentUser.id
                          ? 'text-blue-100'
                          : 'text-gray-500'
                      }`}
                    >
                      {formatTime(message.timestamp)}
                    </div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="p-4 border-t border-gray-200">
              <div className="flex items-center space-x-2">
                <button className="text-gray-400 hover:text-gray-600 transition-colors p-2">
                  <Paperclip className="h-5 w-5" />
                </button>
                <button className="text-gray-400 hover:text-gray-600 transition-colors p-2">
                  <Image className="h-5 w-5" />
                </button>
                <button className="text-gray-400 hover:text-gray-600 transition-colors p-2">
                  <Smile className="h-5 w-5" />
                </button>
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Type a message..."
                  className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary focus:border-transparent"
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim()}
                  className="bg-primary text-white p-2 rounded-lg hover:bg-blue-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="h-5 w-5" />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="text-gray-400 mb-2">Select a conversation</div>
              <div className="text-sm text-gray-600">
                Choose a conversation from the list to start messaging
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default MessageSystem