import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Send, ArrowLeft, MessagesSquare } from 'lucide-react';
import { io } from 'socket.io-client';
import useAuth from '../../hooks/useAuth';
import requestService from '../../services/requestService';
import Loader from '../../components/common/Loader';
import Avatar from '../../components/common/Avatar';
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

  if (loading) return <Loader text="Loading chat..." fullScreen />;

  const otherUser =
    request?.requesterId?._id === user?._id
      ? request?.shopperId
      : request?.requesterId;

  return (
    <div className="mx-auto h-[calc(100dvh-8rem)] min-h-[28rem] max-w-3xl px-4 py-4 sm:px-6 sm:py-6">
      <div className="flex h-full animate-rise flex-col overflow-hidden rounded-3xl border border-gray-200/80 bg-white shadow-card">
        {/* Header */}
        <div className="flex items-center gap-3 border-b border-gray-100 px-4 py-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            aria-label="Back"
            className="rounded-xl p-2 text-gray-500 transition hover:bg-gray-100 hover:text-gray-900"
          >
            <ArrowLeft className="size-5" />
          </button>
          <Avatar name={otherUser?.name} src={otherUser?.profileImage} size="md" />
          <div className="flex-1">
            <p className="font-semibold text-gray-900">{otherUser?.name}</p>
            <p className="flex items-center gap-1.5 text-xs text-gray-500">
              <span className="relative flex size-2">
                {connected && (
                  <span className="absolute inline-flex size-full animate-ping rounded-full bg-primary-400 opacity-60" />
                )}
                <span
                  className={`relative inline-flex size-2 rounded-full ${
                    connected ? 'bg-primary-500' : 'bg-gray-400'
                  }`}
                />
              </span>
              {connected ? 'Online' : 'Connecting...'}
            </p>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 space-y-2.5 overflow-y-auto bg-gray-50/70 p-4">
          {messages.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-center text-gray-500">
              <span className="flex size-14 items-center justify-center rounded-2xl bg-white text-primary-600 shadow-card">
                <MessagesSquare className="size-7" aria-hidden="true" />
              </span>
              <p className="mt-4 font-medium text-gray-700">No messages yet</p>
              <p className="mt-1 text-sm">Start the conversation!</p>
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
                    className={`max-w-[80%] animate-msg px-4 py-2.5 sm:max-w-[70%] ${
                      isMine
                        ? 'rounded-2xl rounded-br-md bg-primary-700 text-white'
                        : 'rounded-2xl rounded-bl-md border border-gray-200 bg-white text-gray-900'
                    }`}
                  >
                    <p className="break-words text-[0.95rem] leading-relaxed">{msg.message}</p>
                    <p
                      className={`mt-1 text-[0.7rem] ${
                        isMine ? 'text-primary-200' : 'text-gray-400'
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
        <form onSubmit={handleSend} className="flex items-center gap-2 border-t border-gray-100 p-3">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Write a message..."
            aria-label="Message"
            className="flex-1 rounded-full border border-gray-300 bg-white px-5 py-3 text-[0.95rem] transition placeholder:text-gray-400 hover:border-gray-400 focus:border-primary-500 focus:outline-none focus:ring-4 focus:ring-primary-500/15 disabled:bg-gray-100"
            disabled={!connected}
          />
          <button
            type="submit"
            aria-label="Send"
            disabled={!newMessage.trim() || !connected}
            className="flex size-12 shrink-0 items-center justify-center rounded-full bg-primary-600 text-white shadow-[0_8px_16px_-8px_rgb(20_102_64/0.7)] transition duration-200 hover:bg-primary-700 active:scale-90 disabled:cursor-not-allowed disabled:opacity-50 disabled:active:scale-100"
          >
            <Send className="size-5" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatPage;
