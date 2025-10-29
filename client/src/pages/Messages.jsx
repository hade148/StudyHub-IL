import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';

export default function Messages() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [currentConversation, setCurrentConversation] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    fetchConversations();
  }, []);

  useEffect(() => {
    if (userId) {
      fetchConversation(userId);
    }
  }, [userId]);

  const fetchConversations = async () => {
    try {
      const res = await api.get('/messages');
      setConversations(res.data);
    } catch (error) {
      console.error('Error fetching conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchConversation = async (partnerId) => {
    try {
      const res = await api.get(`/messages/${partnerId}`);
      setCurrentConversation(res.data);
      const partner = res.data[0]?.sender.id === user.id 
        ? res.data[0]?.receiver 
        : res.data[0]?.sender;
      setSelectedUser(partner);
    } catch (error) {
      console.error('Error fetching conversation:', error);
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!message.trim() || !userId) return;

    setSending(true);
    try {
      await api.post('/messages', {
        receiverId: parseInt(userId),
        content: message
      });
      setMessage('');
      fetchConversation(userId);
      fetchConversations();
    } catch (error) {
      alert('שגיאה בשליחת הודעה');
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-200px)] flex gap-4">
      {/* Conversations List */}
      <div className="w-1/3 bg-white rounded-lg shadow-md overflow-y-auto">
        <div className="p-4 border-b">
          <h2 className="text-xl font-bold">הודעות 📨</h2>
        </div>
        <div className="divide-y">
          {conversations.length > 0 ? (
            conversations.map((conv) => (
              <button
                key={conv.partner.id}
                onClick={() => navigate(`/messages/${conv.partner.id}`)}
                className={`w-full p-4 text-right hover:bg-gray-50 transition ${
                  userId == conv.partner.id ? 'bg-blue-50' : ''
                }`}
              >
                <div className="flex items-center space-x-3 space-x-reverse">
                  {conv.partner.profilePicture ? (
                    <img
                      src={`/${conv.partner.profilePicture}`}
                      alt={conv.partner.fullName}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-primary-600 text-white flex items-center justify-center font-bold">
                      {conv.partner.fullName.charAt(0)}
                    </div>
                  )}
                  <div className="flex-1">
                    <div className="flex justify-between items-center">
                      <p className="font-semibold">{conv.partner.fullName}</p>
                      {conv.unreadCount > 0 && (
                        <span className="bg-red-600 text-white text-xs rounded-full px-2 py-1">
                          {conv.unreadCount}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 truncate">
                      {conv.messages[0]?.content}
                    </p>
                  </div>
                </div>
              </button>
            ))
          ) : (
            <div className="p-8 text-center text-gray-500">
              <span className="text-4xl block mb-2">💬</span>
              <p>אין שיחות עדיין</p>
            </div>
          )}
        </div>
      </div>

      {/* Conversation */}
      <div className="flex-1 bg-white rounded-lg shadow-md flex flex-col">
        {userId ? (
          <>
            {/* Header */}
            <div className="p-4 border-b flex items-center space-x-3 space-x-reverse">
              {selectedUser?.profilePicture ? (
                <img
                  src={`/${selectedUser.profilePicture}`}
                  alt={selectedUser.fullName}
                  className="w-10 h-10 rounded-full object-cover"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-primary-600 text-white flex items-center justify-center font-bold">
                  {selectedUser?.fullName?.charAt(0)}
                </div>
              )}
              <h3 className="font-bold text-lg">{selectedUser?.fullName}</h3>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {currentConversation.map((msg) => {
                const isMine = msg.sender.id === user.id;
                return (
                  <div
                    key={msg.id}
                    className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-xs px-4 py-2 rounded-lg ${
                        isMine
                          ? 'bg-primary-600 text-white'
                          : 'bg-gray-200 text-gray-800'
                      }`}
                    >
                      <p>{msg.content}</p>
                      <p className={`text-xs mt-1 ${isMine ? 'text-blue-100' : 'text-gray-500'}`}>
                        {new Date(msg.createdAt).toLocaleTimeString('he-IL', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Input */}
            <form onSubmit={sendMessage} className="p-4 border-t flex space-x-2 space-x-reverse">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="flex-1 input"
                placeholder="כתוב הודעה..."
                disabled={sending}
              />
              <button
                type="submit"
                disabled={sending || !message.trim()}
                className="btn btn-primary"
              >
                {sending ? 'שולח...' : '📤 שלח'}
              </button>
            </form>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            <div className="text-center">
              <span className="text-6xl block mb-4">💬</span>
              <p className="text-xl">בחר שיחה כדי להתחיל</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}