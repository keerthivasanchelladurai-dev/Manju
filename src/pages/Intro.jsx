import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './Intro.css';

const Intro = () => {
    const canvasRef = useRef(null);
    const displayAreaRef = useRef(null);
    const navigate = useNavigate();

    useEffect(() => {
        let animationFrameId;
        let timeoutId;
        let navTimeoutId;

        timeoutId = setTimeout(() => {
            const canvas = canvasRef.current;
            const displayArea = displayAreaRef.current;

            if (!canvas || !displayArea) return;

            canvas.width = displayArea.offsetWidth;
            canvas.height = displayArea.offsetHeight;
            const ctx = canvas.getContext('2d');

            const gridSize = 14;
            const cols = Math.ceil(canvas.width / gridSize);
            const rows = Math.ceil(canvas.height / gridSize);
            const totalPixels = cols * rows;

            let pixels = [];
            for (let i = 0; i < cols; i++) {
                for (let j = 0; j < rows; j++) {
                    pixels.push([i, j]);
                }
            }

            for (let i = pixels.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [pixels[i], pixels[j]] = [pixels[j], pixels[i]];
            }

            let currentIndex = 0;
            const pixelsPerFrame = Math.max(1, Math.ceil(totalPixels / 150));

            const fuseLeds = () => {
                ctx.fillStyle = '#fff';

                for (let i = 0; i < pixelsPerFrame; i++) {
                    if (currentIndex >= pixels.length) {
                        navTimeoutId = setTimeout(() => {
                            navigate('/game');
                        }, 1500);
                        return;
                    }
                    const [col, row] = pixels[currentIndex];
                    ctx.fillRect(col * gridSize, row * gridSize, gridSize, gridSize);
                    currentIndex++;
                }
                animationFrameId = requestAnimationFrame(fuseLeds);
            };

            fuseLeds();
        }, 12500);

        return () => {
            clearTimeout(timeoutId);
            clearTimeout(navTimeoutId);
            if (animationFrameId) cancelAnimationFrame(animationFrameId);
        };
    }, [navigate]);

    return (
        <div className="intro-body">
            <main className="display-area" ref={displayAreaRef}>
                <div className="texture-grid"></div>
                <div className="texture-scanlines"></div>
                <div className="texture-noise"></div>

                <div className="scene-1">
                    <div className="message-bubble-wrapper">
                        <div className="message-bubble">
                            <div className="content-row">
                                <span className="text-light">An</span>
                                <span className="text-bold">Keerthis</span>

                                <div className="icons-group">
                                    <svg className="icon-piano" viewBox="0 0 40 30">
                                        <rect x="0" y="0" width="40" height="30" rx="4"></rect>
                                        <rect x="9" y="0" width="4" height="18" fill="var(--dark-bubble)"></rect>
                                        <rect x="18" y="0" width="4" height="18" fill="var(--dark-bubble)"></rect>
                                        <rect x="27" y="0" width="4" height="18" fill="var(--dark-bubble)"></rect>
                                    </svg>

                                    <svg className="icon-heart" viewBox="0 0 60 50">
                                        <defs>
                                            <pattern id="dotPattern" x="0" y="0" width="3" height="3" patternUnits="userSpaceOnUse">
                                                <rect x="0" y="0" width="2" height="2" fill="var(--bg-green)"></rect>
                                            </pattern>
                                        </defs>

                                        <path d="M22,44 L20,42 C9,31 2,23 2,15 C2,8 7,3 14,3 C18,3 21,5 23,8 C25,5 28,3 32,3 C39,3 44,8 44,15 C44,23 37,31 26,42 L22,44 Z" fill="url(#dotPattern)"></path>
                                        <path d="M48,5 L50,11 L56,13 L50,15 L48,21 L46,15 L40,13 L46,11 Z" fill="var(--bg-green)"></path>
                                        <path d="M42,28 L43.5,33 L48.5,34.5 L43.5,36 L42,41 L40.5,36 L35.5,34.5 L40.5,33 Z" fill="var(--bg-green)"></path>
                                    </svg>
                                </div>
                            </div>

                            <div className="meta-row">
                                <span className="time-text">01:02 PM</span>
                                <svg className="icon-checks" viewBox="0 0 24 24">
                                    <polyline points="18 7 11 15 7 11"></polyline>
                                    <polyline points="22 7 15 13 13 13"></polyline>
                                </svg>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="scene-2">
                    <div className="name-line-1 typing-container">The Elengetable</div>
                    <div className="name-line-2 typing-container">Devi...</div>
                </div>

                <div className="scene-3">
                    <div className="pattuma-word scene-3-typing">
                        <span>P</span>
                        <svg className="custom-a" viewBox="0 0 10 10">
                            <path fill="currentColor" fillRule="evenodd" clipRule="evenodd" d="M0 10H3V6H7V10H10V3H9V2H8V1H7V0H3V1H2V2H1V3H0V10ZM2 3H4V4H6V3H8V4H7V5H6V6H4V5H3V4H2V3Z" />
                        </svg>
                        <span>T</span><span>T</span><span>U</span><span>M</span>
                        <svg className="custom-a" viewBox="0 0 10 10">
                            <path fill="currentColor" fillRule="evenodd" clipRule="evenodd" d="M0 10H3V6H7V10H10V3H9V2H8V1H7V0H3V1H2V2H1V3H0V10ZM2 3H4V4H6V3H8V4H7V5H6V6H4V5H3V4H2V3Z" />
                        </svg>
                    </div>
                </div>

                <canvas ref={canvasRef} style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", zIndex: 50, pointerEvents: "none" }}></canvas>
            </main>
        </div>
    );
};

export default Intro;
