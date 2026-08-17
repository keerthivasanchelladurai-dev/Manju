import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Game.css';

const Game = () => {
    const navigate = useNavigate();
    const bowContainerRef = useRef(null);
    const heartRef = useRef(null);
    const heartContainerRef = useRef(null);
    const pinkBurstRef = useRef(null);
    const uiTopRef = useRef(null);
    const uiBottomRef = useRef(null);
    const uiGlowRef = useRef(null);
    const trajectoryPathRef = useRef(null);
    const containerRef = useRef(null);

    // UseRefs for mutable state used in event listeners
    const dragState = useRef({
        isDragging: false,
        startY: 0,
        startX: 0,
        hasShot: false,
        aimAngle: 0,
        power: 0
    });

    useEffect(() => {
        const bowContainer = bowContainerRef.current;
        const heart = heartRef.current;
        const pinkBurst = pinkBurstRef.current;
        const uiTop = uiTopRef.current;
        const uiBottom = uiBottomRef.current;
        const uiGlow = uiGlowRef.current;
        const trajectoryPath = trajectoryPathRef.current;
        const container = containerRef.current;
        const bowImg = document.getElementById('bow');

        const maxPull = 120;
        const powerMultiplier = 0.35;
        const gravity = 0.6;
        let animationFrameId;

        const startDrag = (e) => {
            if (dragState.current.hasShot) return;
            dragState.current.isDragging = true;
            const clientY = e.touches ? e.touches[0].clientY : e.clientY;
            const clientX = e.touches ? e.touches[0].clientX : e.clientX;
            dragState.current.startY = clientY;
            dragState.current.startX = clientX;
            if (bowContainer) bowContainer.style.transition = 'none';
            if (bowImg) bowImg.style.transition = 'none';
        };

        const drag = (e) => {
            if (!dragState.current.isDragging) return;
            if (e.cancelable) e.preventDefault();

            const clientY = e.touches ? e.touches[0].clientY : e.clientY;
            const clientX = e.touches ? e.touches[0].clientX : e.clientX;

            let pullY = clientY - dragState.current.startY;
            let pullX = clientX - dragState.current.startX;

            const distance = Math.sqrt(pullX * pullX + pullY * pullY);
            const clampedDist = Math.min(distance, maxPull);
            const ratio = distance > 0 ? clampedDist / distance : 0;

            const visualPullX = pullX * ratio * 0.4;
            const visualPullY = pullY * ratio * 0.4;

            if (bowContainer) bowContainer.style.transform = `translate(${visualPullX}px, ${visualPullY}px) scale(0.95)`;

            let aimX = -pullX;
            let aimY = -pullY;

            if (distance > 10) {
                dragState.current.aimAngle = Math.atan2(aimY, aimX);
                const aimAngleDeg = dragState.current.aimAngle * 180 / Math.PI;

                if (bowImg) bowImg.style.transform = `rotate(${aimAngleDeg + 45}deg)`;
                dragState.current.power = clampedDist;

                const bowRect = bowContainer.getBoundingClientRect();
                let simX = bowRect.left + bowRect.width / 2;
                let simY = bowRect.top + bowRect.height / 2;
                let simVX = Math.cos(dragState.current.aimAngle) * (dragState.current.power * powerMultiplier);
                let simVY = Math.sin(dragState.current.aimAngle) * (dragState.current.power * powerMultiplier);

                let pathD = `M ${simX} ${simY}`;
                for (let i = 0; i < 35; i++) {
                    simX += simVX;
                    simVY += gravity;
                    simY += simVY;
                    pathD += ` L ${simX} ${simY}`;
                }
                if (trajectoryPath) trajectoryPath.setAttribute('d', pathD);
            } else {
                if (trajectoryPath) trajectoryPath.setAttribute('d', '');
                dragState.current.power = 0;
            }
        };

        const endDrag = () => {
            if (!dragState.current.isDragging) return;
            dragState.current.isDragging = false;
            if (trajectoryPath) trajectoryPath.setAttribute('d', '');

            if (bowContainer) {
                bowContainer.style.transition = 'transform 0.2s cubic-bezier(0.4, 0, 0.2, 1)';
                bowContainer.style.transform = 'translate(0, 0) scale(1)';
            }

            if (dragState.current.power > 30) {
                shootArrow(dragState.current.aimAngle, dragState.current.power);
            } else {
                if (bowImg) {
                    bowImg.style.transition = 'transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)';
                    bowImg.style.transform = 'rotate(-35deg)';
                }
            }
            dragState.current.power = 0;
        };

        if (bowContainer) {
            bowContainer.addEventListener('mousedown', startDrag);
            bowContainer.addEventListener('touchstart', startDrag);
        }
        window.addEventListener('mousemove', drag, { passive: false });
        window.addEventListener('mouseup', endDrag);
        window.addEventListener('touchmove', drag, { passive: false });
        window.addEventListener('touchend', endDrag);

        const shootArrow = (angle, shootPower) => {
            dragState.current.hasShot = true;
            if (uiTop) uiTop.style.opacity = '0';
            if (uiBottom) uiBottom.style.opacity = '0';

            const arrow = document.createElement('div');
            arrow.className = 'arrow';
            document.body.appendChild(arrow);

            const bowRect = bowContainer.getBoundingClientRect();
            let arrowX = bowRect.left + bowRect.width / 2;
            let arrowY = bowRect.top + bowRect.height / 2;

            let vx = Math.cos(angle) * (shootPower * powerMultiplier);
            let vy = Math.sin(angle) * (shootPower * powerMultiplier);

            const heartRect = heart.getBoundingClientRect();
            const targetX = heartRect.left + heartRect.width / 2;
            const targetY = heartRect.top + heartRect.height / 2;

            const gameLoop = () => {
                arrowX += vx;
                vy += gravity;
                arrowY += vy;

                const currentAngle = Math.atan2(vy, vx) * 180 / Math.PI;

                arrow.style.left = arrowX + 'px';
                arrow.style.top = arrowY + 'px';
                arrow.style.transform = `rotate(${currentAngle}deg)`;

                const distToHeart = Math.sqrt(Math.pow(arrowX - targetX, 2) + Math.pow(arrowY - targetY, 2));

                if (distToHeart < 75) {
                    arrow.remove();
                    triggerCinematicSequence();
                    return;
                }

                if (arrowY > window.innerHeight + 100 || arrowX > window.innerWidth + 100 || arrowX < -100) {
                    arrow.remove();
                    dragState.current.hasShot = false;
                    if (uiTop) uiTop.style.opacity = '1';
                    if (uiBottom) uiBottom.style.opacity = '1';
                    if (bowImg) {
                        bowImg.style.transition = 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)';
                        bowImg.style.transform = 'rotate(-35deg)';
                    }
                    return;
                }
                animationFrameId = requestAnimationFrame(gameLoop);
            };
            animationFrameId = requestAnimationFrame(gameLoop);
        };

        const triggerCinematicSequence = () => {
            if (heart) heart.classList.add('falling');
            if (uiGlow) uiGlow.style.opacity = '0';
            if (bowContainer) bowContainer.style.opacity = '0';

            setTimeout(() => {
                if (heart) heart.style.opacity = '0';
                if (heart && pinkBurst) {
                    const currentHeartPos = heart.getBoundingClientRect();
                    pinkBurst.style.left = (currentHeartPos.left + currentHeartPos.width / 2) + 'px';
                    pinkBurst.style.top = (currentHeartPos.top + currentHeartPos.height / 2) + 'px';
                    void pinkBurst.offsetWidth;
                    pinkBurst.classList.add('expand');
                }
            }, 1400);

            setTimeout(() => {
                const barTop = document.getElementById('bar-top');
                const barBottom = document.getElementById('bar-bottom');
                if (barTop) barTop.classList.add('show');
                if (barBottom) barBottom.classList.add('show');
            }, 2800);

            setTimeout(() => {
                const finalScreen = document.getElementById('final-screen');
                if (finalScreen) finalScreen.classList.add('show');
            }, 4000);

            setTimeout(() => {
                if (container) {
                    container.style.transition = 'opacity 2s';
                    container.style.opacity = '0';
                }
                setTimeout(() => {
                    navigate('/santa');
                }, 2000);
            }, 8000);
        };

        return () => {
            if (bowContainer) {
                bowContainer.removeEventListener('mousedown', startDrag);
                bowContainer.removeEventListener('touchstart', startDrag);
            }
            window.removeEventListener('mousemove', drag);
            window.removeEventListener('mouseup', endDrag);
            window.removeEventListener('touchmove', drag);
            window.removeEventListener('touchend', endDrag);
            if (animationFrameId) cancelAnimationFrame(animationFrameId);
            
            // Clean up any remaining arrows
            document.querySelectorAll('.arrow').forEach(a => a.remove());
        };
    }, []);

    return (
        <div className="game-body">
            <div id="container" ref={containerRef}>
                <div className="top-text" ref={uiTopRef}>a little something, for you</div>
                <div id="heart-container" ref={heartContainerRef}>
                    <div className="glow" ref={uiGlowRef}></div>
                    <img id="heart" ref={heartRef} src="https://cdn.jsdelivr.net/gh/microsoft/fluentui-emoji@latest/assets/Red%20heart/3D/red_heart_3d.png" onError={(e) => e.target.src='https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Red%20heart/3D/red_heart_3d.png'} alt="Heart" />
                </div>
                <div id="bow-container" ref={bowContainerRef}>
                    <img id="bow" src="https://cdn.jsdelivr.net/gh/microsoft/fluentui-emoji@latest/assets/Bow%20and%20arrow/3D/bow_and_arrow_3d.png" onError={(e) => e.target.src='https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Bow%20and%20arrow/3D/bow_and_arrow_3d.png'} alt="Bow" />
                </div>
                <div className="bottom-text" ref={uiBottomRef}>pull & release</div>
                
                <svg id="trajectory" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 20 }}>
                    <path id="trajectory-path" ref={trajectoryPathRef} fill="none" stroke="#ff4d6d" strokeWidth="3" strokeDasharray="6,6" opacity="0.6" d="" />
                </svg>

                <div id="pink-burst" ref={pinkBurstRef}></div>
                <div id="bar-top" className="cinematic-bar"></div>
                <div id="bar-bottom" className="cinematic-bar"></div>

                <div id="final-screen">
                    <div className="wish-text">make a wish...</div>
                    <div className="happy-bday" style={{fontSize: '32px', lineHeight: '1.2'}}>
                        Today feels ordinary…<br />but something has already begun

                        <svg className="swoosh" viewBox="0 0 200 20" preserveAspectRatio="none">
                            <path d="M5,15 Q50,5 190,8 Q120,18 40,15" />
                        </svg>
                    </div>
                    <div className="worth-text">to someone worth celebrating</div>
                </div>
            </div>
        </div>
    );
};

export default Game;
