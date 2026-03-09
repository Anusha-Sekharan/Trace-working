import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { User, Mail, Shield, Calendar, LogOut, FileUp, Download, Loader } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
    const { user, logout, token } = useAuth();
    const navigate = useNavigate();
    const [uploading, setUploading] = useState(false);
    const [uploadError, setUploadError] = useState('');
    const [deleting, setDeleting] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const handleDeleteAccount = async () => {
        const confirmDelete = window.confirm(
            "Are you sure you want to permanently delete your account? This will erase all your profile data and evidence bundles. This action cannot be undone."
        );
        if (!confirmDelete) return;

        setDeleting(true);
        try {
            const res = await fetch('http://localhost:8000/api/user/account', {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!res.ok) {
                const errData = await res.json();
                throw new Error(errData.detail || 'Failed to delete account');
            }

            // Success, log them out and redirect to home
            logout();
            navigate('/');
        } catch (err) {
            alert(err.message);
            setDeleting(false);
        }
    };

    const handleUploadEvidence = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploading(true);
        setUploadError('');

        try {
            const formData = new FormData();
            formData.append('file', file);

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

            const updatedUser = await uploadResponse.json();

            // Note: In an ideal scenario updateUser is available in context
            // For now, reload window to fetch updated user state
            window.location.reload();

        } catch (err) {
            setUploadError(err.message);
        } finally {
            setUploading(false);
        }
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
                    <div className="flex flex-col gap-3">
                        <button
                            onClick={handleLogout}
                            className="flex items-center justify-center gap-2 px-6 py-2 rounded-xl bg-white/10 text-white border border-white/20 hover:bg-white/20 transition-all font-medium"
                        >
                            <LogOut className="w-4 h-4" />
                            Sign Out
                        </button>
                        <button
                            onClick={handleDeleteAccount}
                            disabled={deleting}
                            className="flex items-center justify-center gap-2 px-6 py-2 rounded-xl bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500/20 transition-all font-medium disabled:opacity-50"
                        >
                            {deleting ? <Loader className="w-4 h-4 animate-spin" /> : <LogOut className="w-4 h-4" />}
                            {deleting ? 'Deleting...' : 'Delete Account'}
                        </button>
                    </div>
                </div>

                {/* Additional Stats / Placeholder */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t border-white/10 pt-8 mt-8">
                    <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                        <div className="text-gray-400 text-sm mb-1">Account Type</div>
                        <div className="text-xl font-semibold text-white">Developer</div>
                    </div>
                    <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                        <div className="text-gray-400 text-sm mb-1">Member Since</div>
                        <div className="text-xl font-semibold text-white flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-gray-500" />
                            {user.created_at ? new Date(user.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : '2024'}
                        </div>
                    </div>
                    <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                        <div className="text-gray-400 text-sm mb-1">Status</div>
                        <div className="text-green-400 font-semibold">Active</div>
                    </div>
                </div>

                {/* Evidence Bundle Section */}
                <div className="mt-8 border-t border-white/10 pt-8">
                    <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                        <Shield className="w-5 h-5 text-primary" />
                        Evidence Bundle
                    </h3>
                    <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                        {user.evidence_bundle ? (
                            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                                <div>
                                    <p className="text-gray-300 mb-1">Your evidence bundle is uploaded.</p>
                                    <p className="text-xs text-gray-500">Contains your certificates, resume or portfolio.</p>
                                </div>
                                <div className="flex gap-3">
                                    <a
                                        href={`http://localhost:8000/${user.evidence_bundle}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-2 px-4 py-2 bg-primary/20 text-primary rounded-lg border border-primary/30 hover:bg-primary/30 transition-colors"
                                    >
                                        <Download className="w-4 h-4" /> Download
                                    </a>
                                    <div className="relative">
                                        <input
                                            type="file"
                                            accept=".zip,.pdf"
                                            onChange={handleUploadEvidence}
                                            disabled={uploading}
                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                                        />
                                        <button disabled={uploading} className="flex items-center gap-2 px-4 py-2 bg-white/10 text-white rounded-lg border border-white/20 hover:bg-white/20 transition-colors disabled:opacity-50">
                                            {uploading ? <Loader className="w-4 h-4 animate-spin" /> : <FileUp className="w-4 h-4" />}
                                            Update
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-6 text-center">
                                <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-4 border border-white/10">
                                    <FileUp className="w-8 h-8 text-gray-500" />
                                </div>
                                <h4 className="text-lg font-medium text-white mb-2">No Evidence Bundle</h4>
                                <p className="text-gray-400 text-sm mb-6 max-w-md mx-auto">
                                    Upload a ZIP or PDF containing your resume, certificates, or portfolio to verify your skills.
                                </p>

                                {uploadError && (
                                    <p className="text-red-400 text-sm mb-4">{uploadError}</p>
                                )}

                                <div className="relative inline-block">
                                    <input
                                        type="file"
                                        accept=".zip,.pdf"
                                        onChange={handleUploadEvidence}
                                        disabled={uploading}
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                                    />
                                    <button disabled={uploading} className="flex items-center gap-2 px-6 py-3 bg-primary text-black font-semibold rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50">
                                        {uploading ? (
                                            <>
                                                <Loader className="w-5 h-5 animate-spin" /> Uploading...
                                            </>
                                        ) : (
                                            <>
                                                <FileUp className="w-5 h-5" /> Upload Bundle
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

            </motion.div>
        </div>
    );
};

export default Profile;
