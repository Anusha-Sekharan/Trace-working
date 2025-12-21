import React from 'react';
import { Link } from 'react-router-dom';
import { Activity, Shield, Users } from 'lucide-react';

const Navbar = () => {
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
                    <Link to="/dashboard" className="hover:text-primary transition-colors flex items-center gap-2">
                        <Users className="w-4 h-4" /> Find Teams
                    </Link>
                    <Link to="/verify" className="hover:text-primary transition-colors flex items-center gap-2">
                        <Shield className="w-4 h-4" /> Verify Skills
                    </Link>
                </div>

                <div className="flex items-center space-x-4">
                    <button className="px-4 py-2 rounded-lg bg-primary/20 text-primary border border-primary/50 hover:bg-primary/30 transition-all font-semibold backdrop-blur-md">
                        Sign In
                    </button>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
