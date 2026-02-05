import React from 'react';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { User, Mail, Shield, Calendar, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    if (!user) {
        return (
            <div className="pt-24 flex justify-center items-center min-h-screen text-gray-400">
                Please log in to view your profile.
            </div>
        );
    }

    return (
        <div className="pt-24 px-4 max-w-4xl mx-auto min-h-screen">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-panel p-8 rounded-2xl border border-white/10"
            >
                <div className="flex flex-col md:flex-row items-center gap-8 mb-8">
                    {/* Avatar */}
                    <div className="relative">
                        <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-primary/20 shadow-xl shadow-primary/10">
                            {user.picture ? (
                                <img src={user.picture} alt={user.full_name} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-4xl font-bold text-white">
                                    {user.email?.[0]?.toUpperCase()}
                                </div>
                            )}
                        </div>
                        {user.picture && (
                            <div className="absolute bottom-0 right-2 w-8 h-8 bg-green-500 rounded-full border-4 border-[#0a0a0a]" title="Verified via Google"></div>
                        )}
                    </div>

                    {/* Basic Info */}
                    <div className="text-center md:text-left flex-1">
                        <h1 className="text-3xl font-bold text-white mb-2">{user.full_name || "User"}</h1>
                        <div className="flex items-center justify-center md:justify-start gap-2 text-gray-400 mb-4">
                            <Mail className="w-4 h-4" />
                            <span>{user.email}</span>
                        </div>
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm border border-primary/20">
                            <Shield className="w-4 h-4" />
                            <span>Verified Account</span>
                        </div>
                    </div>

                    {/* Actions */}
                    <div>
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 transition-all font-medium"
                        >
                            <LogOut className="w-4 h-4" />
                            Sign Out
                        </button>
                    </div>
                </div>

                {/* Additional Stats / Placeholder */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t border-white/10 pt-8">
                    <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                        <div className="text-gray-400 text-sm mb-1">Account Type</div>
                        <div className="text-xl font-semibold text-white">Developer</div>
                    </div>
                    <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                        <div className="text-gray-400 text-sm mb-1">Member Since</div>
                        <div className="text-xl font-semibold text-white flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-gray-500" />
                            2024
                        </div>
                    </div>
                    <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                        <div className="text-gray-400 text-sm mb-1">Status</div>
                        <div className="text-green-400 font-semibold">Active</div>
                    </div>
                </div>

            </motion.div>
        </div>
    );
};

export default Profile;
