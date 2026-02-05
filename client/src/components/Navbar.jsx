import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Activity, Shield, Users, LogOut, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <nav className="fixed top-0 w-full z-50 p-4">
            <div className="max-w-7xl mx-auto glass-panel px-6 py-3 flex justify-between items-center">
                <Link to="/" className="flex items-center space-x-2">
                    <Activity className="w-8 h-8 text-primary" />
                    <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
                        TRACE
                    </span>
                </Link>

                <div className="hidden md:flex space-x-8 text-sm font-medium text-gray-300">
                    <Link to="/search" className="hover:text-primary transition-colors flex items-center gap-2">
                        <Users className="w-4 h-4" /> Find Teams
                    </Link>
                    <Link to="/verify" className="hover:text-primary transition-colors flex items-center gap-2">
                        <Shield className="w-4 h-4" /> Verify Skills
                    </Link>
                    {user && (
                        <Link to="/dashboard" className="hover:text-primary transition-colors flex items-center gap-2">
                            <Activity className="w-4 h-4" /> Dashboard
                        </Link>
                    )}
                </div>

                <div className="flex items-center space-x-4">
                    {user ? (
                        <div className="flex items-center gap-4">
                            <Link to="/profile" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                                <span className="text-sm text-gray-400 hidden sm:block">
                                    Hello, {user.full_name || user.email.split('@')[0]}
                                </span>
                                <div className="w-8 h-8 rounded-full border border-white/20 overflow-hidden">
                                    {user.picture ? (
                                        <img src={user.picture} alt="Profile" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full bg-gradient-to-tr from-primary to-secondary flex items-center justify-center font-bold text-white text-sm">
                                            {user.email[0].toUpperCase()}
                                        </div>
                                    )}
                                </div>
                            </Link>
                            <button
                                onClick={handleLogout}
                                className="p-2 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white transition-colors"
                                title="Sign Out"
                            >
                                <LogOut className="w-5 h-5" />
                            </button>
                        </div>
                    ) : (
                        <Link to="/login" className="px-4 py-2 rounded-lg bg-primary/20 text-primary border border-primary/50 hover:bg-primary/30 transition-all font-semibold backdrop-blur-md">
                            Sign In
                        </Link>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
