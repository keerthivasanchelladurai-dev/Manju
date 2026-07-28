import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import './Moon.css';


const Moon = () => {
    const navigate = useNavigate();
    const containerRef = useRef(null);
    const [showCarousel, setShowCarousel] = useState(false);
    const [showPlayMessage, setShowPlayMessage] = useState(false);

    const handlePlay = (e) => {
        e.stopPropagation();
        navigate('/super');
    };

    const handleGiftClick = (e) => {
        e.stopPropagation();
        setShowPlayMessage(true);
    };

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        let animationFrameId;

        const CONFIG = {
            transformTime: 15.0,
            moonRadius: 10,
            particleCount: 15000,
            cameraZ: 75,
            defaultTexture: 'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/moon_1024.jpg'
        };

        const STATE = { ORBIT: 0, EXPLODING: 1, FORMING_HEART: 2 };
        let currentState = STATE.ORBIT;
        let stateTimer = 0;
        let drawProgress = 0;
        let hbTriggered = false, nameTriggered = false;

        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0x000000);
        scene.fog = new THREE.FogExp2(0x000000, 0.0001);

        const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 10000);

        const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance" });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        container.appendChild(renderer.domElement);

        const controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.enablePan = false;
        controls.enableZoom = false;
        controls.minAzimuthAngle = -Math.PI / 2;
        controls.maxAzimuthAngle = Math.PI / 2;
        controls.minPolarAngle = Math.PI / 2 - 0.5; controls.maxPolarAngle = Math.PI / 2 + 0.5;

        const clock = new THREE.Clock();

        scene.add(new THREE.AmbientLight(0x444444, 0.8));
        const sunLight = new THREE.DirectionalLight(0xffffff, 1.5);
        sunLight.position.set(100, 50, 100);
        scene.add(sunLight);

        let moonMesh;
        let particleSystem;
        let particleAttributes = { positions: null, velocities: null, targetHeart: null, colors: null, targetColors: null };

        const getCircleTexture = () => {
            const canvas = document.createElement('canvas');
            canvas.width = 32; canvas.height = 32;
            const ctx = canvas.getContext('2d');
            const grad = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
            grad.addColorStop(0, 'rgba(255, 255, 255, 1)');
            grad.addColorStop(0.2, 'rgba(255, 255, 255, 0.8)');
            grad.addColorStop(0.5, 'rgba(255, 255, 255, 0.2)');
            grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
            ctx.fillStyle = grad;
            ctx.fillRect(0, 0, 32, 32);
            return new THREE.CanvasTexture(canvas);
        };

        const createDeepStarfield = () => {
            const starTexture = getCircleTexture();
            const dustGeo = new THREE.BufferGeometry();
            const dustPos = [];
            for (let i = 0; i < 10000; i++) {
                const r = 500 + Math.random() * 1000;
                const theta = Math.random() * Math.PI * 2;
                const phi = Math.acos(2 * Math.random() - 1);
                dustPos.push(r * Math.sin(phi) * Math.cos(theta), r * Math.sin(phi) * Math.sin(theta), r * Math.cos(phi));
            }
            dustGeo.setAttribute('position', new THREE.Float32BufferAttribute(dustPos, 3));
            const dustMat = new THREE.PointsMaterial({ color: 0x556677, size: 0.8, map: starTexture, transparent: true, opacity: 0.5, depthWrite: false, blending: THREE.AdditiveBlending });
            scene.add(new THREE.Points(dustGeo, dustMat));

            const midGeo = new THREE.BufferGeometry();
            const midPos = [];
            const midCols = [];
            for (let i = 0; i < 4000; i++) {
                const r = 200 + Math.random() * 600;
                const theta = Math.random() * Math.PI * 2;
                const phi = Math.acos(2 * Math.random() - 1);
                midPos.push(r * Math.sin(phi) * Math.cos(theta), r * Math.sin(phi) * Math.sin(theta), r * Math.cos(phi));
                const c = new THREE.Color();
                const rand = Math.random();
                if (rand > 0.9) c.setHex(0xaaddff);
                else if (rand > 0.95) c.setHex(0xffddaa);
                else c.setHex(0xffffff);
                midCols.push(c.r, c.g, c.b);
            }
            midGeo.setAttribute('position', new THREE.Float32BufferAttribute(midPos, 3));
            midGeo.setAttribute('color', new THREE.Float32BufferAttribute(midCols, 3));
            const midMat = new THREE.PointsMaterial({ size: 1.5, vertexColors: true, map: starTexture, transparent: true, opacity: 0.9, depthWrite: false, blending: THREE.AdditiveBlending });
            scene.add(new THREE.Points(midGeo, midMat));
        };

        const createMoon = (url) => {
            const loader = new THREE.TextureLoader();
            loader.crossOrigin = '';
            loader.load(url, (tex) => {
                const geo = new THREE.SphereGeometry(CONFIG.moonRadius, 64, 64);
                const mat = new THREE.MeshStandardMaterial({ map: tex, roughness: 0.8, metalness: 0.1, emissive: 0x222222, emissiveMap: tex, emissiveIntensity: 0.2 });
                moonMesh = new THREE.Mesh(geo, mat);
                moonMesh.rotation.y = -Math.PI / 2;
                scene.add(moonMesh);
            });
        };

        const createParticleSystem = () => {
            const count = CONFIG.particleCount;
            const geo = new THREE.BufferGeometry();
            const posArray = new Float32Array(count * 3);
            const velArray = [];
            const cols = new Float32Array(count * 3);
            const targetHeartArr = new Float32Array(count * 3);
            const targetColorArr = new Float32Array(count * 3);

            const initialPalette = [new THREE.Color(0xffffff), new THREE.Color(0xaaddff), new THREE.Color(0x8899ff)];
            const heartPalette = [new THREE.Color(0xd900ff), new THREE.Color(0xaa00ff), new THREE.Color(0xff00ff), new THREE.Color(0xe022ff), new THREE.Color(0xb700ff)];

            for (let i = 0; i < count; i++) {
                const r = CONFIG.moonRadius;
                const theta = Math.random() * Math.PI * 2;
                const phi = Math.acos(2 * Math.random() - 1);
                const x = r * Math.sin(phi) * Math.cos(theta);
                const y = r * Math.sin(phi) * Math.sin(theta);
                const z = r * Math.cos(phi);
                posArray[i * 3] = x; posArray[i * 3 + 1] = y; posArray[i * 3 + 2] = z;

                const speed = 0.1 + Math.random() * 0.5;
                const v = new THREE.Vector3(x, y, z).normalize().multiplyScalar(speed);
                velArray.push(v.x, v.y, v.z);

                const ic = initialPalette[Math.floor(Math.random() * initialPalette.length)];
                cols[i * 3] = ic.r; cols[i * 3 + 1] = ic.g; cols[i * 3 + 2] = ic.b;

                const hc = heartPalette[Math.floor(Math.random() * heartPalette.length)];
                targetColorArr[i * 3] = hc.r; targetColorArr[i * 3 + 1] = hc.g; targetColorArr[i * 3 + 2] = hc.b;

                const t = (i / count) * Math.PI * 2;
                const offsetX = (Math.random() - 0.5) * 0.5;
                const offsetY = (Math.random() - 0.5) * 0.5;
                const offsetZ = (Math.random() - 0.5) * 0.5;
                const scale = 1.2;
                const hx = 16 * Math.pow(Math.sin(t), 3);
                const hy = (13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t));
                targetHeartArr[i * 3] = hx * scale + offsetX;
                targetHeartArr[i * 3 + 1] = hy * scale + offsetY;
                targetHeartArr[i * 3 + 2] = offsetZ;
            }

            geo.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
            geo.setAttribute('color', new THREE.BufferAttribute(cols, 3));
            const mat = new THREE.PointsMaterial({ size: 0.6, vertexColors: true, transparent: true, opacity: 0.9, map: getCircleTexture(), blending: THREE.AdditiveBlending, depthWrite: false });
            particleSystem = new THREE.Points(geo, mat);
            scene.add(particleSystem);

            particleAttributes.positions = posArray;
            particleAttributes.velocities = velArray;
            particleAttributes.colors = cols;
            particleAttributes.targetColors = targetColorArr;
            particleAttributes.targetHeart = targetHeartArr;
        };

        createDeepStarfield();
        createMoon(CONFIG.defaultTexture);

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

            if (currentState === STATE.ORBIT) {
                if (time > 3.5 && !hbTriggered) {
                    const el = document.getElementById('hb-text');
                    if (el) el.classList.add('visible');
                    hbTriggered = true;
                }
                if (time > 5.5 && !nameTriggered) {
                    const el = document.getElementById('name-text');
                    if (el) el.classList.add('visible');
                    nameTriggered = true;
                }
                if (time >= CONFIG.transformTime) {
                    currentState = STATE.EXPLODING;
                    stateTimer = clock.getElapsedTime();
                    if (moonMesh) moonMesh.visible = false;
                    const el1 = document.getElementById('hb-text');
                    const el2 = document.getElementById('name-text');
                    if(el1) el1.classList.add('hidden');
                    if(el2) el2.classList.add('hidden');
                    createParticleSystem();
                }
                if (moonMesh) moonMesh.rotation.y += 0.002;
            } else if (currentState === STATE.EXPLODING) {
                if (particleSystem) {
                    const positions = particleSystem.geometry.attributes.position.array;
                    const colors = particleSystem.geometry.attributes.color.array;
                    const targetColors = particleAttributes.targetColors;
                    const vels = particleAttributes.velocities;
                    const elapsed = clock.getElapsedTime() - stateTimer;
                    const lerpSpeed = elapsed > 1.0 ? 0.04 : 0;

                    for (let i = 0; i < CONFIG.particleCount; i++) {
                        const i3 = i * 3;
                        if (lerpSpeed > 0) {
                            colors[i3] += (targetColors[i3] - colors[i3]) * lerpSpeed;
                            colors[i3 + 1] += (targetColors[i3 + 1] - colors[i3 + 1]) * lerpSpeed;
                            colors[i3 + 2] += (targetColors[i3 + 2] - colors[i3 + 2]) * lerpSpeed;
                        }
                        positions[i3] += vels[i3]; positions[i3 + 1] += vels[i3 + 1]; positions[i3 + 2] += vels[i3 + 2];
                        vels[i3] *= 0.98; vels[i3 + 1] *= 0.98; vels[i3 + 2] *= 0.98;
                    }
                    particleSystem.geometry.attributes.position.needsUpdate = true;
                    particleSystem.geometry.attributes.color.needsUpdate = true;
                }
                if (clock.getElapsedTime() - stateTimer > 2.5) {
                    currentState = STATE.FORMING_HEART;
                }
            } else if (currentState === STATE.FORMING_HEART) {
                if (drawProgress < Math.PI * 2) {
                    drawProgress += 0.005;
                } else if (particleSystem) {
                    particleSystem.position.x += (35 - particleSystem.position.x) * 0.02;
                    controls.enabled = false;
                    if (particleSystem.position.x > 15) {
                        setShowCarousel(true);
                    }
                }
                if (particleSystem) {
                    const positions = particleSystem.geometry.attributes.position.array;
                    const colors = particleSystem.geometry.attributes.color.array;
                    const targets = particleAttributes.targetHeart;
                    const targetColors = particleAttributes.targetColors;
                    const vels = particleAttributes.velocities;

                    for (let i = 0; i < CONFIG.particleCount; i++) {
                        const i3 = i * 3;
                        const t = (i / CONFIG.particleCount) * Math.PI * 2;
                        if (t <= drawProgress) {
                            positions[i3] += (targets[i3] - positions[i3]) * 0.08;
                            positions[i3 + 1] += (targets[i3 + 1] - positions[i3 + 1]) * 0.08;
                            positions[i3 + 2] += (targets[i3 + 2] - positions[i3 + 2]) * 0.08;
                            colors[i3] += (targetColors[i3] - colors[i3]) * 0.1;
                            colors[i3 + 1] += (targetColors[i3 + 1] - colors[i3 + 1]) * 0.1;
                            colors[i3 + 2] += (targetColors[i3 + 2] - colors[i3 + 2]) * 0.1;
                        } else if (t < drawProgress + 0.5) {
                            const scale = 1.2;
                            const hx = 16 * Math.pow(Math.sin(drawProgress), 3);
                            const hy = (13 * Math.cos(drawProgress) - 5 * Math.cos(2 * drawProgress) - 2 * Math.cos(3 * drawProgress) - Math.cos(4 * drawProgress));
                            const tipX = hx * scale;
                            const tipY = hy * scale;
                            const tipZ = 0;
                            positions[i3] += (tipX - positions[i3]) * 0.06;
                            positions[i3 + 1] += (tipY - positions[i3 + 1]) * 0.06;
                            positions[i3 + 2] += (tipZ - positions[i3 + 2]) * 0.06;
                            colors[i3] += (targetColors[i3] - colors[i3]) * 0.05;
                            colors[i3 + 1] += (targetColors[i3 + 1] - colors[i3 + 1]) * 0.05;
                            colors[i3 + 2] += (targetColors[i3 + 2] - colors[i3 + 2]) * 0.05;
                        } else {
                            positions[i3] += vels[i3]; positions[i3 + 1] += vels[i3 + 1]; positions[i3 + 2] += vels[i3 + 2];
                            vels[i3] *= 0.99; vels[i3 + 1] *= 0.99; vels[i3 + 2] *= 0.99;
                        }
                    }
                    particleSystem.geometry.attributes.position.needsUpdate = true;
                    particleSystem.geometry.attributes.color.needsUpdate = true;
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


    return (
        <div className="moon-body">
            <div id="splash-screen" style={{ display: 'none' }}>
                <div className="loader-text">Loading the Universe...</div>
            </div>

            <div id="ui-layer">
                <div id="hb-text" className="handwritten-text">Happy Birthday</div>
                <div id="name-text" className="handwritten-text">Ambrin</div>
            </div>

            <div id="carousel-container" className={showCarousel ? 'show' : ''}>
                {!showPlayMessage ? (
                    <div className="gift-boxes-wrapper">
                        {[0, 1, 2].map((i) => (
                            <div key={i} className="moon-gift-box" onClick={handleGiftClick}>
                                <svg viewBox="0 0 100 100">
                                    <rect x="15" y="35" width="70" height="55" fill="#FF0000" rx="5" stroke="#CC0000" strokeWidth="2"/>
                                    <rect x="10" y="25" width="80" height="14" fill="#CC0000" rx="3" stroke="#990000" strokeWidth="2"/>
                                    <rect x="42" y="25" width="16" height="65" fill="#FFD700"/>
                                    <rect x="10" y="48" width="80" height="16" fill="#FFD700"/>
                                    <path d="M 50,25 C 32,5 20,12 45,25 C 70,12 58,5 50,25 Z" fill="#FFD700" stroke="#B8860B" strokeWidth="1"/>
                                    <circle cx="50" cy="25" r="5" fill="#B8860B"/>
                                </svg>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="play-message-wrapper">
                        <h2 className="play-message-text">go and play the game super</h2>
                        <button className="play-super-btn" onClick={handlePlay}>Play</button>
                    </div>
                )}
            </div>

            <div ref={containerRef} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 1, pointerEvents: 'none' }}></div>
        </div>
    );
};

export default Moon;
