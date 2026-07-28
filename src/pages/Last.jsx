import React, { useEffect, useRef, useState } from 'react';
import './Last.css';

const wishes = [
    {
        label: "Romantic",
        icon: "❤️",
        title: "Happy Birthday! 🎂❤️",
        text: "Today isn't just about celebrating your age—it's about celebrating the beautiful person you are. I hope this new chapter brings you endless happiness, good health, unforgettable memories, and every dream your heart holds. Keep smiling, because your smile makes the world a little brighter. Have the most wonderful birthday!"
    },
    {
        label: "Elegant",
        icon: "✨",
        title: "Happy Birthday! 🎉",
        text: "Twenty-eight years of laughter, strength, kindness, and beautiful memories. May this year open doors to new opportunities, fill your days with peace, and bring you all the happiness you truly deserve. Wishing you a year as amazing as you are."
    },
    {
        label: "Emotional",
        icon: "🌸",
        title: "Happy Birthday! ❤️",
        text: "Some people make life brighter just by being themselves, and you're one of them. I hope your  year is filled with love, success, laughter, and moments that become your favorite memories. Never stop believing in yourself because the best is yet to come."
    },
    {
        label: "Cinematic",
        icon: "🎬",
        title: "Happy Birthday! ✨",
        text: "Another year. Another chapter. Another 365 days to dream bigger, smile brighter, and create unforgettable memories. May this year bring you everything you've been quietly wishing for. Enjoy every moment—today is all about you. ❤️"
    },
    {
        label: "For You",
        icon: "💖",
        title: "Happy Birthday! 🎂❤️",
        text: "I hope today brings you as much happiness as you bring to the people around you. You deserve all the love, laughter, success, and beautiful moments life has to offer. Keep shining, keep smiling, and never stop being the amazing person you are. Wishing you the happiest birthday and a year full of magic. ✨"
    }
];

const Last = () => {
    const particlesContainerRef = useRef(null);
    const [activeTab, setActiveTab] = useState(0);
    const [fade, setFade] = useState('fade-in');

    useEffect(() => {
        const particlesContainer = particlesContainerRef.current;
        if (!particlesContainer) return;

        const particleCount = 40;
        const particles = [];

        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';

            const size = Math.random() * 4 + 2;
            const left = Math.random() * 100;
            const duration = Math.random() * 15 + 10;
            const delay = Math.random() * 10;

            particle.style.width = `${size}px`;
            particle.style.height = `${size}px`;
            particle.style.left = `${left}%`;
            particle.style.animationDuration = `${duration}s`;
            particle.style.animationDelay = `${delay}s`;

            particlesContainer.appendChild(particle);
            particles.push(particle);
        }

        return () => {
            particles.forEach(p => {
                if (particlesContainer.contains(p)) {
                    particlesContainer.removeChild(p);
                }
            });
        };
    }, []);

    const handleTabChange = (index) => {
        if (index === activeTab) return;
        setFade('fade-out');
        setTimeout(() => {
            setActiveTab(index);
            setFade('fade-in');
        }, 300);
    };

    return (
        <div className="last-body">
            <div className="particles" ref={particlesContainerRef}></div>

            <div className="glass-card">
                <h1 className="last-title">My Dearest To You...</h1>

                <div className="emotion-tabs">
                    {wishes.map((wish, idx) => (
                        <button
                            key={idx}
                            className={`emotion-tab ${activeTab === idx ? 'active' : ''}`}
                            onClick={() => handleTabChange(idx)}
                        >
                            {wish.icon} <span className="tab-label">{wish.label}</span>
                        </button>
                    ))}
                </div>

                <div className={`message-content ${fade}`}>
                    <h2 className="message-title">{wishes[activeTab].title}</h2>
                    <p className="message-text">{wishes[activeTab].text}</p>
                </div>

                <div className="signature">- Yours always ❤️</div>
                
                <div className="close-section">
                    <p className="close-text">If you have completed reading, you can leave. The page will close automatically.</p>
                    <button className="close-btn" onClick={() => window.close()}>Close Page</button>
                </div>
            </div>
        </div>
    );
};

export default Last;
