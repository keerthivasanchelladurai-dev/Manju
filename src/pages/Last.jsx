import React, { useEffect, useRef } from 'react';
import './Last.css';

const Last = () => {
    const particlesContainerRef = useRef(null);

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

    return (
        <div className="last-body">
            <div className="particles" ref={particlesContainerRef}></div>

            <div className="glass-card">
                <h1 className="last-title">My Dearest...</h1>
                
                <div className="content-placeholder">
                    [ I will write my beautiful message here later... ]
                </div>

                <div className="signature">- Yours</div>
            </div>
        </div>
    );
};

export default Last;
