import React, { useState, useEffect } from 'react';
import { Mic, Video, Send, Terminal, Code2, Play, Loader } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const InterviewRoom = () => {
    const { sessionId } = useParams();
    const navigate = useNavigate();
    const [code, setCode] = useState("// Write your solution here...\n\ndef solve(arr):\n    pass");
    const [messages, setMessages] = useState([
        { sender: 'AI', text: "Hello! I'm your TRACE AI interviewer. Let's start with a simple coding problem. Can you reverse an array in Python without using the built-in reverse method?" }
    ]);
    const { user, token } = useAuth();
    const [inputText, setInputText] = useState("");
    const [vibe, setVibe] = useState({ score: 88, feedback: "Ready to start" });
    const [isEnding, setIsEnding] = useState(false);
    const [isEnded, setIsEnded] = useState(false);
    const [finalScore, setFinalScore] = useState(null);
    const [learningPath, setLearningPath] = useState(null);

    const handleSendMessage = async () => {
        if (!inputText) return;
        const newMessages = [...messages, { sender: 'User', text: inputText }];
        setMessages(newMessages);
        setInputText("");

        try {
            const res = await fetch('http://localhost:8000/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ history: newMessages.map(m => ({ role: m.sender === 'AI' ? 'assistant' : 'user', content: m.text })) })
            });
            const data = await res.json();
            setMessages([...newMessages, { sender: 'AI', text: data.response.content }]);

            // Trigger Vibe Check every few messages
            if (newMessages.length % 3 === 0) {
                const vibeRes = await fetch('http://localhost:8000/api/interview/vibe-check', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                    body: JSON.stringify({ chat_history: newMessages })
                });
                const vibeData = await vibeRes.json();
                setVibe({ score: vibeData.vibe_score, feedback: vibeData.feedback });
            }
        } catch (err) { console.error(err); }
    };

    const handleEndInterview = async () => {
        setIsEnding(true);
        try {
            const res = await fetch('http://localhost:8000/api/interview/submit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ role: "Software Engineer", history: messages })
            });
            if (res.ok) {
                const data = await res.json();
                setFinalScore(data.ai_score);
                if (data.learning_path) {
                    setLearningPath(JSON.parse(data.learning_path));
                }
                setIsEnded(true);
            } else {
                alert("Failed to evaluate interview.");
            }
        } catch (e) {
            console.error(e);
        } finally {
            setIsEnding(false);
        }
    };

    return (
        <div className="pt-20 h-screen flex flex-col p-4 gap-4 overflow-hidden">
            {/* Header */}
            <div className="flex justify-between items-center px-2">
                <div>
                    <h2 className="font-bold text-xl flex items-center gap-2 text-white"><div className="w-3 h-3 rounded-full bg-red-500 animate-pulse"></div> Live Assessment</h2>
                    <p className="text-xs text-gray-400">Session ID: {sessionId || 'DEMO-123'}</p>
                </div>
                <div className="flex gap-4">
                    <div className="bg-dark/50 border border-white/10 px-4 py-2 rounded-lg flex items-center gap-2 text-white">
                        <div className="w-2 h-2 rounded-full bg-green-500"></div> Proctoring Active
                    </div>
                    <button 
                        onClick={handleEndInterview} 
                        disabled={isEnding || messages.length < 3}
                        className="bg-primary text-black font-bold px-4 py-2 rounded-lg hover:bg-white transition-colors disabled:opacity-50 flex items-center gap-2"
                    >
                        {isEnding ? <><Loader className="w-4 h-4 animate-spin" /> Evaluating...</> : "End & Generate Path"}
                    </button>
                </div>
            </div>

            {isEnded ? (
                <div className="flex-1 overflow-y-auto w-full max-w-4xl mx-auto pb-20">
                    <div className="text-center py-8 space-y-6">
                        <div className="inline-block bg-white/5 px-8 py-4 rounded-2xl border border-white/10 mb-2">
                            <p className="text-xs text-gray-400 uppercase tracking-widest mb-1">Interview Score</p>
                            <div className="text-5xl font-black bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                                {finalScore || 0}
                            </div>
                        </div>
                    </div>

                    {learningPath && (
                        <div className="text-left w-full mb-8 bg-black/40 p-8 rounded-2xl border border-cyan-500/20 shadow-xl shadow-cyan-500/5">
                            <h4 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                                <div className="p-2 bg-cyan-500/20 rounded-lg"><Code2 className="w-6 h-6 text-cyan-400" /></div> Recommended Learning Path
                            </h4>
                            <div className="grid gap-4">
                                {learningPath.map((step, i) => (
                                    <div key={i} className="bg-white/5 p-6 rounded-xl border border-white/10 relative overflow-hidden group hover:bg-white/10 transition-colors">
                                        <div className="absolute left-0 top-0 w-1.5 h-full bg-cyan-500 opacity-50 group-hover:opacity-100 transition-opacity"></div>
                                        <div className="flex gap-6 items-start">
                                            <div className="font-mono text-cyan-400 font-black text-2xl mt-1">0{i + 1}</div>
                                            <div className="flex-1">
                                                <h5 className="font-bold text-white text-xl mb-2">{step.step}</h5>
                                                <p className="text-sm text-gray-400 mb-4 leading-relaxed max-w-2xl">{step.why}</p>
                                                <a href={step.resource} className="inline-flex items-center gap-2 text-xs uppercase tracking-wider font-bold bg-cyan-500/10 text-cyan-400 px-4 py-2 rounded-lg hover:bg-cyan-500/30 transition-colors" target="_blank" rel="noreferrer">
                                                    View Recommended Resource
                                                </a>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                    
                    <div className="text-center">
                        <button 
                            onClick={() => navigate('/dashboard')} 
                            className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold py-4 px-10 rounded-xl transition-all shadow-lg shadow-cyan-500/20 inline-flex items-center gap-2"
                        >
                            Return to Dashboard
                        </button>
                    </div>
                </div>
            ) : (
                <div className="flex-1 grid grid-cols-3 gap-4 min-h-0">
                {/* Left: Chat/Instructions */}
                <div className="col-span-1 glass-panel flex flex-col">
                    <div className="p-4 border-b border-white/10 bg-white/5">
                        <h3 className="font-bold text-white">Conversation</h3>
                    </div>
                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                        {messages.map((msg, i) => (
                            <div key={i} className={`p-3 rounded-lg max-w-[90%] text-sm ${msg.sender === 'AI' ? 'bg-primary/20 text-blue-100 self-start' : 'bg-white/10 self-end ml-auto text-white'}`}>
                                <span className="text-xs font-bold opacity-50 block mb-1">{msg.sender}</span>
                                {msg.text}
                            </div>
                        ))}
                    </div>
                    <div className="p-4 border-t border-white/10 flex gap-2">
                        <input
                            type="text"
                            value={inputText}
                            onChange={(e) => setInputText(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                            placeholder="Type your answer..."
                            className="flex-1 bg-dark rounded-xl border border-white/20 px-3 text-sm focus:border-primary outline-none text-white"
                        />
                        <button onClick={handleSendMessage} className="p-2 bg-primary rounded-lg hover:bg-primary/90 text-black"><Send className="w-4 h-4" /></button>
                    </div>
                </div>

                {/* Right: Code Editor & Preview */}
                <div className="col-span-2 flex flex-col gap-4">
                    <div className="flex-1 glass-panel flex flex-col overflow-hidden">
                        <div className="bg-[#1e1e1e] p-2 flex items-center justify-between border-b border-white/10">
                            <div className="flex items-center gap-2 text-sm text-gray-400 px-2">
                                <Code2 className="w-4 h-4" /> solution.py
                            </div>
                            <button className="flex items-center gap-1 text-xs bg-green-600 hover:bg-green-500 text-white px-3 py-1.5 rounded transition-colors">
                                <Play className="w-3 h-3" /> Run Code
                            </button>
                        </div>
                        <textarea
                            className="flex-1 bg-[#1e1e1e] p-4 font-mono text-sm resize-none focus:outline-none text-gray-300"
                            value={code}
                            onChange={(e) => setCode(e.target.value)}
                            spellCheck="false"
                        ></textarea>
                    </div>

                    {/* Bottom: Webcam/Status */}
                    <div className="h-48 glass-panel p-4 flex gap-4">
                        <div className="aspect-video bg-black/50 rounded-lg flex items-center justify-center relative overflow-hidden group border border-white/10">
                            <Video className="w-6 h-6 text-gray-500" />
                            <div className="absolute top-2 right-2 text-[10px] bg-red-500 px-1.5 rounded text-white">LIVE</div>
                            <div className="absolute bottom-2 left-2 text-xs font-mono text-gray-400">Webcam Feed</div>
                        </div>
                        <div className="flex-1 flex flex-col justify-center">
                            <h4 className="font-bold text-gray-400 text-sm mb-2">Real-time Analysis</h4>
                            <div className="space-y-3">
                                <div>
                                    <div className="flex justify-between text-xs mb-1">
                                        <span>Confidence</span>
                                        <span>88%</span>
                                    </div>
                                    <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                                        <div className="h-full bg-green-500 w-[88%]"></div>
                                    </div>
                                </div>
                                <div>
                                    <div className="flex justify-between text-xs mb-1">
                                        <span>Sentiment</span>
                                        <span>Positive</span>
                                    </div>
                                    <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                                        <div className="h-full bg-blue-500 w-[75%]"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            )}
        </div>
    );
};

export default InterviewRoom;
