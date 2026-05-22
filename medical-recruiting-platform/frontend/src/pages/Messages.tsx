import { useState, useEffect, useRef } from 'react'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import { messagesAPI } from '../services/api'
import { Send, MessageSquare, User } from 'lucide-react'
import io from 'socket.io-client'

export default function Messages() {
  const [selectedUser, setSelectedUser] = useState<any>(null)
  const [newMessage, setNewMessage] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const queryClient = useQueryClient()

  const { data: conversations } = useQuery('conversations', () =>
    messagesAPI.getConversations().then(r => r.data)
  )

  const { data: messages } = useQuery(
    ['messages', selectedUser?.partner?.id],
    () => selectedUser ? messagesAPI.getMessages(selectedUser.partner.id).then(r => r.data) : [],
    { enabled: !!selectedUser, refetchInterval: 5000 }
  )

  const sendMutation = useMutation(
    () => messagesAPI.send({ recipientId: selectedUser.partner.id, content: newMessage }),
    {
      onSuccess: () => {
        setNewMessage('')
        queryClient.invalidateQueries(['messages', selectedUser?.partner?.id])
        queryClient.invalidateQueries('conversations')
      }
    }
  )

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    const socket = io(import.meta.env.VITE_API_URL || '')
    socket.on('new_message', () => {
      queryClient.invalidateQueries(['messages', selectedUser?.partner?.id])
    })
    return () => { socket.disconnect() }
  }, [queryClient, selectedUser])

  return (
    <div className="card h-[calc(100vh-200px)] flex">
      {/* Conversations List */}
      <div className="w-80 border-r overflow-y-auto">
        <div className="p-4 border-b">
          <h2 className="font-semibold text-gray-900 flex items-center gap-2">
            <MessageSquare className="h-5 w-5" /> Messages
          </h2>
        </div>
        {conversations?.map((conv: any) => (
          <button
            key={conv.partner.id}
            onClick={() => setSelectedUser(conv)}
            className={`w-full p-4 text-left hover:bg-gray-50 border-b transition-colors ${
              selectedUser?.partner?.id === conv.partner.id ? 'bg-primary-50 border-primary-200' : ''
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                <User className="h-5 w-5 text-gray-500" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-gray-900 truncate">
                  {conv.partner.providerProfile?.firstName || conv.partner.employerProfile?.companyName || conv.partner.email}
                </div>
                <div className="text-sm text-gray-500 truncate">{conv.lastMessage.content}</div>
              </div>
              {conv.unreadCount > 0 && (
                <span className="bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">{conv.unreadCount}</span>
              )}
            </div>
          </button>
        )) || <div className="p-4 text-gray-500 text-center">No conversations yet</div>}
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedUser ? (
          <>
            <div className="p-4 border-b flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                <User className="h-4 w-4 text-gray-500" />
              </div>
              <span className="font-medium text-gray-900">
                {selectedUser.partner.providerProfile?.firstName || selectedUser.partner.employerProfile?.companyName || selectedUser.partner.email}
              </span>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages?.map((msg: any) => (
                <div key={msg.id} className={`flex ${msg.senderId === selectedUser.partner.id ? 'justify-start' : 'justify-end'}`}>
                  <div className={`max-w-md px-4 py-2 rounded-lg ${
                    msg.senderId === selectedUser.partner.id
                      ? 'bg-gray-100 text-gray-900'
                      : 'bg-primary-600 text-white'
                  }`}>
                    <p className="text-sm">{msg.content}</p>
                    <span className="text-xs opacity-70 mt-1 block">
                      {new Date(msg.createdAt).toLocaleTimeString()}
                    </span>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
            <div className="p-4 border-t flex gap-2">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && newMessage.trim() && sendMutation.mutate()}
                placeholder="Type a message..."
                className="input flex-1"
              />
              <button
                onClick={() => sendMutation.mutate()}
                disabled={!newMessage.trim() || sendMutation.isLoading}
                className="btn-primary disabled:opacity-50"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            Select a conversation to start messaging
          </div>
        )}
      </div>
    </div>
  )
}
