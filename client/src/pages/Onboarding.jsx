import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Github, Linkedin, ArrowRight, FileUp, Briefcase } from 'lucide-react';
import { motion } from 'framer-motion';
import ProctoredAssessment from '../components/ProctoredAssessment';

const Onboarding = () => {
    const { user, token, updateUser } = useAuth();
    const navigate = useNavigate();
    const [githubLink, setGithubLink] = useState('');
    const [linkedinLink, setLinkedinLink] = useState('');
    const [evidenceFile, setEvidenceFile] = useState(null);
    const [role, setRole] = useState('');
    const [showAssessment, setShowAssessment] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            // First, update profile links
            const profileResponse = await fetch('http://localhost:8000/api/user/profile', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    github_link: githubLink,
                    linkedin_link: linkedinLink
                })
            });

            if (!profileResponse.ok) {
                throw new Error('Failed to update profile links');
            }

            let updatedUser = await profileResponse.json();

            // Then, upload evidence bundle if provided
            if (evidenceFile) {
                const formData = new FormData();
                formData.append('file', evidenceFile);

                const uploadResponse = await fetch('http://localhost:8000/api/user/upload-evidence', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    },
                    body: formData
                });

                if (!uploadResponse.ok) {
                    const errInfo = await uploadResponse.json();
                    throw new Error(errInfo.detail || 'Failed to upload evidence bundle');
                }

                updatedUser = await uploadResponse.json();
            }

            // Update context with the new user data (which might include evidence_bundle)
            if (updateUser) {
                updateUser(updatedUser);
            }

            if (role.trim() !== '') {
                setShowAssessment(true);
            } else {
                navigate('/search'); // Go to Dashboard
            }

        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleAssessmentComplete = (updatedUser) => {
        if (updateUser) {
            updateUser(updatedUser);
        }
        navigate('/search');
    };

    if (showAssessment) {
        return (
            <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="max-w-2xl w-full bg-white/5 border border-white/10 p-8 rounded-3xl backdrop-blur-xl shadow-2xl"
                >
                    <ProctoredAssessment role={role} token={token} onComplete={handleAssessmentComplete} />
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-md w-full bg-white/5 border border-white/10 p-8 rounded-2xl backdrop-blur-xl"
            >
                <h2 className="text-3xl font-bold mb-2">Welcome, {user?.full_name?.split(' ')[0]}! 👋</h2>
                <p className="text-gray-400 mb-8">To help teams find you, please add your professional links.</p>

                {error && (
                    <div className="bg-red-500/10 text-red-500 p-3 rounded mb-4 text-sm">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm text-gray-400 mb-1">GitHub Profile URL</label>
                        <div className="relative">
                            <Github className="absolute left-3 top-3 w-5 h-5 text-gray-500" />
                            <input
                                type="url"
                                placeholder="https://github.com/username"
                                value={githubLink}
                                onChange={(e) => setGithubLink(e.target.value)}
                                className="w-full bg-black/50 border border-white/10 rounded-lg py-2.5 pl-10 pr-4 focus:outline-none focus:border-cyan-500 transition-colors"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm text-gray-400 mb-1">LinkedIn Profile URL</label>
                        <div className="relative">
                            <Linkedin className="absolute left-3 top-3 w-5 h-5 text-gray-500" />
                            <input
                                type="url"
                                placeholder="https://linkedin.com/in/username"
                                value={linkedinLink}
                                onChange={(e) => setLinkedinLink(e.target.value)}
                                className="w-full bg-black/50 border border-white/10 rounded-lg py-2.5 pl-10 pr-4 focus:outline-none focus:border-cyan-500 transition-colors"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm text-gray-400 mb-1">Evidence Bundle (Optional ZIP/PDF)</label>
                        <div className="relative">
                            <FileUp className="absolute left-3 top-3 w-5 h-5 text-gray-500" />
                            <input
                                type="file"
                                accept=".zip,.pdf"
                                onChange={(e) => setEvidenceFile(e.target.files[0])}
                                className="w-full bg-black/50 border border-white/10 rounded-lg py-2.5 pl-10 pr-4 focus:outline-none focus:border-cyan-500 transition-colors file:mr-4 file:py-1 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-cyan-500/10 file:text-cyan-500 hover:file:bg-cyan-500/20"
                            />
                        </div>
                        <p className="text-xs text-gray-500 mt-1">Upload certificates, resumes, or portfolios.</p>
                    </div>

                    <div className="pt-4 border-t border-white/10">
                        <label className="block text-sm text-cyan-400 font-medium mb-1">Your Primary Role (Optional)</label>
                        <p className="text-xs text-gray-400 mb-3">If provided, you will be directed to an AI Proctored Assessment to verify your skills.</p>
                        <div className="relative">
                            <Briefcase className="absolute left-3 top-3 w-5 h-5 text-gray-500" />
                            <input
                                type="text"
                                placeholder="e.g., aiml engineer, react developer"
                                value={role}
                                onChange={(e) => setRole(e.target.value)}
                                className="w-full bg-black/50 border border-white/10 rounded-lg py-2.5 pl-10 pr-4 focus:outline-none focus:border-cyan-500 transition-colors"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold py-3 rounded-lg mt-6 hover:shadow-lg hover:shadow-cyan-500/20 transition-all flex items-center justify-center gap-2"
                    >
                        {loading ? 'Saving...' : (
                            <>
                                {role.trim() !== '' ? 'Start AI Verification' : 'Continue to Dashboard'} <ArrowRight className="w-4 h-4" />
                            </>
                        )}
                    </button>

                    <button
                        type="button"
                        onClick={() => navigate('/search')}
                        className="w-full text-xs text-gray-500 hover:text-gray-300 mt-2"
                    >
                        Skip for now
                    </button>
                </form>
            </motion.div>
        </div>
    );
};

export default Onboarding;
