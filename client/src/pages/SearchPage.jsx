import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Sparkles, User, Briefcase, Code, MapPin, Sliders, ExternalLink, Filter, X, CheckCircle, Github } from 'lucide-react';

const SearchPage = () => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [isFocused, setIsFocused] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [showFilters, setShowFilters] = useState(false);
    const [activeFilters, setActiveFilters] = useState({ verified: false, role: 'All' });

    // Debounce search
    useEffect(() => {
        const fetchResults = async () => {
            setIsLoading(true);
            try {
                // In production, use environment variable for API URL
                const response = await fetch(`http://localhost:8000/api/search?query=${query}`);
                const data = await response.json();
                setResults(data.candidates);
            } catch (error) {
                console.error("Failed to fetch candidates:", error);
                // Fallback / Initial state handled by setResults([]) or error state
            } finally {
                setIsLoading(false);
            }
        };

        const timer = setTimeout(fetchResults, 500);
        return () => clearTimeout(timer);
    }, [query]);

    // Client-side filtering
    const filteredResults = results.filter(candidate => {
        if (activeFilters.verified && !candidate.verified) return false;
        if (activeFilters.role !== 'All' && !candidate.role.includes(activeFilters.role)) return false;
        return true;
    });

    return (
        <div className="min-h-screen pt-24 px-4 bg-dark relative overflow-hidden flex flex-col items-center">
            {/* Background Ambience */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-20%] left-[30%] w-[60vw] h-[60vw] bg-primary/10 rounded-full blur-[120px] animate-pulse" />
            </div>

            <div className="w-full max-w-6xl relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-12"
                >
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-6 backdrop-blur-sm">
                        <Sparkles className="w-4 h-4 text-yellow-400" />
                        <span className="text-sm text-gray-300">AI-Powered Talent Discovery</span>
                    </div>
                    <h1 className="text-5xl md:text-6xl font-bold mb-6">
                        Find Your Perfect <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-secondary to-pink-500">Match</span>
                    </h1>
                </motion.div>

                {/* Search Bar & Filters */}
                <div className="relative max-w-4xl mx-auto mb-16 space-y-4">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className={`
                            relative p-1 rounded-2xl bg-gradient-to-r from-primary/50 via-secondary/50 to-pink-500/50 
                            transition-all duration-300 ${isFocused ? 'shadow-[0_0_40px_-10px_rgba(var(--primary-rgb),0.5)] scale-[1.01]' : 'shadow-lg'}
                        `}
                    >
                        <div className="relative bg-black/80 backdrop-blur-xl rounded-xl flex items-center p-2 border border-white/10 shadow-lg">
                            <Search className={`w-6 h-6 ml-4 mr-4 transition-colors ${isFocused ? 'text-primary' : 'text-gray-500'}`} />
                            <input
                                type="text"
                                placeholder="Search by skill, role, or name..."
                                className="w-full bg-transparent border-none outline-none text-white text-lg placeholder-gray-500 h-12"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                onFocus={() => setIsFocused(true)}
                                onBlur={() => setIsFocused(false)}
                            />
                            <button
                                onClick={() => setShowFilters(!showFilters)}
                                className={`hidden md:flex items-center gap-2 px-6 py-3 rounded-lg transition-colors border text-sm font-medium ${showFilters ? 'bg-primary/20 border-primary text-primary' : 'bg-white/10 border-white/10 text-gray-300 hover:bg-white/20'}`}
                            >
                                <Sliders className="w-4 h-4" /> Filters
                            </button>
                        </div>
                    </motion.div>

                    {/* Filter Panel */}
                    <AnimatePresence>
                        {showFilters && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="overflow-hidden"
                            >
                                <div className="glass-panel p-6 flex flex-wrap gap-8 items-center bg-black/40">
                                    <div className="flex items-center gap-4">
                                        <span className="text-sm font-medium text-gray-400">Verified Only:</span>
                                        <button
                                            onClick={() => setActiveFilters(p => ({ ...p, verified: !p.verified }))}
                                            className={`w-12 h-6 rounded-full p-1 transition-colors ${activeFilters.verified ? 'bg-secondary' : 'bg-gray-700'}`}
                                        >
                                            <div className={`w-4 h-4 rounded-full bg-white transition-transform ${activeFilters.verified ? 'translate-x-6' : 'translate-x-0'}`} />
                                        </button>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <span className="text-sm font-medium text-gray-400">Role:</span>
                                        {['All', 'Developer', 'Designer'].map(role => (
                                            <button
                                                key={role}
                                                onClick={() => setActiveFilters(p => ({ ...p, role }))}
                                                className={`px-3 py-1 rounded-md text-sm transition-colors ${activeFilters.role === role ? 'bg-primary text-white' : 'text-gray-400 hover:text-white'}`}
                                            >
                                                {role}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Results Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-20">
                    {isLoading ? (
                        <div className="col-span-full text-center py-20 text-gray-500">Searching...</div>
                    ) : filteredResults.length > 0 ? (
                        filteredResults.map((candidate) => (
                            <CandidateCard key={candidate.id} candidate={candidate} />
                        ))
                    ) : (
                        <div className="col-span-full text-center py-20 text-gray-500">
                            No matches found. Try "React" or "Python".
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const CandidateCard = ({ candidate }) => (
    <motion.div
        layout
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="glass-panel p-6 hover:border-primary/50 transition-colors group relative overflow-hidden"
    >
        <div className="absolute top-0 right-0 p-4">
            {candidate.verified && (
                <div className="text-secondary opacity-50 group-hover:opacity-100 transition-opacity" title="Verified Skills">
                    <CheckCircle className="w-5 h-5" />
                </div>
            )}
        </div>

        <div className="flex items-center gap-4 mb-6">
            <img src={candidate.image} alt={candidate.name} className="w-16 h-16 rounded-full bg-gray-800" />
            <div>
                <h3 className="text-lg font-bold text-white group-hover:text-primary transition-colors">{candidate.name}</h3>
                <p className="text-sm text-gray-400 flex items-center gap-1">
                    <Briefcase className="w-3 h-3" /> {candidate.role}
                </p>
                <p className="text-xs text-gray-500 mt-1">{candidate.experience}</p>
            </div>
        </div>

        <div className="mb-6">
            <div className="flex flex-wrap gap-2">
                {candidate.skills.map((skill, i) => (
                    <span key={i} className="px-2 py-1 rounded bg-white/5 border border-white/10 text-xs text-gray-300">
                        {skill}
                    </span>
                ))}
            </div>
        </div>

        <div className="flex items-center gap-3">
            <button className="flex-1 py-2 rounded-lg bg-primary hover:bg-primary/90 text-white font-medium text-sm transition-colors shadow-lg shadow-primary/20">
                View Profile
            </button>
            <a
                href={candidate.github}
                target="_blank"
                rel="noreferrer"
                className="p-2 rounded-lg bg-white/5 hover:bg-gray-800 hover:text-white text-gray-400 transition-all border border-white/10"
                title="View GitHub"
            >
                <Github className="w-5 h-5" />
            </a>
            <a
                href={candidate.linkedin}
                target="_blank"
                rel="noreferrer"
                className="p-2 rounded-lg bg-white/5 hover:bg-[#0077b5] hover:text-white text-gray-400 transition-all border border-white/10"
                title="Connect on LinkedIn"
            >
                <ExternalLink className="w-5 h-5" />
            </a>
        </div>
    </motion.div>
);

export default SearchPage;
