import React, { useState, useEffect, useRef } from 'react';
import { Camera, CheckCircle, Loader2, AlertTriangle, ArrowRight, VideoOff } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ProctoredAssessment = ({ role, token, onComplete }) => {
    const [questions, setQuestions] = useState([]);
    const [currentStep, setCurrentStep] = useState('setup'); // setup, testing, scoring, complete
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState({});
    const [currentAnswer, setCurrentAnswer] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [finalScore, setFinalScore] = useState(null);
    const [cameraActive, setCameraActive] = useState(false);

    const videoRef = useRef(null);
    const streamRef = useRef(null);

    // Stop camera when unmounting
    useEffect(() => {
        return () => {
            if (streamRef.current) {
                streamRef.current.getTracks().forEach(track => track.stop());
            }
        };
    }, []);

    const startCamera = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
            }
            streamRef.current = stream;
            setCameraActive(true);
            setError('');
        } catch (err) {
            setError("Camera access is required for proctoring. Please allow camera permissions.");
            setCameraActive(false);
        }
    };

    const fetchQuestions = async () => {
        if (!cameraActive) {
            setError("Please enable your camera first.");
            return;
        }

        setLoading(true);
        setError('');
        try {
            const res = await fetch('http://localhost:8000/api/assessment/start', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ role })
            });

            if (!res.ok) throw new Error("Failed to load questions.");
            const data = await res.json();
            setQuestions(data.questions);
            setCurrentStep('testing');
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleNextQuestion = () => {
        if (!currentAnswer.trim()) {
            setError("Please provide an answer before continuing.");
            return;
        }

        const newAnswers = { ...answers, [currentQuestionIndex]: currentAnswer };
        setAnswers(newAnswers);
        setError('');

        if (currentQuestionIndex < questions.length - 1) {
            setCurrentQuestionIndex(currentQuestionIndex + 1);
            setCurrentAnswer(answers[currentQuestionIndex + 1] || '');
        } else {
            submitAssessment(newAnswers);
        }
    };

    const submitAssessment = async (finalAnswers) => {
        setCurrentStep('scoring');
        try {
            const qAndA = questions.map((q, i) => ({
                question: typeof q === 'string' ? q : q.question,
                answer: finalAnswers[i] || ""
            }));

            const res = await fetch('http://localhost:8000/api/assessment/submit', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ role, q_and_a: qAndA })
            });

            if (!res.ok) throw new Error("Failed to submit assessment.");
            const data = await res.json(); // returns updated User

            setFinalScore(data.ai_score);
            setCurrentStep('complete');

            // Wait 3 seconds, then advance parent
            setTimeout(() => {
                onComplete(data);
            }, 3000);

        } catch (err) {
            setError(err.message);
            setCurrentStep('testing'); // Let them retry submit
        }
    };

    return (
        <div className="w-full">
            {/* Proctoring Header */}
            <div className="flex items-center justify-between mb-6 bg-black/40 p-4 rounded-xl border border-white/5">
                <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${cameraActive ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
                    <span className="text-sm font-medium text-gray-300">
                        {cameraActive ? 'AI Proctoring Active' : 'Proctoring Offline'}
                    </span>
                </div>
                <div className="relative w-24 h-24 rounded-lg overflow-hidden border border-white/10 bg-black flex items-center justify-center">
                    <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        muted
                        className={`w-full h-full object-cover ${cameraActive ? 'opacity-100' : 'opacity-0'}`}
                    />
                    {!cameraActive && <VideoOff className="absolute w-6 h-6 text-gray-600" />}
                </div>
            </div>

            {error && (
                <div className="flex items-center gap-2 bg-red-500/10 text-red-500 p-4 rounded-lg mb-6 text-sm border border-red-500/20">
                    <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                    <span>{error}</span>
                </div>
            )}

            <AnimatePresence mode="wait">
                {currentStep === 'setup' && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                        className="text-center space-y-6"
                    >
                        <div className="bg-cyan-500/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 border border-cyan-500/20">
                            <Camera className="w-8 h-8 text-cyan-400" />
                        </div>
                        <h3 className="text-xl font-semibold">Proctored AI Assessment</h3>
                        <p className="text-sm text-gray-400">
                            You'll answer 5 AI-generated questions for the role of <span className="text-cyan-400 font-medium">{role}</span>.
                            Your camera must remain active during the test.
                        </p>

                        {!cameraActive ? (
                            <button
                                onClick={startCamera}
                                className="w-full py-3 bg-white/10 hover:bg-white/15 text-white rounded-lg transition-colors font-medium border border-white/10"
                            >
                                Enable Camera
                            </button>
                        ) : (
                            <button
                                onClick={fetchQuestions}
                                disabled={loading}
                                className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white rounded-lg transition-all font-medium shadow-lg shadow-cyan-500/20"
                            >
                                {loading && <Loader2 className="w-5 h-5 animate-spin" />}
                                {loading ? 'Generating Scenario...' : 'Start Assessment'}
                            </button>
                        )}
                    </motion.div>
                )}

                {currentStep === 'testing' && questions.length > 0 && (
                    <motion.div
                        key="testing"
                        initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                        className="space-y-6"
                    >
                        <div className="flex justify-between items-center text-sm font-medium text-gray-400">
                            <span>Question {currentQuestionIndex + 1} of {questions.length}</span>
                            <div className="flex gap-1">
                                {questions.map((_, i) => (
                                    <div key={i} className={`h-1.5 w-6 rounded-full ${i <= currentQuestionIndex ? 'bg-cyan-500' : 'bg-white/10'}`} />
                                ))}
                            </div>
                        </div>

                        <div className="bg-white/5 p-6 rounded-xl border border-white/10 shadow-inner">
                            <p className="text-lg font-medium leading-relaxed">
                                {typeof questions[currentQuestionIndex] === 'string' ? questions[currentQuestionIndex] : questions[currentQuestionIndex]?.question}
                            </p>
                        </div>

                        <div className="space-y-3">
                            <label className="text-sm text-gray-400 font-medium">Select your answer</label>
                            {questions[currentQuestionIndex]?.options ? (
                                questions[currentQuestionIndex].options.map((option, idx) => (
                                    <label key={idx} className={`flex items-center p-4 rounded-xl border cursor-pointer transition-all ${currentAnswer === option ? 'border-cyan-500 bg-cyan-500/10' : 'border-white/10 bg-black/50 hover:bg-white/5'}`}>
                                        <input
                                            type="radio"
                                            name="mcq-option"
                                            value={option}
                                            checked={currentAnswer === option}
                                            onChange={(e) => setCurrentAnswer(e.target.value)}
                                            className="hidden"
                                        />
                                        <div className={`w-5 h-5 rounded-full border flex items-center justify-center mr-4 ${currentAnswer === option ? 'border-cyan-500' : 'border-gray-500'}`}>
                                            {currentAnswer === option && <div className="w-2.5 h-2.5 rounded-full bg-cyan-500" />}
                                        </div>
                                        <span className={currentAnswer === option ? 'text-white' : 'text-gray-300'}>{option}</span>
                                    </label>
                                ))
                            ) : (
                                <textarea
                                    value={currentAnswer}
                                    onChange={(e) => setCurrentAnswer(e.target.value)}
                                    placeholder="Type your answer here..."
                                    className="w-full h-32 bg-black/50 border border-white/10 text-white rounded-xl p-4 focus:outline-none focus:border-cyan-500 transition-colors resize-none shadow-inner"
                                />
                            )}
                        </div>

                        <button
                            onClick={handleNextQuestion}
                            className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white rounded-lg transition-all font-medium shadow-lg shadow-cyan-500/20"
                        >
                            {currentQuestionIndex === questions.length - 1 ? 'Submit Assessment' : 'Next Question'}
                            <ArrowRight className="w-4 h-4" />
                        </button>
                    </motion.div>
                )}

                {currentStep === 'scoring' && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                        className="text-center py-12 space-y-6"
                    >
                        <Loader2 className="w-12 h-12 text-cyan-500 animate-spin mx-auto" />
                        <div>
                            <h3 className="text-xl font-semibold mb-2">AI is analyzing your responses...</h3>
                            <p className="text-sm text-gray-400">This usually takes a few seconds.</p>
                        </div>
                    </motion.div>
                )}

                {currentStep === 'complete' && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                        className="text-center py-8 space-y-6"
                    >
                        <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto border border-green-500/30">
                            <CheckCircle className="w-10 h-10 text-green-500" />
                        </div>
                        <div>
                            <h3 className="text-2xl font-bold mb-2">Assessment Complete!</h3>
                            <p className="text-gray-400 text-sm">Your AI-verified score has been calculated.</p>
                        </div>

                        <div className="inline-block bg-white/5 px-8 py-4 rounded-2xl border border-white/10">
                            <p className="text-xs text-gray-400 uppercase tracking-widest mb-1">Final Score</p>
                            <div className="text-5xl font-black bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                                {finalScore}
                            </div>
                        </div>

                        <p className="text-xs text-gray-500 animate-pulse">Redirecting to dashboard...</p>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default ProctoredAssessment;
