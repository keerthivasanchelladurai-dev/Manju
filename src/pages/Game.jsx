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
    const readyBtnRef = useRef(null);
    const containerRef = useRef(null);
    
    // Canvas layers
    const layerPlateRef = useRef(null);
    const layerBottomRef = useRef(null);
    const layerMiddleRef = useRef(null);
    const layerTopRef = useRef(null);
    const layerCandleRef = useRef(null);

    const [cakeSceneActive, setCakeSceneActive] = useState(false);
    const [leftPanelVisible, setLeftPanelVisible] = useState(false);
    const [btnVisible, setBtnVisible] = useState(false);
    const [btnText, setBtnText] = useState("Ready to blow the cake? \uD83C\uDF82");
    const [btnStyle, setBtnStyle] = useState({});

    // UseRefs for mutable state used in event listeners
    const dragState = useRef({
        isDragging: false,
        startY: 0,
        startX: 0,
        hasShot: false,
        aimAngle: 0,
        power: 0,
        audioContext: null,
        isCandleLit: true
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
                    setCakeSceneActive(true);
                    initCakeScene();
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

    const initCakeScene = () => {
        let tick = 0;
        let animationFrameId;

        const contexts = [
            null,
            layerPlateRef.current?.getContext('2d'),
            layerBottomRef.current?.getContext('2d'),
            layerMiddleRef.current?.getContext('2d'),
            layerTopRef.current?.getContext('2d'),
            layerCandleRef.current?.getContext('2d')
        ];

        if (!contexts[1]) return;

        const palette = {
            ' ': null, 'X': '#23151a', 'P': '#ff7eb6', 'H': '#ffb5d4',
            'D': '#d64984', 'C': '#ffe2b8', 'S': '#d9b384', 'R': '#ff3355',
            'W': '#ffffff', 'F': '#ff8c00', 'Y': '#ffea00', 'r': '#e62244',
            'd': '#991122', 'g': '#2d8a4e', 'w': '#ffffff', '1': '#00e5ff',
            '2': '#aaff00', '3': '#ffea00', '4': '#ffffff', 'p': '#e0f7fa',
            'l': '#b2ebf2'
        };

        const leftBase = [
            "                                                  ", "                                                 X", "                                                XF",
            "                                               XFY", "                                               XFY", "                                                XF",
            "                                                 X", "                                               XWW", "                                               XRR",
            "                                               XWW", "                                               XRR", "                                               XWW",
            "                                               XRR", "                                               XWW", "                                               XRR",
            "                                               XWW", "                                               XRR", "                                    XXXXXXXXXXXXXX",
            "                                  XXHHHHHHHHHHHHHH", "                                 XHHPPPPPPPPPPPPPP", "                                XHPPPPPPPPPPPPPPPP",
            "                                XPPPPPPPPPPPPPPPPP", "                                XPPPPPPPPPPPPPPPPP", "                                XPPDPPPPPDPPPPPDPP",
            "                                XDPPXDPPPXDPPPPXDP", "                                XXPPXCXPPXCXPPPXCX", "                                  XXCCCXXCCCXXXCCC",
            "                                XCCCCCCCCCCCCCCCCC", "                                XSSSSSSSSSSSSSSSSS", "                                XXSSSSSSSSSSSSSSSS",
            "                        XXXXXXXXXXXXSSSSSSSSSSSSSS", "                      XXHHHHHHHHHHHHHHHHHHHHHHHHHH", "                     XHHPPPPPPPPPPPPPPPPPPPPPPPPPP",
            "                    XHPPPPPPPPPPPPPPPPPPPPPPPPPPPP", "                    XPPPPPPPPPPPPPPPPPPPPPPPPPPPPP", "                    XPPPPPPPPPPPPPPPPPPPPPPPPPPPPP",
            "                    XPPPPPPPPPPPPPPPPPPPPPPPPPPPPP", "                    XPPDPPPPPPPDPPPPPPPDPPPPPPPDPP", "                    XDPPPXDPPPPXDPPPPPPXDPPPPPPXDP",
            "                    XXPPPXCXPPPXCXPPPPPXCXPPPPPXCX", "                      XXXCCCXXXCCCXXXXXCCCXXXXXCCC", "                    XCCCCCCCCCCCCCCCCCCCCCCCCCCCCC",
            "                    XCCCCCCCCCCCCCCCCCCCCCCCCCCCCC", "                    XSSSSSSSSSSSSSSSSSSSSSSSSSSSSS", "                    XXSSSSSSSSSSSSSSSSSSSSSSSSSSSS",
            "          XXXXXXXXXXXXXXSSSSSSSSSSSSSSSSSSSSSSSSSS", "        XXHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHH", "       XHHPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPP",
            "      XHPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPP", "      XPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPP", "      XPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPP",
            "      XPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPP", "      XPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPP", "      XPPDPPPPPPPPPPDPPPPPPPPPDPPPPPPPPPDPPPPPPPDP",
            "      XDPPPPXDPPPPPPXDPPPPPPPPXDPPPPPPPPXDPPPPPPXD", "      XXPPPPXCXPPPPPXCXPPPPPPPXCXPPPPPPPXCXPPPPPXC", "        XXXXCCCXXXXXCCCXXXXXXXCCCXXXXXXXCCCXXXXXCC",
            "      XCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCC", "      XCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCC", "      XSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSS",
            "      XXSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSS", "        XXSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSS", "          XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
            "        XXpppppppppppppppppppppppppppppppppppppppp", "      XXpppppppppppppppppppppppppppppppppppppppppp", "     Xlppppppppppppppppppppppppppppppppppppppppppp",
            "     Xllpppppppppppppppppppppppppppppppppppppppppp", "      XXllllllllllllllllllllllllllllllllllllllllll", "        XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
        ];

        let fullGrid = [];
        let layerGrid = [];
        const gridWidth = 100;
        const gridHeight = leftBase.length;

        for (let y = 0; y < leftBase.length; y++) {
            let row = leftBase[y];
            let rightSide = row.split('').reverse().join('');
            let fullRowStr = row + rightSide;
            fullGrid.push(fullRowStr);

            let layerId;
            if (y >= 63) layerId = 1;
            else if (y >= 45) layerId = 2;
            else if (y >= 30) layerId = 3;
            else if (y >= 17) layerId = 4;
            else layerId = 5;

            let layerRow = [];
            for (let x = 0; x < fullRowStr.length; x++) { layerRow.push(layerId); }
            layerGrid.push(layerRow);
        }

        const sprinkleColors = ['1', '2', '3', '4'];
        for (let y = 0; y < fullGrid.length; y++) {
            let rowArray = fullGrid[y].split('');
            for (let x = 0; x < rowArray.length - 1; x++) {
                if (rowArray[x] === 'P' && rowArray[x + 1] === 'P' && Math.random() < 0.035) {
                    let c = sprinkleColors[Math.floor(Math.random() * sprinkleColors.length)];
                    rowArray[x] = c; rowArray[x + 1] = c; x++;
                }
            }
            fullGrid[y] = rowArray.join('');
        }

        const drawSprite = (sprite, startX, startY, layerId) => {
            for (let r = 0; r < sprite.length; r++) {
                let y = startY + r;
                if (y >= fullGrid.length) continue;
                let row = fullGrid[y].split('');
                for (let c = 0; c < sprite[r].length; c++) {
                    let char = sprite[r][c];
                    if (char !== ' ') {
                        row[startX + c] = char;
                        layerGrid[y][startX + c] = layerId;
                    }
                }
                fullGrid[y] = row.join('');
            }
        };

        const candleOverlay = [
            "XWWRRX", "XWRRWX", "XRRWWX", "XRWWRX", "XWWRRX",
            "XWRRWX", "XRRWWX", "XRWWRX", "XWWRRX", "XWRRWX"
        ];
        drawSprite(candleOverlay, 47, 7, 5);

        const bowLeft = [
            "    XXXX", "   XRddX", "  XRRRRX", "  XRRRRX", "   XRRRX",
            "    XRRX", "   XXRRX", "  XRRRXX", "  XRRXX ", "  XXRX  ", "   XX   "
        ];
        drawSprite(bowLeft.map(row => row + row.split('').reverse().join('')), 42, 35, 3);

        const cherryLeft = ["  g  ", " g   ", "XrrX ", "XrwrX", "XrrrX", "XddrX", " XXX "];
        const cherryRight = cherryLeft.map(row => row.split('').reverse().join(''));

        drawSprite(cherryLeft, 36, 11, 4); drawSprite(cherryRight, 100 - 36 - 5, 11, 4);
        drawSprite(cherryLeft, 25, 23, 3); drawSprite(cherryRight, 100 - 25 - 5, 23, 3);
        drawSprite(cherryLeft, 11, 38, 2); drawSprite(cherryRight, 100 - 11 - 5, 38, 2);

        const flameLeft1 = [
            "                                                 X", "                                                XF",
            "                                               XFY", "                                               XFY",
            "                                                XF", "                                                 X"
        ];
        const flameLeft2 = [
            "                                                  ", "                                                 X",
            "                                                XF", "                                                XF",
            "                                                 X", "                                                  "
        ];
        const flameOff = Array(6).fill("                                                  ");

        setTimeout(() => {
            const canvases = [layerPlateRef.current, layerBottomRef.current, layerMiddleRef.current, layerTopRef.current, layerCandleRef.current];
            canvases.forEach(c => { if(c) c.classList.add('throw-in'); });
        }, 300);

        setTimeout(() => { setLeftPanelVisible(true); }, 4500);
        setTimeout(() => { setBtnVisible(true); }, 5500);

        const resizeAndDraw = () => {
            const maxPixelWidth = Math.floor((window.innerWidth * 0.35) / gridWidth);
            const maxPixelHeight = Math.floor((window.innerHeight * 0.55) / gridHeight);
            const pixelSize = Math.max(1, Math.min(6, Math.min(maxPixelWidth, maxPixelHeight)));

            const targetWidth = gridWidth * pixelSize;
            const targetHeight = gridHeight * pixelSize;
            
            const cakeContainer = document.getElementById('cakeContainer');
            if(cakeContainer && contexts[1].canvas.width !== targetWidth) {
                cakeContainer.style.width = targetWidth + 'px';
                cakeContainer.style.height = targetHeight + 'px';
                for (let i = 1; i <= 5; i++) {
                    contexts[i].canvas.width = targetWidth;
                    contexts[i].canvas.height = targetHeight;
                }
            }

            for (let i = 1; i <= 5; i++) {
                contexts[i].clearRect(0, 0, targetWidth, targetHeight);
            }

            const isFlicker = Math.floor(tick / 20) % 2 === 1;
            let activeFlameLeft = dragState.current.isCandleLit ? (isFlicker ? flameLeft2 : flameLeft1) : flameOff;

            for (let y = 0; y < gridHeight; y++) {
                let rowStr = fullGrid[y];
                let isFlameRow = false;

                if (y >= 1 && y <= 6) {
                    let rL = activeFlameLeft[y - 1];
                    rowStr = rL + rL.split('').reverse().join('');
                    isFlameRow = true;
                }

                for (let x = 0; x < gridWidth; x++) {
                    const char = rowStr[x];
                    if (char !== ' ' && palette[char]) {
                        let layerId = isFlameRow ? 5 : layerGrid[y][x];
                        let ctx = contexts[layerId];
                        ctx.fillStyle = palette[char];
                        ctx.fillRect(x * pixelSize, y * pixelSize, pixelSize, pixelSize);
                    }
                }
            }
        };

        const animateCake = () => {
            tick++;
            resizeAndDraw();
            animationFrameId = requestAnimationFrame(animateCake);
        };
        
        window.addEventListener('resize', resizeAndDraw);
        animateCake();

        return () => {
            window.removeEventListener('resize', resizeAndDraw);
            if (animationFrameId) cancelAnimationFrame(animationFrameId);
        };
    };

    const handleBlowCandle = async () => {
        if (dragState.current.audioContext) return;
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            dragState.current.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const analyser = dragState.current.audioContext.createAnalyser();
            const microphone = dragState.current.audioContext.createMediaStreamSource(stream);

            analyser.smoothingTimeConstant = 0.5;
            analyser.fftSize = 256;
            microphone.connect(analyser);

            const dataArray = new Uint8Array(analyser.frequencyBinCount);

            setBtnText("Listening... BLOW now! \uD83C\uDF2C\uFE0F");
            setBtnStyle({ transform: 'scale(1.05)' });

            const checkBlow = () => {
                if (!dragState.current.isCandleLit) return;
                analyser.getByteFrequencyData(dataArray);
                let sum = 0;
                for (let i = 0; i < dataArray.length; i++) { sum += dataArray[i]; }
                let average = sum / dataArray.length;

                if (average > 35) {
                    dragState.current.isCandleLit = false;
                    setBtnText("Yay! \uD83D\uDC4F");
                    setBtnStyle({ background: '#2d8a4e' });
                    
                    setTimeout(() => {
                        const blackout = document.createElement('div');
                        blackout.style.cssText = 'position:fixed;top:0;left:0;width:100vw;height:100vh;background:black;z-index:9999;opacity:0;transition:opacity 1.5s;';
                        document.body.appendChild(blackout);
                        setTimeout(() => blackout.style.opacity = '1', 50);
                        setTimeout(() => {
                            if (blackout) blackout.remove();
                            navigate('/santa');
                        }, 1600);
                    }, 1200);
                } else {
                    requestAnimationFrame(checkBlow);
                }
            };
            checkBlow();
        } catch (err) {
            console.error("Mic access denied:", err);
            setBtnText("Mic access denied \uD83D\uDE1E");
            setBtnStyle({ background: '#991122' });
        }
    };

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
                    <div className="happy-bday">
                        Happy<br />Birthday
                        <svg className="swoosh" viewBox="0 0 200 20" preserveAspectRatio="none">
                            <path d="M5,15 Q50,5 190,8 Q120,18 40,15" />
                        </svg>
                    </div>
                    <div className="worth-text">to someone worth celebrating</div>
                </div>
            </div>

            <div id="cake-scene" className={cakeSceneActive ? 'active' : ''}>
                <div id="leftPanel" className={leftPanelVisible ? 'visible' : ''}>
                    <div className="quote">
                        <span className="sparkle s1">✨</span>
                        <span className="sparkle s2">✨</span>
                        <span className="sparkle s3">✨</span>
                        Happy Birthday!
                    </div>
                    <div className="sub-quote">
                        Wishing you a day filled with joy<br />and a year filled with sweet surprises.
                    </div>
                    <button className={`ready-btn ${btnVisible ? 'visible' : ''}`} ref={readyBtnRef} style={btnStyle} onClick={handleBlowCandle}>
                        {btnText}
                    </button>
                </div>

                <div id="cakeContainer">
                    <canvas id="layer-plate" ref={layerPlateRef}></canvas>
                    <canvas id="layer-bottom" ref={layerBottomRef}></canvas>
                    <canvas id="layer-middle" ref={layerMiddleRef}></canvas>
                    <canvas id="layer-top" ref={layerTopRef}></canvas>
                    <canvas id="layer-candle" ref={layerCandleRef}></canvas>
                </div>
            </div>
        </div>
    );
};

export default Game;
