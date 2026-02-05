import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Github, Linkedin, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

const Onboarding = () => {
    const { user, token, updateUser } = useAuth();
    const navigate = useNavigate();
    const [githubLink, setGithubLink] = useState('');
    const [linkedinLink, setLinkedinLink] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await fetch('http://localhost:8000/api/user/profile', {
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

            if (!response.ok) {
                throw new Error('Failed to update profile');
            }

            const updatedUser = await response.json();
            updateUser(updatedUser); // Update context with new user data
            navigate('/search'); // Go to Dashboard

        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

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

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold py-3 rounded-lg mt-6 hover:shadow-lg hover:shadow-cyan-500/20 transition-all flex items-center justify-center gap-2"
                    >
                        {loading ? 'Saving...' : (
                            <>
                                Continue to Dashboard <ArrowRight className="w-4 h-4" />
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
