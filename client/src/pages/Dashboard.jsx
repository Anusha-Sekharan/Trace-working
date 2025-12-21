import React, { useState } from 'react';
import { Search, MapPin, Code, Star, CheckCircle, Loader, Github, Linkedin, Award } from 'lucide-react';

const Dashboard = () => {
    const [searchTerm, setSearchTerm] = useState("");
    const [loading, setLoading] = useState(false);
    const [candidates, setCandidates] = useState([]);
    const [searched, setSearched] = useState(false);

    const handleSearch = async (e) => {
        if (e.key === 'Enter') {
            setLoading(true);
            setSearched(true);
            try {
                // Fetch from our backend
                const response = await fetch(`http://localhost:8000/api/search?query=${searchTerm}`);
                const data = await response.json();
                setCandidates(data.candidates);
            } catch (error) {
                console.error("Search failed:", error);
            } finally {
                setLoading(false);
            }
        }
    };

    return (
        <div className="pt-24 px-4 max-w-7xl mx-auto min-h-screen">
            <div className="mb-8">
                <h2 className="text-3xl font-bold mb-2">Find Your Teammate</h2>
                <p className="text-gray-400">AI-curated matches based on your project requirements.</p>
            </div>

            {/* Search Bar */}
            <div className="relative mb-12">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyDown={handleSearch}
                    placeholder="Try 'aiml engineer', 'react developer'..."
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white focus:outline-none focus:border-primary transition-colors"
                />
            </div>

            {/* Loading State */}
            {loading && (
                <div className="text-center py-20">
                    <Loader className="w-12 h-12 text-primary animate-spin mx-auto mb-4" />
                    <h3 className="text-xl font-bold mb-2">Scanning 3 Sources...</h3>
                    <div className="flex justify-center gap-4 text-sm text-gray-500">
                        <span className="flex items-center gap-1 animate-pulse"><Github className="w-4 h-4" /> GitHub</span>
                        <span className="flex items-center gap-1 animate-pulse delay-100"><Linkedin className="w-4 h-4" /> LinkedIn</span>
                        <span className="flex items-center gap-1 animate-pulse delay-200"><Award className="w-4 h-4" /> Coursera</span>
                    </div>
                </div>
            )}

            {/* Results Grid */}
            {!loading && searched && (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {candidates.map(candidate => (
                        <div key={candidate.id} className="glass-panel p-6 hover:border-primary/50 transition-colors cursor-pointer group flex flex-col">

                            <div className="flex justify-between items-start mb-4">
                                <div className="flex items-center gap-3">
                                    <img src={candidate.avatar} alt={candidate.name} className="w-12 h-12 rounded-full border border-white/20" />
                                    <div>
                                        <h3 className="text-lg font-bold group-hover:text-primary transition-colors line-clamp-1">{candidate.name}</h3>
                                        <p className="text-xs text-gray-400">{candidate.role || "Developer"}</p>
                                    </div>
                                </div>
                                {candidate.verified_badge && (
                                    <div className="text-secondary flex items-center gap-1 text-[10px] bg-secondary/10 px-2 py-1 rounded-full border border-secondary/20 whitespace-nowrap">
                                        <CheckCircle className="w-3 h-3" /> VERIFIED
                                    </div>
                                )}
                            </div>

                            <p className="text-xs text-gray-400 mb-4 line-clamp-2 h-8">{candidate.bio}</p>

                            <div className="flex flex-wrap gap-2 mb-6 mt-auto">
                                {candidate.skills.map(skill => (
                                    <span key={skill} className="text-[10px] px-2 py-1 rounded-md bg-white/5 border border-white/10 text-gray-300">
                                        {skill}
                                    </span>
                                ))}
                            </div>

                            <div className="flex items-center justify-between border-t border-white/10 pt-4">
                                <div className="flex items-center gap-2">
                                    <div className="p-1 px-2 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 rounded-lg border border-yellow-500/30">
                                        <span className="font-bold text-yellow-500">{candidate.score}</span>
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Trace Score</span>
                                        {candidate.verified_badge && <span className="text-[10px] text-blue-400 flex items-center gap-1">Via {candidate.verified_badge.platform}</span>}
                                    </div>
                                </div>
                                <a href={candidate.link} target="_blank" rel="noreferrer" className="p-2 hover:bg-white/10 rounded-full transition-colors">
                                    <Github className="w-5 h-5 text-gray-400" />
                                </a>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {!searchTerm && !loading && (
                <div className="text-center py-20 text-gray-500">
                    <p>Enter a role or skill to start searching.</p>
                </div>
            )}
        </div>
    );
};

export default Dashboard;
