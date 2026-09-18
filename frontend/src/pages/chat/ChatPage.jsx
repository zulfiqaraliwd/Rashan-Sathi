import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Send, Loader2, ArrowLeft } from 'lucide-react';
import { io } from 'socket.io-client';
import useAuth from '../../hooks/useAuth';
import requestService from '../../services/requestService';
import Loader from '../../components/common/Loader';
import { timeAgo } from '../../utils/formatDate';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

const ChatPage = () => {
  const { requestId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);

  const [request, setRequest] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [connected, setConnected] = useState(false);

  // Fetch request
  useEffect(() => {
    const fetchRequest = async () => {
      try {
        const response = await requestService.getRequestById(requestId);
        if (response.success) setRequest(response.request);
      } catch (error) {
        navigate('/');
      } finally {
        setLoading(false);
      }
    };
    fetchRequest();
  }, [requestId, navigate]);

  // Socket connect
  useEffect(() => {
    const token = localStorage.getItem('rashan_token');
    if (!token) return;

    socketRef.current = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket'],
    });

    socketRef.current.on('connect', () => {
      setConnected(true);
      socketRef.current.emit('joinRequest', { requestId });
    });

    socketRef.current.on('previousMessages', (msgs) => {
      setMessages(msgs);
    });

    socketRef.current.on('newMessage', (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    socketRef.current.on('disconnect', () => setConnected(false));

    return () => {
      if (socketRef.current) socketRef.current.disconnect();
    };
  }, [requestId]);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !socketRef.current) return;

    socketRef.current.emit('sendMessage', {
      requestId,
      message: newMessage.trim(),
      messageType: 'text',
    });

    setNewMessage('');
  };

  if (loading) return <Loader text="Chat load ho rahi hai..." fullScreen />;

  const otherUser =
    request?.requesterId?._id === user?._id
      ? request?.shopperId
      : request?.requesterId;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-4 sm:py-6 h-[calc(100vh-8rem)]">
      <div className="bg-white rounded-2xl shadow-lg flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center gap-3 p-4 border-b border-gray-100">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
            <span className="text-primary-700 font-semibold">
              {otherUser?.name?.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="flex-1">
            <p className="font-semibold text-gray-800">{otherUser?.name}</p>
            <p className="text-xs text-gray-500 flex items-center gap-1">
              {connected ? (
                <>
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  Online
                </>
              ) : (
                <>
                  <span className="w-2 h-2 bg-gray-400 rounded-full"></span>
                  Connecting...
                </>
              )}
            </p>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <p>Abhi koi messages nahi</p>
              <p className="text-sm mt-1">Chat shuru karein!</p>
            </div>
          ) : (
            messages.map((msg, idx) => {
              const isMine = msg.senderId?._id === user?._id;
              return (
                <div
                  key={idx}
                  className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[70%] rounded-2xl px-4 py-2 ${
                      isMine
                        ? 'bg-primary-600 text-white'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    <p className="text-sm">{msg.message}</p>
                    <p
                      className={`text-xs mt-1 ${
                        isMine ? 'text-primary-100' : 'text-gray-500'
                      }`}
                    >
                      {timeAgo(msg.createdAt)}
                    </p>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <form
          onSubmit={handleSend}
          className="p-4 border-t border-gray-100 flex gap-2"
        >
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Message likhein..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:ring-2 focus:ring-primary-500 outline-none"
            disabled={!connected}
          />
          <button
            type="submit"
            disabled={!newMessage.trim() || !connected}
            className="p-2 bg-primary-600 text-white rounded-full hover:bg-primary-700 disabled:opacity-50 transition"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatPage;