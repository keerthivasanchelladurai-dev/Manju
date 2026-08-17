import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import './Port.css';

const messages = [
    { text: "365 days,", label: "one year." },
    { text: "8,760 hours , 525,600 minutes", label: "small moments, big meaning." },
    { text: "Again a year 🌙✨", label: "like the moon 🌙✨" },
    { text: "20 years of manju", label: "Today is" },
];

const Port = () => {
    const containerRef = useRef(null);
    const navigate = useNavigate();
    const [finalFlash, setFinalFlash] = useState(false);
    const [crossfade, setCrossfade] = useState(false);
    const [showUniverseText, setShowUniverseText] = useState(false);

    useEffect(() => {
        let animId;
        let isComponentMounted = true;
        setTimeout(() => setCrossfade(true), 100);

        // 1. Scene Setup
        const scene = new THREE.Scene();
        scene.background = new THREE.Color('#000000');
        scene.fog = new THREE.FogExp2('#000000', 0.002);

        // 2. Camera Setup
        const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 2000);
        camera.position.set(40, 35, 90);

        // 3. Renderer Setup
        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

        // Prevent React StrictMode double canvas
        if (containerRef.current) {
            containerRef.current.innerHTML = '';
            containerRef.current.appendChild(renderer.domElement);
        }

        // 4. Controls
        const controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.05;
        controls.minDistance = 10;
        controls.maxDistance = 800;

        // Generate a soft radial gradient texture programmatically
        function createParticleTexture() {
            const canvas = document.createElement('canvas');
            canvas.width = 64;
            canvas.height = 64;
            const ctx = canvas.getContext('2d');

            const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
            gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
            gradient.addColorStop(0.1, 'rgba(255, 255, 255, 0.8)');
            gradient.addColorStop(0.4, 'rgba(255, 255, 255, 0.2)');
            gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');

            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, 64, 64);

            return new THREE.CanvasTexture(canvas);
        }

        const particleTexture = createParticleTexture();

        // 5. Galaxy Configuration - Golden/Bronze Theme
        const params = {
            count: 150000,
            radius: 150,
            branches: 2,
            spinTightness: 0.12,
            randomness: 0.35,
            power: 1.5,

            coreColor: '#ffffff',
            innerColor: '#ffdf99',
            midColor: '#d97925',
            outerColor: '#63270d',
            dustColor: '#1a0b05'
        };

        // Initialize geometric data
        let geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(params.count * 3);
        const colors = new Float32Array(params.count * 3);
        const scales = new Float32Array(params.count);

        const aAngles = new Float32Array(params.count);
        const aRadii = new Float32Array(params.count);
        const aOffsets = new Float32Array(params.count * 3);

        const aInitRadii = new Float32Array(params.count);
        const aInitAngles = new Float32Array(params.count);
        const aInitYs = new Float32Array(params.count);

        const colorCore = new THREE.Color(params.coreColor);
        const colorInner = new THREE.Color(params.innerColor);
        const colorMid = new THREE.Color(params.midColor);
        const colorOuter = new THREE.Color(params.outerColor);
        const colorDust = new THREE.Color(params.dustColor);

        for (let i = 0; i < params.count; i++) {
            const i3 = i * 3;

            const r = Math.pow(Math.random(), params.power) * params.radius;
            aRadii[i] = r;

            const a = 1.0;
            let spiralAngle = Math.log((r + a) / a) / params.spinTightness;
            const branchAngle = ((i % params.branches) / params.branches) * Math.PI * 2;
            aAngles[i] = spiralAngle + branchAngle;

            const scatterFactor = Math.pow(Math.random(), 1.2) * params.randomness * r;
            const randX = (Math.random() - 0.5) * scatterFactor;
            const randZ = (Math.random() - 0.5) * scatterFactor;

            const bulge = Math.exp(-r / 10) * 8;
            const flatDisc = (Math.random() - 0.5) * scatterFactor * 0.15;
            const randY = (Math.random() - 0.5) * bulge + flatDisc;

            aOffsets[i3 + 0] = randX;
            aOffsets[i3 + 1] = randY;
            aOffsets[i3 + 2] = randZ;

            positions[i3 + 0] = Math.cos(aAngles[i]) * r + randX;
            positions[i3 + 1] = randY;
            positions[i3 + 2] = Math.sin(aAngles[i]) * r + randZ;

            aInitRadii[i] = 150 + Math.random() * 400;
            aInitAngles[i] = Math.random() * Math.PI * 2;
            aInitYs[i] = (Math.random() - 0.5) * 300;

            let mixedColor = new THREE.Color();
            const normalizedR = r / params.radius;

            if (normalizedR < 0.05) {
                mixedColor.lerpColors(colorCore, colorInner, normalizedR / 0.05);
            } else if (normalizedR < 0.2) {
                mixedColor.lerpColors(colorInner, colorMid, (normalizedR - 0.05) / 0.15);
            } else if (normalizedR < 0.5) {
                mixedColor.lerpColors(colorMid, colorOuter, (normalizedR - 0.2) / 0.3);
            } else {
                mixedColor.lerpColors(colorOuter, colorDust, (normalizedR - 0.5) / 0.5);
            }

            if (Math.random() > 0.95 && normalizedR < 0.8) {
                mixedColor.lerp(colorCore, 0.8);
                scales[i] = Math.random() * 3.5 + 1.5;
            } else {
                scales[i] = Math.random() * 0.8 + 0.2;
            }

            colors[i3 + 0] = mixedColor.r;
            colors[i3 + 1] = mixedColor.g;
            colors[i3 + 2] = mixedColor.b;
        }

        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        geometry.setAttribute('aScale', new THREE.BufferAttribute(scales, 1));
        geometry.setAttribute('aAngle', new THREE.BufferAttribute(aAngles, 1));
        geometry.setAttribute('aRadius', new THREE.BufferAttribute(aRadii, 1));
        geometry.setAttribute('aOffset', new THREE.BufferAttribute(aOffsets, 3));
        geometry.setAttribute('aInitRadius', new THREE.BufferAttribute(aInitRadii, 1));
        geometry.setAttribute('aInitAngle', new THREE.BufferAttribute(aInitAngles, 1));
        geometry.setAttribute('aInitY', new THREE.BufferAttribute(aInitYs, 1));

        const material = new THREE.ShaderMaterial({
            depthWrite: false,
            blending: THREE.AdditiveBlending,
            vertexColors: true,
            transparent: true,
            uniforms: {
                uTime: { value: 0 },
                uSize: { value: 35.0 },
                uTexture: { value: particleTexture },
                uFormation: { value: 0.0 },
                uOutburst: { value: 0.0 }
            },
            vertexShader: `
            uniform float uTime;
            uniform float uSize;
            uniform float uFormation;
            uniform float uOutburst;
            
            attribute float aScale;
            attribute float aRadius;
            attribute float aAngle;
            attribute vec3 aOffset;
            
            attribute float aInitRadius;
            attribute float aInitAngle;
            attribute float aInitY;
            
            varying vec3 vColor;
            
            void main() {
                vColor = color;
                
                float blendedRadius = mix(aInitRadius, aRadius, uFormation);
                float blendedY = mix(aInitY, aOffset.y, uFormation);
                
                float speed = 1.0 / (aRadius * 0.02 + 1.0);
                
                float initSpin = aInitAngle + (uTime * 0.01);
                float finalSpin = aAngle - (uTime * speed * 0.5);
                
                float twist = (1.0 - uFormation) * 4.0 * uFormation; 
                float blendedAngle = mix(initSpin, finalSpin, uFormation) + twist;
                
                float currentOffsetX = aOffset.x * uFormation;
                float currentOffsetZ = aOffset.z * uFormation;
                
                vec3 finalPos;
                finalPos.x = cos(blendedAngle) * blendedRadius + currentOffsetX;
                finalPos.z = sin(blendedAngle) * blendedRadius + currentOffsetZ;
                finalPos.y = blendedY; 
                
                if (uOutburst > 0.0) {
                    vec3 dir = normalize(finalPos);
                    float blastForce = uOutburst * uOutburst * (300.0 / (aRadius + 5.0));
                    finalPos += dir * blastForce * 20.0;
                }
                
                vec4 mvPosition = modelViewMatrix * vec4(finalPos, 1.0);
                
                float outburstScale = 1.0 + (uOutburst * 2.0);
                gl_PointSize = uSize * aScale * (10.0 / -mvPosition.z) * outburstScale;
                gl_Position = projectionMatrix * mvPosition;
            }
        `,
            fragmentShader: `
            uniform sampler2D uTexture;
            uniform float uOutburst;
            varying vec3 vColor;
            
            void main() {
                vec4 texColor = texture2D(uTexture, gl_PointCoord);
                if(texColor.a < 0.01) discard;
                
                vec3 finalColor = mix(vColor, vec3(1.0, 0.95, 0.8), min(uOutburst * 0.8, 1.0));
                float fadeOut = 1.0 - smoothstep(1.0, 2.0, uOutburst);
                
                gl_FragColor = vec4(finalColor, texColor.a * fadeOut);
            }
        `
        });

        const galaxy = new THREE.Points(geometry, material);
        scene.add(galaxy);

        // Add Central Flare / Jet 
        function createFlareTexture() {
            const canvas = document.createElement('canvas');
            canvas.width = 64;
            canvas.height = 64;
            const ctx = canvas.getContext('2d');

            const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
            gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
            gradient.addColorStop(0.1, 'rgba(255, 230, 180, 0.8)');
            gradient.addColorStop(0.3, 'rgba(200, 100, 30, 0.4)');
            gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, 64, 64);

            return new THREE.CanvasTexture(canvas);
        }

        const flareMaterial = new THREE.MeshBasicMaterial({
            map: createFlareTexture(),
            transparent: true,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
            color: 0xff7722,
            side: THREE.DoubleSide,
            opacity: 0.0
        });

        const flareGroup = new THREE.Group();
        for (let i = 0; i < 4; i++) {
            const plane = new THREE.Mesh(new THREE.PlaneGeometry(8, 150), flareMaterial);
            plane.rotation.y = (Math.PI / 4) * i;
            flareGroup.add(plane);
        }
        scene.add(flareGroup);

        // Sky Dust Particles
        const dustGeometry = new THREE.BufferGeometry();
        const dustCount = 50000;
        const dustPositions = new Float32Array(dustCount * 3);
        const dustColors = new Float32Array(dustCount * 3);

        for (let i = 0; i < dustCount; i++) {
            const r = 50 + Math.random() * 950;
            const theta = 2 * Math.PI * Math.random();
            const phi = Math.acos(2 * Math.random() - 1);

            dustPositions[i * 3 + 0] = r * Math.sin(phi) * Math.cos(theta);
            dustPositions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
            dustPositions[i * 3 + 2] = r * Math.cos(phi);

            const color = new THREE.Color();
            color.setHSL(Math.random() * 0.1 + 0.05, 0.4, Math.random() * 0.2 + 0.1);

            dustColors[i * 3 + 0] = color.r;
            dustColors[i * 3 + 1] = color.g;
            dustColors[i * 3 + 2] = color.b;
        }

        dustGeometry.setAttribute('position', new THREE.BufferAttribute(dustPositions, 3));
        dustGeometry.setAttribute('color', new THREE.BufferAttribute(dustColors, 3));

        const dustMaterial = new THREE.PointsMaterial({
            size: 1.5,
            vertexColors: true,
            transparent: true,
            opacity: 0.6,
            sizeAttenuation: true,
            map: particleTexture,
            depthWrite: false,
            blending: THREE.AdditiveBlending
        });

        const dustField = new THREE.Points(dustGeometry, dustMaterial);
        scene.add(dustField);

        const handleResize = () => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        };
        window.addEventListener('resize', handleResize);

        const clock = new THREE.Clock();
        let outburstProgress = 0.0;
        let currentAngleTime = 0.0;
        let currentSpeedMultiplier = 0.2;
        let previousTime = 0.0;
        let transitionTriggered = false;

        function animate() {
            if (!isComponentMounted) return;
            animId = requestAnimationFrame(animate);

            const elapsedTime = clock.getElapsedTime();
            const delta = elapsedTime - previousTime;
            previousTime = elapsedTime;

            // Formation Animation Logic
            const delay = 0.0;
            const formDuration = 15.0; // 15s to form
            const burstStartTime = delay + formDuration + 3.0; // Burst at 18s

            let progress = 0;
            if (elapsedTime > delay) {
                progress = Math.min(1.0, (elapsedTime - delay) / formDuration);
                progress = progress * progress * progress * (progress * (progress * 6 - 15) + 10);
            }

            // Outburst Sequence Automatically
            if (elapsedTime > burstStartTime) {
                currentSpeedMultiplier += delta * 1.5;
                outburstProgress += delta * 1.5;

                let flareOp = 0.9 + (outburstProgress * 2.0);
                if (outburstProgress > 1.0) {
                    flareOp -= (outburstProgress - 1.0) * 4.0;
                }
                flareMaterial.opacity = Math.max(0, flareOp);
                flareMaterial.color.setHex(0xffffff);

                dustField.scale.set(1.0 + outburstProgress * 3.0, 1.0 + outburstProgress * 3.0, 1.0 + outburstProgress * 3.0);
                dustField.rotation.y += delta * (0.02 * (1.0 + outburstProgress * 10.0));

                let dustOp = 0.6;
                if (outburstProgress > 1.0) {
                    dustOp -= (outburstProgress - 1.0) * 1.5;
                }
                dustMaterial.opacity = Math.max(0, dustOp);

                // Wait for outburst to finish fading out, then navigate
                if (outburstProgress > 2.0 && !transitionTriggered) {
                    transitionTriggered = true;
                    setFinalFlash(true);
                    setTimeout(() => navigate('/moon'), 2500);
                }
            } else {
                flareMaterial.opacity = progress * 0.9;
                dustField.rotation.y += delta * 0.02;
            }

            currentAngleTime += delta * currentSpeedMultiplier;

            material.uniforms.uFormation.value = progress;
            material.uniforms.uOutburst.value = outburstProgress;
            material.uniforms.uTime.value = currentAngleTime;

            controls.update();
            renderer.render(scene, camera);
        }
        animate();

        // Dialog sequence USING EXACT DOM METHODS to ensure perfectly identical behavior
        const playDialogs = async () => {
            const textEl = document.getElementById('dialog-text');
            const labelEl = document.getElementById('dialog-label');
            if (!textEl || !labelEl) return;

            for (let i = 0; i < messages.length; i++) {
                if (!isComponentMounted) return;

                textEl.innerText = messages[i].text;
                labelEl.innerText = messages[i].label;

                textEl.style.opacity = 1;
                labelEl.style.opacity = 1;

                await new Promise(r => setTimeout(r, 2500));
                if (!isComponentMounted) return;

                if (i < messages.length - 1) {
                    textEl.style.opacity = 0;
                    labelEl.style.opacity = 0;
                    await new Promise(r => setTimeout(r, 500));
                }
            }

            textEl.style.opacity = 0;
            labelEl.style.opacity = 0;

            await new Promise(r => setTimeout(r, 1000));
            if (isComponentMounted) {
                setShowUniverseText(true);
            }
        };
        playDialogs();

        return () => {
            isComponentMounted = false;
            cancelAnimationFrame(animId);
            window.removeEventListener('resize', handleResize);
            if (renderer.domElement && containerRef.current) {
                containerRef.current.removeChild(renderer.domElement);
            }

            geometry.dispose();
            material.dispose();
            flareMaterial.dispose();
            dustGeometry.dispose();
            dustMaterial.dispose();
            renderer.dispose();
        };
    }, [navigate]);

    return (
        <div className="port-body">
            <div className={`port-crossfade ${crossfade ? 'fade-out' : ''}`}></div>
            <div id="port-canvas-container" ref={containerRef}></div>
            <div className={`port-flash ${finalFlash ? 'final-flash' : ''}`}></div>

            {!finalFlash && (
                <>
                    {showUniverseText && <div className="universe-text">the universe also waiting to say this</div>}
                    <div id="dialog-container">
                        <div id="dialog-text"></div>
                        <div id="dialog-label"></div>
                    </div>
                </>
            )}
        </div>
    );
};

export default Port;
