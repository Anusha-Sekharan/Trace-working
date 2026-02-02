import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const ChatAssistant = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { role: 'assistant', content: 'Hello! I am Trace AI. How can I help you find the perfect talent today?' }
    ]);
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!inputValue.trim()) return;

        const userMessage = { role: 'user', content: inputValue };
        setMessages(prev => [...prev, userMessage]);
        setInputValue('');
        setIsLoading(true);

        try {
            // Prepare history for API
            // Note: We might want to filter out non-text messages if the backend strictly expects text only,
            // but for now passing everything is okay as long as backend handles it.
            // Ideally backend receives text history.
            const history = messages.filter(m => m.content).map(m => ({
                role: m.role,
                content: m.content
            })).concat(userMessage);

            const response = await fetch('http://localhost:8000/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ history }),
            });

            const data = await response.json();
            const aiResponse = data.response;

            setMessages(prev => [...prev, {
                role: 'assistant',
                content: aiResponse.content,
                type: aiResponse.type || 'text',
                data: aiResponse.data
            }]);
        } catch (error) {
            console.error('Chat Error:', error);
            setMessages(prev => [...prev, { role: 'assistant', content: "Sorry, I'm having trouble connecting to the server. Please ensure the backend is running." }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end space-y-4">
                {/* Toggle Button */}
                {!isOpen && (
                    <motion.button
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className="p-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full shadow-lg hover:shadow-cyan-500/50 transition-all duration-300 group border border-white/20"
                        onClick={() => setIsOpen(true)}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                        </svg>
                    </motion.button>
                )}
            </div>

            {/* Chat Sidebar */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="fixed top-0 right-0 h-full w-[450px] bg-black/60 backdrop-blur-2xl border-l border-white/10 shadow-2xl z-50 flex flex-col"
                    >
                        {/* Header */}
                        <div className="p-4 border-b border-white/10 flex justify-between items-center bg-gradient-to-r from-white/5 to-transparent">
                            <div className="flex items-center space-x-3">
                                <div className="relative">
                                    <div className="w-3 h-3 rounded-full bg-green-400 animate-pulse"></div>
                                    <div className="absolute inset-0 w-3 h-3 rounded-full bg-green-400 animate-ping opacity-75"></div>
                                </div>
                                <div>
                                    <h3 className="font-bold text-white tracking-wide text-lg">Trace AI</h3>
                                    <p className="text-xs text-gray-400">Talent Acquisition Assistant</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="p-2 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-all"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        {/* Messages Area */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar">
                            {messages.map((msg, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
                                >
                                    <div
                                        className={`max-w-[90%] p-4 rounded-2xl text-sm leading-relaxed shadow-lg ${msg.role === 'user'
                                            ? 'bg-gradient-to-tr from-blue-600 to-purple-600 text-white rounded-tr-sm'
                                            : 'bg-white/10 text-gray-100 border border-white/5 rounded-tl-sm backdrop-filter backdrop-blur-sm'
                                            }`}
                                    >
                                        {msg.content}
                                    </div>

                                    {/* Render Search Results if present */}
                                    {msg.type === 'search_results' && msg.data && (
                                        <div className="mt-4 w-full flex space-x-4 overflow-x-auto pb-4 px-1 snap-x no-scrollbar">
                                            {msg.data.map((candidate) => (
                                                <div key={candidate.id} className="min-w-[260px] max-w-[260px] snap-center bg-gray-900/80 border border-white/10 rounded-xl p-4 shadow-xl hover:border-blue-500/50 transition-colors flex flex-col items-center text-center space-y-3 relative group">

                                                    {/* Verified Badge */}
                                                    {candidate.verified && (
                                                        <div className="absolute top-2 right-2 text-blue-400" title="Verified">
                                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                                <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                            </svg>
                                                        </div>
                                                    )}

                                                    <img
                                                        src={candidate.image}
                                                        alt={candidate.name}
                                                        className="w-16 h-16 rounded-full border-2 border-blue-500 p-0.5 object-cover"
                                                    />
                                                    <div>
                                                        <h4 className="text-white font-semibold">{candidate.name}</h4>
                                                        <p className="text-xs text-blue-400 font-medium">{candidate.role}</p>
                                                        <p className="text-xs text-gray-400 mt-1">{candidate.location}</p>
                                                    </div>
                                                    <div className="flex flex-wrap justify-center gap-1.5 w-full">
                                                        {candidate.skills.slice(0, 3).map((skill, i) => (
                                                            <span key={i} className="text-[10px] bg-white/5 px-2 py-1 rounded-full text-gray-300 border border-white/5">
                                                                {skill}
                                                            </span>
                                                        ))}
                                                    </div>

                                                    <div className="w-full bg-gray-800 rounded-full h-1.5 mt-2 overflow-hidden">
                                                        <div className="bg-gradient-to-r from-green-400 to-blue-500 h-1.5 rounded-full" style={{ width: `${candidate.score}%` }}></div>
                                                    </div>

                                                    <div className="flex items-center justify-between w-full pt-3 border-t border-white/5">
                                                        <span className="text-xs font-mono text-green-400 font-bold">{candidate.score} Match</span>
                                                        <div className="flex items-center space-x-2">
                                                            {candidate.github && (
                                                                <a href={candidate.github} target="_blank" rel="noopener noreferrer" className="p-1.5 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-all" title="GitHub Profile">
                                                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                                                        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                                                                    </svg>
                                                                </a>
                                                            )}
                                                            <a href={candidate.linkedin || "#"} target="_blank" rel="noopener noreferrer" className="text-xs text-white bg-blue-600 hover:bg-blue-500 px-3 py-1.5 rounded-lg transition-colors">
                                                                View Profile
                                                            </a>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </motion.div>
                            ))}
                            {isLoading && (
                                <div className="flex justify-start">
                                    <div className="bg-white/10 p-4 rounded-2xl rounded-tl-sm border border-white/5 flex space-x-1.5 items-center">
                                        <span className="text-xs text-gray-400 mr-2">Trace AI is searching</span>
                                        <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                                        <div className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                                        <div className="w-1.5 h-1.5 bg-pink-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input Area */}
                        <div className="p-4 border-t border-white/10 bg-black/40 backdrop-blur-sm">
                            <form onSubmit={handleSubmit} className="relative group">
                                <input
                                    type="text"
                                    value={inputValue}
                                    onChange={(e) => setInputValue(e.target.value)}
                                    placeholder="Ask about candidates, e.g., 'Find React devs in NY'..."
                                    className="w-full bg-white/5 text-white border border-white/10 rounded-xl py-3.5 px-4 pr-12 focus:outline-none focus:border-blue-500/50 focus:bg-white/10 focus:ring-1 focus:ring-blue-500/30 transition-all placeholder-gray-500"
                                />
                                <button
                                    type="submit"
                                    disabled={isLoading || !inputValue.trim()}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors rounded-lg hover:bg-white/10"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 transform rotate-90" viewBox="0 0 20 20" fill="currentColor">
                                        <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                                    </svg>
                                </button>
                            </form>
                            <div className="text-center mt-2">
                                <p className="text-[10px] text-gray-500">Powered by Ollama Llama 3.2</p>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

export default ChatAssistant;
