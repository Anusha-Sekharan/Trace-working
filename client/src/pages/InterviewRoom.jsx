import React, { useState, useEffect } from 'react';
import { Mic, Video, Send, Terminal, Code2, Play } from 'lucide-react';
import { useParams } from 'react-router-dom';

const InterviewRoom = () => {
    const { sessionId } = useParams();
    const [code, setCode] = useState("// Write your solution here...\n\ndef solve(arr):\n    pass");
    const [messages, setMessages] = useState([
        { sender: 'AI', text: "Hello! I'm your TRACE AI interviewer. Let's start with a simple coding problem. Can you reverse an array in Python without using the built-in reverse method?" }
    ]);

    return (
        <div className="pt-20 h-screen flex flex-col p-4 gap-4 overflow-hidden">
            {/* Header */}
            <div className="flex justify-between items-center px-2">
                <div>
                    <h2 className="font-bold text-xl flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-red-500 animate-pulse"></div> Live Assessment</h2>
                    <p className="text-xs text-gray-400">Session ID: {sessionId || 'DEMO-123'}</p>
                </div>
                <div className="flex gap-4">
                    <div className="bg-dark/50 border border-white/10 px-4 py-2 rounded-lg flex items-center gap-2 text-white">
                        <div className="w-2 h-2 rounded-full bg-green-500"></div> Proctoring Active
                    </div>
                    <button className="bg-red-500/20 hover:bg-red-500/30 text-red-500 px-4 py-2 rounded-lg font-semibold border border-red-500/50">
                        End Session
                    </button>
                </div>
            </div>

            <div className="flex-1 grid grid-cols-3 gap-4 min-h-0">
                {/* Left: Chat/Instructions */}
                <div className="col-span-1 glass-panel flex flex-col">
                    <div className="p-4 border-b border-white/10 bg-white/5">
                        <h3 className="font-bold">Conversation</h3>
                    </div>
                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                        {messages.map((msg, i) => (
                            <div key={i} className={`p-3 rounded-lg max-w-[90%] text-sm ${msg.sender === 'AI' ? 'bg-primary/20 text-blue-100 self-start' : 'bg-white/10 self-end ml-auto'}`}>
                                <span className="text-xs font-bold opacity-50 block mb-1">{msg.sender}</span>
                                {msg.text}
                            </div>
                        ))}
                    </div>
                    <div className="p-4 border-t border-white/10 flex gap-2">
                        <input type="text" placeholder="Type your answer..." className="flex-1 bg-dark rounded-lg border border-white/20 px-3 text-sm focus:border-primary outline-none text-white" />
                        <button className="p-2 bg-primary rounded-lg hover:bg-primary/90"><Send className="w-4 h-4" /></button>
                        <button className="p-2 bg-white/10 rounded-lg hover:bg-white/20"><Mic className="w-4 h-4" /></button>
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
        </div>
    );
};

export default InterviewRoom;
