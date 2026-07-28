import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Index.css';

const Index = () => {
    const [currentStep, setCurrentStep] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const nextStep = (step) => {
        setCurrentStep(step);
    };

    const goBack = () => {
        setCurrentStep(0);
    };

    const proceedToSurprise = () => {
        setIsLoading(true);
        setTimeout(() => {
            navigate('/intro');
        }, 2000);
    };

    return (
        <div className="font-sans text-gray-800 min-h-screen w-screen overflow-x-hidden overflow-y-auto relative bg-gradient-to-br from-rose-50 to-rose-100">
            {/* Main Content */}
            <main id="main-content" className="h-full w-full flex items-center justify-center p-4 min-h-screen">
                <div className="bg-white/80 backdrop-blur-md rounded-3xl p-8 max-w-2xl w-full shadow-2xl border border-white/50 text-center relative overflow-hidden">
                    
                    {/* Step 0 */}
                    <div id="step-0" className={`step-container flex-col items-center ${currentStep === 0 ? 'active' : ''}`}>
                        <h1 className="font-display text-4xl md:text-5xl font-bold text-bunny-dark mb-4 mt-4">Something Special Awaits!</h1>
                        <p className="text-lg text-gray-600 mb-8">Before we continue, we need to go through a quick security check.</p>
                        <button onClick={() => nextStep(1)} className="px-8 py-3 bg-bunny-main hover:bg-bunny-dark text-white rounded-full font-bold text-xl transition-all shadow-lg hover:shadow-bunny-main/50 transform hover:scale-105">
                            Start Verification
                        </button>
                    </div>

                    {/* Step 1 */}
                    <div id="step-1" className={`step-container flex-col items-center ${currentStep === 1 ? 'active' : ''}`}>
                        <h2 className="font-display text-2xl text-bunny-main mb-2">Security Check 1/3</h2>
                        <svg viewBox="0 0 200 200" className={`bunny-image mb-6 ${currentStep === 1 ? 'animate-bounce-in' : ''} animate-hop`} xmlns="http://www.w3.org/2000/svg">
                            <circle cx="100" cy="100" r="95" fill="#fbcfe8" />
                            <ellipse cx="100" cy="130" rx="60" ry="45" fill="#ffffff" />
                            <path d="M 60 100 Q 30 30 70 50 Q 80 80 80 100" fill="#ffffff" />
                            <path d="M 65 95 Q 50 50 70 65" stroke="#f472b6" strokeWidth="8" fill="none" strokeLinecap="round" />
                            <path d="M 120 100 Q 150 10 135 60 Q 130 80 130 100" fill="#ffffff" />
                            <path d="M 125 95 Q 135 50 128 65" stroke="#f472b6" strokeWidth="8" fill="none" strokeLinecap="round" />
                            <circle cx="80" cy="115" r="12" fill="#333" />
                            <circle cx="84" cy="112" r="4" fill="#fff" />
                            <circle cx="130" cy="120" r="15" fill="#333" />
                            <circle cx="127" cy="117" r="5" fill="#fff" />
                            <ellipse cx="105" cy="135" rx="8" ry="6" fill="#f472b6" />
                            <path d="M 95 145 Q 105 150 115 145" stroke="#333" strokeWidth="2" fill="none" />
                            <rect x="99" y="146" width="6" height="10" fill="#fff" stroke="#333" strokeWidth="1.5" rx="1" />
                            <rect x="105" y="146" width="6" height="10" fill="#fff" stroke="#333" strokeWidth="1.5" rx="1" />
                        </svg>
                        <h3 className="font-display text-3xl font-bold text-gray-800 mb-6">Are you absolutely sure you want to continue?</h3>
                        <div className="flex gap-4">
                            <button onClick={() => nextStep(2)} className="px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-full font-bold text-lg transition-all shadow-md">
                                Yes, I'm sure!
                            </button>
                            <button onClick={goBack} className="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-full font-bold text-lg transition-all">
                                Wait, no
                            </button>
                        </div>
                    </div>

                    {/* Step 2 */}
                    <div id="step-2" className={`step-container flex-col items-center ${currentStep === 2 ? 'active' : ''}`}>
                        <h2 className="font-display text-2xl text-bunny-main mb-2">Security Check 2/3</h2>
                        <svg viewBox="0 0 200 200" className={`bunny-image mb-6 ${currentStep === 2 ? 'animate-bounce-in' : ''} animate-hop`} style={{ animationDelay: '0.2s' }} xmlns="http://www.w3.org/2000/svg">
                            <circle cx="100" cy="100" r="95" fill="#fde68a" />
                            <ellipse cx="75" cy="70" rx="18" ry="50" fill="#ffffff" transform="rotate(-15 75 70)" />
                            <ellipse cx="125" cy="70" rx="18" ry="50" fill="#ffffff" transform="rotate(15 125 70)" />
                            <ellipse cx="75" cy="70" rx="8" ry="35" fill="#fca5a5" transform="rotate(-15 75 70)" />
                            <ellipse cx="125" cy="70" rx="8" ry="35" fill="#fca5a5" transform="rotate(15 125 70)" />
                            <ellipse cx="100" cy="130" rx="65" ry="45" fill="#ffffff" />
                            <path d="M 65 115 L 95 125 L 65 125 Z" fill="#333" />
                            <path d="M 135 115 L 105 125 L 135 125 Z" fill="#333" />
                            <circle cx="85" cy="122" r="2" fill="#fff" />
                            <circle cx="115" cy="122" r="2" fill="#fff" />
                            <polygon points="95,135 105,135 100,142" fill="#fca5a5" />
                            <path d="M 85 150 Q 100 145 115 150" stroke="#333" strokeWidth="3" fill="none" strokeLinecap="round" />
                        </svg>
                        <h3 className="font-display text-3xl font-bold text-gray-800 mb-6">Like, really, REALLY sure?</h3>
                        <div className="flex gap-4">
                            <button onClick={() => nextStep(3)} className="px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-full font-bold text-lg transition-all shadow-md">
                                Yes, definitely!
                            </button>
                        </div>
                    </div>

                    {/* Step 3 */}
                    <div id="step-3" className={`step-container flex-col items-center ${currentStep === 3 ? 'active' : ''}`}>
                        <h2 className="font-display text-2xl text-bunny-main mb-2">Final Security Check 3/3</h2>
                        <svg viewBox="0 0 200 200" className={`bunny-image mb-6 ${currentStep === 3 ? 'animate-bounce-in' : ''} animate-hop`} style={{ animationDelay: '0.4s' }} xmlns="http://www.w3.org/2000/svg">
                            <circle cx="100" cy="100" r="95" fill="#bbf7d0" />
                            <path d="M 65 100 Q 10 40 30 15 Q 60 40 85 90" fill="#ffffff" />
                            <path d="M 135 100 Q 190 40 170 15 Q 140 40 115 90" fill="#ffffff" />
                            <path d="M 45 45 L 70 80" stroke="#fca5a5" strokeWidth="8" fill="none" strokeLinecap="round" />
                            <path d="M 155 45 L 130 80" stroke="#fca5a5" strokeWidth="8" fill="none" strokeLinecap="round" />
                            <ellipse cx="100" cy="130" rx="55" ry="50" fill="#ffffff" />
                            <circle cx="75" cy="115" r="16" fill="#fff" stroke="#333" strokeWidth="2.5" />
                            <path d="M 75 115 m -6 0 a 6 6 0 1 0 12 0 a 12 12 0 1 0 -24 0" stroke="#333" strokeWidth="2" fill="none" />
                            <circle cx="125" cy="115" r="20" fill="#fff" stroke="#333" strokeWidth="2.5" />
                            <path d="M 125 115 m -7 0 a 7 7 0 1 0 14 0 a 14 14 0 1 0 -28 0" stroke="#333" strokeWidth="2" fill="none" />
                            <ellipse cx="100" cy="135" rx="7" ry="5" fill="#fca5a5" />
                            <path d="M 75 145 Q 100 185 125 145 Z" fill="#991b1b" stroke="#333" strokeWidth="2" />
                            <path d="M 85 155 Q 100 175 115 155 Z" fill="#fca5a5" />
                        </svg>
                        <h3 className="font-display text-3xl font-bold text-gray-800 mb-6">Okay, last chance to turn back... Ready?</h3>
                        <div className="flex gap-4">
                            <button onClick={() => nextStep(4)} className="px-8 py-4 bg-bunny-main hover:bg-bunny-dark text-white rounded-full font-bold text-xl transition-all shadow-lg animate-pulse">
                                Show me what's next!
                            </button>
                        </div>
                    </div>

                    {/* Step 4 */}
                    <div id="step-4" className={`step-container flex-col items-center ${currentStep === 4 ? 'active' : ''}`}>
                        <div className={`w-full max-w-lg mx-auto bg-yellow-50 border-l-4 border-yellow-400 p-6 rounded-r-xl shadow-md text-left ${currentStep === 4 ? 'animate-bounce-in' : ''}`}>
                            <h3 className="font-display text-2xl font-bold text-yellow-800 mb-4 flex items-center gap-2">
                                <span>⚠️</span> Important Notice
                            </h3>
                            <p className="text-gray-700 text-lg leading-relaxed mb-4">
                                If you have a free state of mind right now, you may proceed deep into the experience.
                            </p>
                            <p className="text-gray-700 text-lg leading-relaxed font-semibold">
                                Otherwise, please make your mind calm and free up some time, because the next part takes time to fully experience.
                            </p>
                        </div>

                        <div className="mt-10 flex gap-4">
                            <button 
                                onClick={proceedToSurprise} 
                                disabled={isLoading}
                                className={`px-8 py-3 text-white rounded-full font-bold text-lg transition-all shadow-md flex items-center gap-2 ${isLoading ? 'bg-purple-500' : 'bg-blue-500 hover:bg-blue-600'}`}
                            >
                                {isLoading ? 'Loading the magic... ✨' : "I am ready, let's go! 🚀"}
                            </button>
                            <button onClick={goBack} className="px-8 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-full font-bold text-lg transition-all">
                                I'll come back later
                            </button>
                        </div>
                    </div>

                </div>
            </main>
        </div>
    );
};

export default Index;
