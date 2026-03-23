import React, { useState } from 'react';
import { Code, CheckCircle, Github, Loader } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

const TeamBuilder = () => {
    const { user, token } = useAuth();
    const [projectDesc, setProjectDesc] = useState("");
    const [recommendedTeam, setRecommendedTeam] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleBuildTeam = async () => {
        setLoading(true);
        try {
            const res = await fetch('http://localhost:8000/api/build-team', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ project_description: projectDesc })
            });
            const data = await res.json();
            setRecommendedTeam(data.team);
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    if (!user) {
        return <div className="pt-24 flex justify-center items-center min-h-screen text-gray-400">Please log in to build a team.</div>;
    }

    return (
        <div className="pt-32 px-4 max-w-7xl mx-auto min-h-screen">
            <div className="mb-12 text-center">
                <h2 className="text-5xl font-black mb-6 text-transparent bg-clip-text bg-gradient-to-r from-secondary to-primary">Autonomous Team Builder</h2>
                <p className="text-gray-400 max-w-2xl mx-auto text-lg">Describe your project and let our AI assemble the perfect balanced squad from our verified talent pool.</p>
            </div>

            <div className="max-w-5xl mx-auto mb-16 glass-panel p-8 border-secondary/30 bg-secondary/5 rounded-3xl shadow-[0_0_40px_rgba(0,255,128,0.1)]">
                <div className="flex flex-col md:flex-row gap-4 mb-8">
                    <input
                        type="text"
                        value={projectDesc}
                        onChange={(e) => setProjectDesc(e.target.value)}
                        placeholder="Describe your project (e.g. 'Build a fintech app with React and Go')"
                        className="flex-1 bg-black/40 border border-white/10 rounded-2xl px-6 py-4 text-white text-lg focus:border-secondary focus:ring-1 focus:ring-secondary transition-all outline-none"
                    />
                    <button
                        onClick={handleBuildTeam}
                        disabled={loading || !projectDesc}
                        className="bg-secondary text-black font-extrabold px-10 py-4 rounded-2xl hover:bg-white transition-all disabled:opacity-50 flex items-center justify-center gap-3 min-w-[250px] text-lg"
                    >
                        {loading ? <Loader className="w-6 h-6 animate-spin" /> : <><Code className="w-6 h-6" /> Generate Squad</>}
                    </button>
                </div>

                {recommendedTeam && (
                    <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="p-8 bg-black/40 rounded-2xl border border-secondary/30 backdrop-blur-md relative overflow-hidden mt-8">
                        <div className="absolute top-0 left-0 w-2 h-full bg-secondary"></div>
                        
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 w-full px-6">
                            <div className="mb-4 md:mb-0">
                                <h4 className="text-3xl font-black text-white mb-2">{recommendedTeam.team_name}</h4>
                                <p className="text-sm text-gray-400 italic max-w-3xl">"{recommendedTeam.reasoning}"</p>
                            </div>
                            <div className="flex flex-col items-end shrink-0 bg-secondary/10 px-6 py-3 rounded-xl border border-secondary/20">
                                <div className="text-4xl font-black text-secondary">{recommendedTeam.synergy_score}%</div>
                                <div className="text-xs font-mono text-secondary/70 uppercase font-bold tracking-widest mt-1">Synergy</div>
                            </div>
                        </div>

                        <div className="flex flex-col md:flex-row flex-wrap gap-6 mt-8 pl-6">
                            {recommendedTeam.member_profiles ? recommendedTeam.member_profiles.map(candidate => (
                                <div key={candidate.id} className="flex flex-col gap-4 p-6 bg-white/5 border border-white/10 rounded-2xl flex-1 hover:border-secondary hover:bg-white/10 transition-all cursor-pointer group" onClick={() => window.open(candidate.link || '#', '_blank')}>
                                    <div className="flex items-center gap-4">
                                        <img src={candidate.avatar} alt={candidate.name} className="w-16 h-16 rounded-full border-2 border-secondary/50 group-hover:border-secondary transition-colors shadow-lg" />
                                        <div className="flex flex-col">
                                            <span className="text-xl font-bold text-white group-hover:text-secondary transition-colors">{candidate.name}</span>
                                            <span className="text-xs text-secondary capitalize font-mono bg-secondary/20 px-2 py-0.5 rounded-md inline-block w-fit mt-1 border border-secondary/30">{candidate.role || "Developer"}</span>
                                        </div>
                                    </div>
                                    
                                    <div className="flex flex-wrap gap-2 mt-2">
                                        {candidate.skills.slice(0, 4).map((s, idx) => (
                                            <span key={idx} className="text-[10px] px-2.5 py-1 bg-black/40 text-gray-300 border border-white/10 rounded-md whitespace-nowrap">{s}</span>
                                        ))}
                                        {candidate.skills.length > 4 && <span className="text-[10px] px-2.5 py-1 text-gray-500 bg-black/20 rounded-md">+{candidate.skills.length - 4}</span>}
                                    </div>
                                </div>
                            )) : recommendedTeam.members.map(id => (
                                <div key={id} className="w-12 h-12 rounded-full bg-secondary/20 border border-secondary/30 flex items-center justify-center text-secondary font-bold">
                                    {id}
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}
            </div>
        </div>
    );
};

export default TeamBuilder;
