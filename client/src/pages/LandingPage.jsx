import React from 'react';
import { Shield, Target, Cpu, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const LandingPage = () => {
    return (
        <div className="pt-24 pb-12 px-4 max-w-7xl mx-auto">
            {/* Hero Section */}
            <div className="text-center py-20">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                >
                    <span className="px-4 py-1.5 rounded-full border border-primary/30 bg-primary/10 text-primary text-sm font-semibold mb-6 inline-block">
                        AI-Driven Team Formation
                    </span>
                    <h1 className="text-6xl md:text-8xl font-bold mb-6 tracking-tight">
                        Build Teams on <br />
                        <span className="text-gradient">Trust, Not Chance.</span>
                    </h1>
                    <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-10">
                        Stop guessing. TRACE uses AI to verify skills, analyze code, and conduct technical interviews to match you with exactly the right people.
                    </p>
                    <div className="flex justify-center gap-4">
                        <Link to="/dashboard" className="px-8 py-4 bg-primary hover:bg-primary/90 rounded-xl font-bold text-lg shadow-lg shadow-primary/25 transition-all flex items-center gap-2">
                            Start Matching <ArrowRight className="w-5 h-5" />
                        </Link>
                        <button className="px-8 py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl font-bold text-lg transition-all">
                            For Recruiters
                        </button>
                    </div>
                </motion.div>
            </div>

            {/* Feature Grid */}
            <div className="grid md:grid-cols-3 gap-8 mt-20">
                <FeatureCard
                    icon={<Shield className="w-8 h-8 text-secondary" />}
                    title="Verified Skills"
                    desc="No more fake resumes. We pull data directly from GitHub, Coursera, and LinkedIn APIs."
                />
                <FeatureCard
                    icon={<Cpu className="w-8 h-8 text-purple-500" />}
                    title="AI Interviewer"
                    desc="Our AI conducts real-time technical interviews to validate problem-solving skills."
                />
                <FeatureCard
                    icon={<Target className="w-8 h-8 text-blue-500" />}
                    title="Smart Matching"
                    desc="Semantic matching algorithms ensure cultural and technical fit for your specific project."
                />
            </div>
        </div>
    );
};

const FeatureCard = ({ icon, title, desc }) => (
    <div className="glass-panel p-8 hover:transform hover:-translate-y-2 transition-all duration-300">
        <div className="bg-white/5 w-16 h-16 rounded-lg flex items-center justify-center mb-6">
            {icon}
        </div>
        <h3 className="text-xl font-bold mb-3">{title}</h3>
        <p className="text-gray-400 leading-relaxed">{desc}</p>
    </div>
);

export default LandingPage;
