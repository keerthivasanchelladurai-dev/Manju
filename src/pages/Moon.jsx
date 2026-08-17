import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import './Moon.css';

const Moon = () => {
    const navigate = useNavigate();
    const containerRef = useRef(null);
    const [showCarousel, setShowCarousel] = useState(false);
    
    const [uiState, setUiState] = useState('LOCK'); // 'LOCK', 'DIALPAD', 'SUCCESS'
    const [passkey, setPasskey] = useState('');
    const [passError, setPassError] = useState(false);
    
    const isPasswordCorrectRef = useRef(false);

    const handlePlay = (e) => {
        e.stopPropagation();
        navigate('/cake');
    };

    const handleDial = (digit) => {
        if (passkey.length < 4 && !passError) {
            const newKey = passkey + digit;
            setPasskey(newKey);
            if (newKey.length === 4) {
                if (newKey === '2408') {
                    setUiState('SUCCESS');
                    isPasswordCorrectRef.current = true;
                } else {
                    setPassError(true);
                    setTimeout(() => {
                        setPasskey('');
                        setPassError(false);
                    }, 500);
                }
            }
        }
    };

    const handleClear = () => {
        if (!passError && passkey.length > 0) {
            setPasskey(passkey.slice(0, -1));
        }
    };

    // --- THREE.js 3D Dust Particles Effect ---
    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        let animationFrameId;

        const CONFIG = {
            particleCount: 22000,
            cameraZ: 75,
        };

        const STATE = { 
            IDLE: 0,
            COUNT3: 1,
            COUNT2: 2,
            COUNT1: 3,
            TEXT1: 4,
            TEXT2: 5,
            TEXT3: 6,
            CAROUSEL: 7
        };
        
        let currentState = STATE.IDLE;
        let stateTimer = 0;
        
        const getTextTargets = (text, count, fontSize = 60, splitLines = false) => {
            const canvas = document.createElement('canvas');
            canvas.width = 1200;
            canvas.height = 600;
            const ctx = canvas.getContext('2d');
            ctx.fillStyle = '#000';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.font = `800 ${fontSize * 1.5}px 'Playfair Display', serif`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillStyle = '#fff';
            
            if (splitLines) {
                const lines = text.split('\n');
                const lineHeight = fontSize * 1.8;
                lines.forEach((line, i) => {
                     ctx.fillText(line, canvas.width/2, canvas.height/2 + (i - (lines.length-1)/2)*lineHeight);
                });
            } else {
                ctx.fillText(text, canvas.width/2, canvas.height/2);
            }

            const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
            const points = [];
            for (let y = 0; y < canvas.height; y += 2) {
                for (let x = 0; x < canvas.width; x += 2) {
                    const idx = (y * canvas.width + x) * 4;
                    if (imgData[idx] > 128) {
                        points.push({ x: x - canvas.width/2, y: -(y - canvas.height/2) });
                    }
                }
            }

            const targets = new Float32Array(count * 3);
            for (let i = 0; i < count; i++) {
                if (points.length > 0) {
                    const pt = points[Math.floor(Math.random() * points.length)];
                    targets[i * 3] = pt.x * 0.12 + (Math.random() - 0.5) * 0.8;
                    targets[i * 3 + 1] = pt.y * 0.12 + (Math.random() - 0.5) * 0.8;
                    targets[i * 3 + 2] = (Math.random() - 0.5) * 1.0;
                }
            }
            return targets;
        };

        const scene = new THREE.Scene();

        const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 10000);

        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        container.appendChild(renderer.domElement);

        const controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.enablePan = false;
        controls.enableZoom = false;

        const clock = new THREE.Clock();

        let particleSystem;
        let particleAttributes = { 
            positions: null, velocities: null, colors: null, targetColors: null,
            target3: null, target2: null, target1: null,
            targetText1: null, targetText2: null, targetText3: null
        };

        const getCircleTexture = () => {
            const canvas = document.createElement('canvas');
            canvas.width = 32; canvas.height = 32;
            const ctx = canvas.getContext('2d');
            const grad = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
            grad.addColorStop(0, 'rgba(255, 255, 255, 1)');
            grad.addColorStop(0.2, 'rgba(255, 255, 255, 0.8)');
            grad.addColorStop(0.5, 'rgba(255, 255, 255, 0.2)');
            grad.addColorStop(1, 'rgba(255, 255, 255, 0)');
            ctx.fillStyle = grad;
            ctx.fillRect(0, 0, 32, 32);
            return new THREE.CanvasTexture(canvas);
        };

        const createParticleSystem = () => {
            const count = CONFIG.particleCount;
            const geo = new THREE.BufferGeometry();
            const posArray = new Float32Array(count * 3);
            const velArray = [];
            const cols = new Float32Array(count * 3);
            const targetColorArr = new Float32Array(count * 3);

            // Pure Wedding Card Palette: Metallic Gold, Rose Gold, Soft Champagne
            const weddingPalette = [
                new THREE.Color(0xD4AF37), // Metallic Gold
                new THREE.Color(0xFFD700), // Pure Gold
                new THREE.Color(0xB76E79), // Rose Gold
                new THREE.Color(0xC0A392), // Vintage Champagne
                new THREE.Color(0xFFDF00)  // Bright Gold
            ];

            for (let i = 0; i < count; i++) {
                posArray[i * 3] = 0;
                posArray[i * 3 + 1] = 0;
                posArray[i * 3 + 2] = 0;

                const speed = 2.0 + Math.random() * 6.0;
                const theta = Math.random() * Math.PI * 2;
                const phi = Math.acos(2 * Math.random() - 1);
                const x = Math.sin(phi) * Math.cos(theta);
                const y = Math.sin(phi) * Math.sin(theta);
                const z = Math.cos(phi);
                
                const v = new THREE.Vector3(x, y, z).normalize().multiplyScalar(speed);
                velArray.push(v.x, v.y, v.z);

                const color = weddingPalette[Math.floor(Math.random() * weddingPalette.length)];
                cols[i * 3] = color.r; cols[i * 3 + 1] = color.g; cols[i * 3 + 2] = color.b;
                targetColorArr[i * 3] = color.r; targetColorArr[i * 3 + 1] = color.g; targetColorArr[i * 3 + 2] = color.b;
            }

            particleAttributes.target3 = getTextTargets('3', count, 150);
            particleAttributes.target2 = getTextTargets('2', count, 150);
            particleAttributes.target1 = getTextTargets('1', count, 150);
            particleAttributes.targetText1 = getTextTargets('manju', count, 90);
            particleAttributes.targetText2 = getTextTargets('its from me', count, 70);
            particleAttributes.targetText3 = getTextTargets('wish you very\nhappy birthday', count, 60, true);

            geo.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
            geo.setAttribute('color', new THREE.BufferAttribute(cols, 3));
            
            const mat = new THREE.PointsMaterial({ size: 0.45, vertexColors: true, transparent: true, opacity: 0.0, map: getCircleTexture(), depthWrite: false });
            particleSystem = new THREE.Points(geo, mat);
            scene.add(particleSystem);

            particleAttributes.positions = posArray;
            particleAttributes.velocities = velArray;
            particleAttributes.colors = cols;
            particleAttributes.targetColors = targetColorArr;
        };

        createParticleSystem();

        const onResize = () => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
            const aspect = window.innerWidth / window.innerHeight;
            if (aspect < 1.0) {
                const newZ = CONFIG.cameraZ / aspect * 0.8;
                camera.position.z = Math.min(newZ, 200);
            } else {
                camera.position.z = CONFIG.cameraZ;
            }
        };
        window.addEventListener('resize', onResize);
        onResize();

        const animate = () => {
            animationFrameId = requestAnimationFrame(animate);
            const time = clock.getElapsedTime();
            controls.update();

            if (isPasswordCorrectRef.current) {
                if (currentState === STATE.IDLE) {
                    currentState = STATE.COUNT3;
                    stateTimer = time;
                }

                if (particleSystem) {
                    const elapsed = time - stateTimer;
                    let activeTargets = null;
                    let explosionPhase = false;
                    
                    if (elapsed < 1.5) {
                        explosionPhase = true;
                    } else if (elapsed < 3.0) {
                        currentState = STATE.COUNT3;
                        activeTargets = particleAttributes.target3;
                    } else if (elapsed < 4.5) {
                        currentState = STATE.COUNT2;
                        activeTargets = particleAttributes.target2;
                    } else if (elapsed < 6.0) {
                        currentState = STATE.COUNT1;
                        activeTargets = particleAttributes.target1;
                    } else if (elapsed < 8.5) {
                        currentState = STATE.TEXT1;
                        activeTargets = particleAttributes.targetText1;
                    } else if (elapsed < 11.0) {
                        currentState = STATE.TEXT2;
                        activeTargets = particleAttributes.targetText2;
                    } else if (elapsed < 14.5) {
                        currentState = STATE.TEXT3;
                        activeTargets = particleAttributes.targetText3;
                    } else {
                        currentState = STATE.CAROUSEL;
                        if (!showCarousel) setShowCarousel(true);
                        activeTargets = particleAttributes.targetText3;
                    }

                    if (particleSystem.material.opacity < 0.9) {
                        particleSystem.material.opacity += 0.02;
                    }

                    const positions = particleSystem.geometry.attributes.position.array;
                    controls.enabled = false;
                    particleSystem.position.lerp(new THREE.Vector3(0, 0, 0), 0.05);

                    for (let i = 0; i < CONFIG.particleCount; i++) {
                        const i3 = i * 3;
                        if (explosionPhase) {
                            positions[i3] += particleAttributes.velocities[i3];
                            positions[i3 + 1] += particleAttributes.velocities[i3 + 1];
                            positions[i3 + 2] += particleAttributes.velocities[i3 + 2];
                            
                            particleAttributes.velocities[i3] *= 0.92;
                            particleAttributes.velocities[i3 + 1] *= 0.92;
                            particleAttributes.velocities[i3 + 2] *= 0.92;
                        } else if (activeTargets) {
                            const speed = 0.08 + (i % 100) / 2000;
                            positions[i3] += (activeTargets[i3] - positions[i3]) * speed;
                            positions[i3 + 1] += (activeTargets[i3 + 1] - positions[i3 + 1]) * speed;
                            positions[i3 + 2] += (activeTargets[i3 + 2] - positions[i3 + 2]) * speed;
                        } else {
                            positions[i3] += (Math.random() - 0.5) * 0.1;
                            positions[i3 + 1] += (Math.random() - 0.5) * 0.1;
                            positions[i3 + 2] += (Math.random() - 0.5) * 0.1;
                        }
                    }
                    particleSystem.geometry.attributes.position.needsUpdate = true;
                }
            }
            
            renderer.render(scene, camera);
        };
        animate();

        return () => {
            window.removeEventListener('resize', onResize);
            if (animationFrameId) cancelAnimationFrame(animationFrameId);
            renderer.dispose();
            if (container.contains(renderer.domElement)) {
                container.removeChild(renderer.domElement);
            }
        };
    }, []);

    // Ivory Background: #FDFBF7
    return (
        <div className="moon-body" style={{ backgroundColor: '#FDFBF7' }}>
            <div id="splash-screen" style={{ display: 'none' }}>
                <div className="loader-text">Loading the Universe...</div>
            </div>

            <div id="ui-layer">
                <div id="hb-text" className="handwritten-text">Happy Birthday</div>
                <div id="name-text" className="handwritten-text">Devi</div>
            </div>

            <div className={`ui-overlay ${uiState !== 'SUCCESS' ? 'active' : 'hidden'}`}>
                
                <div className={`lock-screen premium-lock ${uiState !== 'LOCK' ? 'fade-out' : ''}`} onClick={() => setUiState('DIALPAD')}>
                    <p style={{fontFamily: "'Playfair Display', serif", fontSize: '18px', color: '#800000', marginBottom: '20px', textAlign: 'center'}}>
                        One secret left.<br />Once you see it, everything will make sense.
                    </p>
                    <img src="/images/heart_lock.jpg" alt="Lock" className="heart-lock" />
                    <p className="tap-text">tap to open</p>
                </div>

                <div className={`dialpad-screen premium-dialpad ${uiState === 'DIALPAD' ? 'visible' : ''}`}>
                    <div className="dialpad-header">
                        <img src="/images/heart_lock.jpg" alt="Lock small" className="small-lock" />
                        <h2 className="passkey-title">Enter Passkey</h2>
                        <div className="passkey-dots">
                            {[0, 1, 2, 3].map(i => (
                                <div 
                                    key={i} 
                                    className={`dot premium-dot ${i < passkey.length ? 'filled' : ''} ${passError ? 'error' : ''}`}
                                />
                            ))}
                        </div>
                    </div>

                    <div className="dialpad-grid">
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
                            <button key={num} className="dial-btn premium-btn" onClick={() => handleDial(num.toString())}>
                                {num}
                            </button>
                        ))}
                        <button className="dial-btn empty"></button>
                        <button className="dial-btn premium-btn" onClick={() => handleDial('0')}>0</button>
                        <button className="dial-btn premium-btn" style={{ fontSize: '1.2rem', borderColor: 'transparent' }} onClick={handleClear}>Clear</button>
                    </div>
                </div>

            </div>

            <div id="carousel-container" className={showCarousel ? 'show' : ''} style={{ zIndex: 10 }}>
                <div className="play-message-wrapper">
                    <h2 className="play-message-text" style={{ color: '#800000' }}>A special message for you...</h2>
                    <button className="play-super-btn premium-super-btn" onClick={handlePlay}>Open</button>
                </div>
            </div>

            <div ref={containerRef} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 1, pointerEvents: 'none' }}></div>
        </div>
    );
};

export default Moon;

