import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Super.css';

const Super = () => {
    const navigate = useNavigate();
    const canvasRef = useRef(null);
    const cardContainerRef = useRef(null);
    const [score, setScore] = useState(0);
    const [coins, setCoins] = useState(0);
    const [cardsCollected, setCardsCollected] = useState(0);
    const [showMobileStart, setShowMobileStart] = useState(true);
    const [showWinMessage, setShowWinMessage] = useState(false);

    // Use refs for game state that changes rapidly to avoid re-renders
    const keys = useRef({ left: false, right: false, jump: false });
    const gameState = useRef('PLAYING');

    const handleMobileStart = () => {
        setShowMobileStart(false);
    };

    const handleReadMessage = () => {
        navigate('/last');
    };

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        const cardContainer = cardContainerRef.current;

        let width, height, floorY;
        let cameraX = 0;
        let localCardsCollected = 0;
        const targetCards = 7;

        let objects = [];
        let nextGenX = 0;
        let endSequenceGenerated = false;

        const cardDeck = [
            { header: "YOU GAVE ME...", text: "The freshness my heart never knew it needed.", color: "#5b21b6", image: "/images/pic2.webp" },
            { header: "CAN YOU BE MY ONLY FANTASY...", text: "Is spending every moment with you.", color: "#5b21b6", image: "/images/pic3.webp" },
            { header: "OUR RELATIONSHIP WOULD BE...", text: "Just like a KitKat—full of sweet moments and happy breaks.", color: "#5b21b6", image: "/images/pic4.webp" },
            { header: "YOU ARE MY...", text: "rare, precious, and the best part of my life.", color: "#5b21b6", image: "/images/pic5.jpg" },
            { header: "AND I...", text: "Can't stop thinking about you. My heart keeps revolving around you.", color: "#5b21b6", image: "/images/pic7.webp" },
            { header: "SO MY SWEET CHOCO PIE...", text: "Will you be mine? ❤️", color: "#5b21b6", image: "/images/pic8.webp" },
            { header: "HAPPY BIRTHDAY", text: "Happy birthday to my fave person", color: "#5b21b6", image: "/images/me.jpg" }
        ];

        const player = {
            x: 50, y: 0, width: 0, height: 0,
            vx: 0, vy: 0, speed: 0, jumpPower: 0, gravity: 0,
            grounded: false, direction: 1
        };

        const marioSprite = [
            [0, 0, 0, 1, 1, 1, 1, 1, 0, 0, 0, 0], [0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0], [0, 0, 2, 2, 2, 3, 3, 2, 3, 0, 0, 0], [0, 2, 3, 2, 3, 3, 3, 2, 3, 3, 3, 0],
            [0, 2, 3, 2, 2, 3, 3, 3, 2, 3, 3, 3], [0, 2, 2, 3, 3, 3, 3, 2, 2, 2, 2, 0], [0, 0, 0, 3, 3, 3, 3, 3, 3, 3, 0, 0], [0, 0, 1, 1, 4, 1, 1, 4, 1, 1, 0, 0],
            [0, 1, 1, 1, 4, 1, 1, 4, 1, 1, 1, 0], [1, 1, 1, 1, 4, 4, 4, 4, 1, 1, 1, 1], [3, 3, 1, 4, 3, 4, 4, 3, 4, 1, 3, 3], [3, 3, 3, 4, 4, 4, 4, 4, 4, 3, 3, 3],
            [3, 3, 4, 4, 4, 4, 4, 4, 4, 4, 3, 3], [0, 0, 4, 4, 4, 0, 0, 4, 4, 4, 0, 0], [0, 2, 2, 2, 0, 0, 0, 0, 2, 2, 2, 0], [2, 2, 2, 2, 0, 0, 0, 0, 2, 2, 2, 2]
        ];

        const blockSprite = [
            [5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5], [5, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 5], [5, 7, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 8, 5],
            [5, 7, 6, 5, 6, 6, 6, 6, 6, 6, 6, 6, 5, 6, 8, 5], [5, 7, 6, 6, 6, 6, 6, 5, 5, 6, 6, 6, 6, 6, 8, 5], [5, 7, 6, 6, 6, 6, 5, 6, 6, 5, 6, 6, 6, 6, 8, 5],
            [5, 7, 6, 6, 6, 6, 6, 6, 6, 5, 6, 6, 6, 6, 8, 5], [5, 7, 6, 6, 6, 6, 6, 6, 5, 6, 6, 6, 6, 6, 8, 5], [5, 7, 6, 6, 6, 6, 6, 5, 6, 6, 6, 6, 6, 6, 8, 5],
            [5, 7, 6, 6, 6, 6, 6, 5, 6, 6, 6, 6, 6, 6, 8, 5], [5, 7, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 8, 5], [5, 7, 6, 6, 6, 6, 6, 5, 6, 6, 6, 6, 6, 6, 8, 5],
            [5, 7, 6, 5, 6, 6, 6, 6, 6, 6, 6, 6, 5, 6, 8, 5], [5, 7, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 8, 5], [5, 7, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 5],
            [5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5]
        ];

        let oldFloorY = 0;
        function resize() {
            width = canvas.width = window.innerWidth;
            height = canvas.height = window.innerHeight;
            const newFloorY = height * 0.85;
            const unit = height * 0.08;

            player.width = unit * 0.8;
            player.height = unit;
            player.gravity = height * 0.002;
            player.jumpPower = -Math.sqrt(2 * player.gravity * (height * 0.35));
            player.speed = width * 0.005;

            if (player.y === 0) {
                player.y = newFloorY - player.height;
            } else if (oldFloorY > 0) {
                const diffY = newFloorY - oldFloorY;
                player.y += diffY;
                objects.forEach(obj => {
                    obj.y += diffY;
                    if (obj.type === 'flagpole') obj.flagY += diffY;
                });
            }
            floorY = newFloorY;
            oldFloorY = newFloorY;
        }
        window.addEventListener('resize', resize);
        resize();

        const handleKeyDown = (e) => {
            if (gameState.current !== 'PLAYING') return;
            if (e.code === 'ArrowLeft') keys.current.left = true;
            if (e.code === 'ArrowRight') keys.current.right = true;
            if (e.code === 'ArrowUp' || e.code === 'Space') keys.current.jump = true;
        };
        const handleKeyUp = (e) => {
            if (e.code === 'ArrowLeft') keys.current.left = false;
            if (e.code === 'ArrowRight') keys.current.right = false;
            if (e.code === 'ArrowUp' || e.code === 'Space') keys.current.jump = false;
        };
        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);

        const touchMove = (e) => {
            if (e.target.tagName !== 'BUTTON' && !e.target.classList.contains('btn')) {
                e.preventDefault();
            }
        };
        document.addEventListener('touchmove', touchMove, { passive: false });

        function generateLevelChunk() {
            if (endSequenceGenerated) return;
            const unit = height * 0.08;
            const blockW = unit;

            while (nextGenX < cameraX + width * 2) {
                if (localCardsCollected >= targetCards && !endSequenceGenerated) {
                    endSequenceGenerated = true;
                    objects.push({ type: 'flagpole', x: nextGenX + width * 0.5, y: floorY - (unit * 6), width: unit * 0.5, height: unit * 6, flagY: floorY - (unit * 6) + 10 });
                    objects.push({ type: 'castle', x: nextGenX + width * 1.2, y: floorY - (unit * 4), width: unit * 4, height: unit * 4 });
                    break;
                }
                const r = Math.random();
                const gap = width * (0.3 + Math.random() * 0.4);
                const yPos = floorY - (height * 0.25) - blockW;

                if (r > 0.6) {
                    objects.push({ type: 'brick', x: nextGenX + gap, y: yPos, width: blockW, height: blockW, bounceOffset: 0 });
                    objects.push({ type: 'block', x: nextGenX + gap + blockW, y: yPos, width: blockW, height: blockW, isHit: false, bounceOffset: 0 });
                    objects.push({ type: 'brick', x: nextGenX + gap + blockW * 2, y: yPos, width: blockW, height: blockW, bounceOffset: 0 });
                    nextGenX += gap + blockW * 2;
                } else if (r > 0.3) {
                    objects.push({ type: 'block', x: nextGenX + gap, y: yPos, width: blockW, height: blockW, isHit: false, bounceOffset: 0 });
                    nextGenX += gap;
                } else {
                    const pipeHeight = unit * (1 + Math.random());
                    objects.push({ type: 'pipe', x: nextGenX + gap, y: floorY - pipeHeight, width: unit * 1.2, height: pipeHeight });
                    nextGenX += gap;
                }
            }
            objects = objects.filter(obj => obj.x + obj.width > cameraX - width);
        }

        function showCard(x, y) {
            if (localCardsCollected >= cardDeck.length) {
                const cardEl = document.createElement('div');
                cardEl.className = 'pop-card';
                cardEl.innerHTML = `
                    <div class="pop-card-header">BONUS!</div>
                    <div class="pop-card-inner">
                        <div class="image-placeholder"><img src="/images/heart.webp" style="max-width: 100%; max-height: 100%; object-fit: contain;"></div>
                    </div>
                    <div class="pop-card-footer" style="color: #f59e0b">🪙 Extra Coins!</div>
                `;
                cardEl.style.left = `${(x - cameraX) + (player.width / 2)}px`;
                cardEl.style.top = `${y}px`;
                cardContainer.appendChild(cardEl);
                setTimeout(() => { if (cardContainer.contains(cardEl)) cardContainer.removeChild(cardEl); }, 4000);
                return;
            }

            const cardData = cardDeck[localCardsCollected];
            localCardsCollected++;
            setCardsCollected(localCardsCollected);

            const cardEl = document.createElement('div');
            cardEl.className = 'pop-card';
            cardEl.innerHTML = `
                <div class="pop-card-header">${cardData.header}</div>
                <div class="pop-card-inner">
                    <div class="image-placeholder"><img src="${cardData.image}" style="max-width: 100%; max-height: 100%; object-fit: contain;"></div>
                </div>
                <div class="pop-card-footer" style="color: ${cardData.color}">${cardData.text}</div>
            `;
            cardEl.style.left = `${(x - cameraX) + (player.width / 2)}px`;
            cardEl.style.top = `${y}px`;
            cardContainer.appendChild(cardEl);
            setTimeout(() => { if (cardContainer.contains(cardEl)) cardContainer.removeChild(cardEl); }, 4000);
        }

        function isIntersecting(a, b) {
            return (a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y);
        }

        let animationFrameId;
        let lastTimeTick = performance.now();
        let currentTime = 400;

        function update() {
            generateLevelChunk();

            if (gameState.current === 'PLAYING' || gameState.current === 'WALKING' || gameState.current === 'SLIDING') {
                const now = performance.now();
                if (now - lastTimeTick > 150) { // Fast time tick
                    lastTimeTick = now;
                    if (currentTime > 0) {
                        currentTime--;
                        const timeDisplay = document.getElementById('timeDisplay');
                        if (timeDisplay) timeDisplay.innerText = currentTime.toString().padStart(3, '0');
                    }
                }
            }

            if (gameState.current === 'PLAYING') {
                if (keys.current.left) { player.vx = -player.speed; player.direction = -1; }
                else if (keys.current.right) { player.vx = player.speed; player.direction = 1; }
                else { player.vx *= 0.4; }

                if (keys.current.jump && player.grounded) {
                    player.vy = player.jumpPower;
                    player.grounded = false;
                }
            } else if (gameState.current === 'SLIDING') {
                player.vx = 0;
                player.vy = player.speed * 0.5;
            } else if (gameState.current === 'WALKING') {
                player.vx = player.speed * 0.5;
                player.direction = 1;
                const castle = objects.find(o => o.type === 'castle');
                if (castle && player.x > castle.x + castle.width / 2) {
                    gameState.current = 'DONE';
                    player.vx = 0;
                    setShowWinMessage(true);
                    setTimeout(() => { navigate('/last'); }, 4000);
                }
            }

            player.vy += player.gravity;
            player.x += player.vx;

            if (player.x < cameraX && gameState.current === 'PLAYING') {
                player.x = cameraX;
                player.vx = 0;
            }

            for (let obj of objects) {
                if (['block', 'brick', 'pipe'].includes(obj.type)) {
                    if (isIntersecting(player, obj)) {
                        if (player.vx > 0) player.x = obj.x - player.width;
                        else if (player.vx < 0) player.x = obj.x + obj.width;
                        player.vx = 0;
                    }
                } else if (obj.type === 'flagpole' && gameState.current === 'PLAYING') {
                    if (isIntersecting(player, { x: obj.x, y: obj.y, width: 10, height: obj.height })) {
                        gameState.current = 'SLIDING';
                        player.x = obj.x - player.width + 5;
                        player.vx = 0;
                        player.vy = 0;
                        setScore(prev => prev + 5000);
                    }
                }
            }

            player.y += player.vy;
            player.grounded = false;

            if (player.y + player.height >= floorY) {
                player.y = floorY - player.height;
                player.vy = 0;
                player.grounded = true;
                if (gameState.current === 'SLIDING') gameState.current = 'WALKING';
            }

            for (let obj of objects) {
                if (['block', 'brick', 'pipe'].includes(obj.type)) {
                    if (isIntersecting(player, obj)) {
                        if (player.vy > 0) {
                            player.y = obj.y - player.height;
                            player.vy = 0;
                            player.grounded = true;
                        } else if (player.vy < 0 && (obj.type === 'block' || obj.type === 'brick')) {
                            player.y = obj.y + obj.height;
                            player.vy = 0;
                            if (obj.type === 'block' && !obj.isHit) {
                                obj.isHit = true;
                                obj.bounceOffset = - (obj.height * 0.3);
                                setScore(prev => prev + 100);
                                setCoins(prev => prev + 1);
                                showCard(obj.x, obj.y);
                            } else if (obj.type === 'brick' && obj.bounceOffset === 0) {
                                obj.bounceOffset = - (obj.height * 0.3);
                                setScore(prev => prev + 10);
                            }
                        } else if (player.vy < 0 && obj.type === 'pipe') {
                            player.y = obj.y + obj.height;
                            player.vy = 0;
                        }
                    }
                }

                if ((obj.type === 'block' || obj.type === 'brick') && obj.bounceOffset < 0) {
                    obj.bounceOffset += 2;
                    if (obj.bounceOffset > 0) obj.bounceOffset = 0;
                }

                if (obj.type === 'flagpole' && gameState.current === 'SLIDING') {
                    if (obj.flagY < floorY - 40) obj.flagY += player.speed * 0.5;
                }
            }

            if (gameState.current === 'PLAYING') {
                const targetCameraX = player.x - width * 0.3;
                if (targetCameraX > cameraX) cameraX = targetCameraX;
            }
        }

        function drawPixelArt(ctx, art, x, y, displayWidth, displayHeight, facingRight) {
            ctx.save();
            ctx.translate(x, y);
            if (!facingRight) {
                ctx.scale(-1, 1);
                ctx.translate(-displayWidth, 0);
            }
            const pixelW = displayWidth / art[0].length;
            const pixelH = displayHeight / art.length;
            for (let row = 0; row < art.length; row++) {
                for (let col = 0; col < art[row].length; col++) {
                    const colorCode = art[row][col];
                    if (colorCode !== 0) {
                        switch (colorCode) {
                            case 1: ctx.fillStyle = '#E52521'; break;
                            case 2: ctx.fillStyle = '#6B4226'; break;
                            case 3: ctx.fillStyle = '#FFCFA2'; break;
                            case 4: ctx.fillStyle = '#0055AF'; break;
                            case 5: ctx.fillStyle = '#000000'; break;
                            case 6: ctx.fillStyle = '#F9812A'; break;
                            case 7: ctx.fillStyle = '#FCE38A'; break;
                            case 8: ctx.fillStyle = '#D95319'; break;
                        }
                        ctx.fillRect(Math.floor(col * pixelW), Math.floor(row * pixelH), Math.ceil(pixelW) + 0.5, Math.ceil(pixelH) + 0.5);
                    }
                }
            }
            ctx.restore();
        }

        function draw() {
            ctx.fillStyle = '#5c94fc';
            ctx.fillRect(0, 0, width, height);

            ctx.fillStyle = '#c84c0c';
            ctx.fillRect(0, floorY, width, height - floorY);
            ctx.fillStyle = '#f8d8b0';
            ctx.fillRect(0, floorY, width, 6);
            ctx.fillStyle = '#000000';
            ctx.fillRect(0, floorY + 6, width, 2);

            ctx.save();
            ctx.translate(-cameraX, 0);

            for (let obj of objects) {
                if (obj.type === 'block') {
                    if (obj.isHit) {
                        ctx.fillStyle = '#8B4513';
                        ctx.fillRect(obj.x, obj.y + obj.bounceOffset, obj.width, obj.height);
                        ctx.fillStyle = '#000';
                        ctx.strokeRect(obj.x, obj.y + obj.bounceOffset, obj.width, obj.height);
                        ctx.fillStyle = '#000';
                        ctx.fillRect(obj.x + 4, obj.y + obj.bounceOffset + 4, 4, 4);
                        ctx.fillRect(obj.x + obj.width - 8, obj.y + obj.bounceOffset + 4, 4, 4);
                        ctx.fillRect(obj.x + 4, obj.y + obj.bounceOffset + obj.height - 8, 4, 4);
                        ctx.fillRect(obj.x + obj.width - 8, obj.y + obj.bounceOffset + obj.height - 8, 4, 4);
                    } else {
                        drawPixelArt(ctx, blockSprite, obj.x, obj.y + obj.bounceOffset, obj.width, obj.height, true);
                    }
                } else if (obj.type === 'brick') {
                    ctx.fillStyle = '#c84c0c';
                    ctx.fillRect(obj.x, obj.y + obj.bounceOffset, obj.width, obj.height);
                    ctx.strokeStyle = '#000';
                    ctx.lineWidth = 2;
                    ctx.strokeRect(obj.x, obj.y + obj.bounceOffset, obj.width, obj.height);
                    ctx.beginPath();
                    ctx.moveTo(obj.x, obj.y + obj.bounceOffset + obj.height / 2);
                    ctx.lineTo(obj.x + obj.width, obj.y + obj.bounceOffset + obj.height / 2);
                    ctx.moveTo(obj.x + obj.width / 2, obj.y + obj.bounceOffset);
                    ctx.lineTo(obj.x + obj.width / 2, obj.y + obj.bounceOffset + obj.height / 2);
                    ctx.moveTo(obj.x + obj.width / 4, obj.y + obj.bounceOffset + obj.height / 2);
                    ctx.lineTo(obj.x + obj.width / 4, obj.y + obj.bounceOffset + obj.height);
                    ctx.moveTo(obj.x + 3 * obj.width / 4, obj.y + obj.bounceOffset + obj.height / 2);
                    ctx.lineTo(obj.x + 3 * obj.width / 4, obj.y + obj.bounceOffset + obj.height);
                    ctx.stroke();
                } else if (obj.type === 'pipe') {
                    ctx.fillStyle = '#00cc00';
                    ctx.fillRect(obj.x + 5, obj.y + 20, obj.width - 10, obj.height - 20);
                    ctx.fillStyle = '#000';
                    ctx.strokeRect(obj.x + 5, obj.y + 20, obj.width - 10, obj.height - 20);
                    ctx.fillStyle = '#00cc00';
                    ctx.fillRect(obj.x, obj.y, obj.width, 20);
                    ctx.strokeRect(obj.x, obj.y, obj.width, 20);
                    ctx.fillStyle = '#55ff55';
                    ctx.fillRect(obj.x + 10, obj.y + 2, 10, obj.height - 2);
                } else if (obj.type === 'flagpole') {
                    ctx.fillStyle = '#fff';
                    ctx.fillRect(obj.x, obj.y, 10, obj.height);
                    ctx.fillStyle = '#000';
                    ctx.strokeRect(obj.x, obj.y, 10, obj.height);
                    ctx.fillStyle = '#facc15';
                    ctx.beginPath();
                    ctx.arc(obj.x + 5, obj.y - 10, 10, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.stroke();
                    ctx.fillStyle = '#00cc00';
                    ctx.fillRect(obj.x - 30, obj.flagY, 30, 30);
                    ctx.strokeRect(obj.x - 30, obj.flagY, 30, 30);
                } else if (obj.type === 'castle') {
                    ctx.fillStyle = '#ffcc99';
                    ctx.fillRect(obj.x, obj.y, obj.width, obj.height);
                    ctx.fillStyle = '#000';
                    ctx.strokeRect(obj.x, obj.y, obj.width, obj.height);
                    ctx.fillStyle = '#ff9900';
                    for (let i = 0; i < 4; i++) {
                        ctx.fillRect(obj.x + i * (obj.width / 4), obj.y - 20, obj.width / 4 - 2, 20);
                        ctx.strokeRect(obj.x + i * (obj.width / 4), obj.y - 20, obj.width / 4 - 2, 20);
                    }
                    ctx.fillStyle = '#000';
                    ctx.fillRect(obj.x + obj.width / 2 - 20, obj.y + obj.height - 40, 40, 40);
                }
            }

            drawPixelArt(ctx, marioSprite, player.x, player.y, player.width, player.height, player.direction === 1);
            ctx.restore();
        }

        function loop() {
            update();
            draw();
            animationFrameId = requestAnimationFrame(loop);
        }

        loop();

        return () => {
            window.removeEventListener('resize', resize);
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
            document.removeEventListener('touchmove', touchMove);
            if (animationFrameId) cancelAnimationFrame(animationFrameId);
        };
    }, [navigate]);

    return (
        <div className="super-body">
            <div id="ui-layer">
                <div id="mario-ui">
                    <div className="ui-block">
                        <div>MARIO</div>
                        <div id="scoreDisplay">{score.toString().padStart(6, '0')}</div>
                    </div>
                    <div className="ui-block">
                        <div style={{ color: '#facc15' }}>🪙 x<span id="coinDisplay">{coins.toString().padStart(2, '0')}</span></div>
                    </div>
                    <div className="ui-block">
                        <div>CARDS</div>
                        <div id="cardDisplay">{cardsCollected}/7</div>
                    </div>
                    <div className="ui-block">
                        <div>WORLD</div>
                        <div>1-1</div>
                    </div>
                    <div className="ui-block">
                        <div>TIME</div>
                        <div id="timeDisplay">400</div>
                    </div>
                </div>
                <div id="cardContainer" ref={cardContainerRef}></div>
                <div id="winMessage" style={{ display: showWinMessage ? 'block' : 'none', pointerEvents: 'auto' }}>
                    COURSE CLEAR!<br />
                    <span style={{ fontSize: '24px', color: 'white', display: 'block', marginTop: '15px' }}>You got all 7 cards!</span>
                    <button
                        onClick={handleReadMessage}
                        style={{ padding: '15px 30px', fontFamily: "'Press Start 2P', cursive", fontSize: '16px', background: '#facc15', border: '4px solid #000', borderRadius: '8px', cursor: 'pointer', marginTop: '30px', display: 'inline-block', boxShadow: '4px 4px 0px #000', transition: 'transform 0.1s' }}
                    >
                        READ MESSAGE
                    </button>
                </div>
            </div>

            <div id="mobile-start" className={showMobileStart ? 'show' : ''}>
                <h1 style={{ fontSize: '24px', marginBottom: '20px', textShadow: '2px 2px 0 #000' }}>SUPER MARIO</h1>
                <p style={{ marginBottom: '30px', lineHeight: 1.5, fontSize: '12px', textShadow: '1px 1px 0 #000' }}>For the best experience, please play in Landscape Mode.</p>
                <div className="btn" onClick={handleMobileStart} style={{ width: 'auto', padding: '15px 30px', borderRadius: '12px', fontSize: '16px', background: '#e52521', color: 'white', borderColor: '#000' }}>PLAY FULLSCREEN</div>
            </div>

            <canvas id="gameCanvas" ref={canvasRef}></canvas>

            <div id="controls">
                <div className="d-pad">
                    <div className="btn" onTouchStart={(e) => { e.preventDefault(); keys.current.left = true; }} onMouseDown={(e) => { e.preventDefault(); keys.current.left = true; }} onTouchEnd={(e) => { e.preventDefault(); keys.current.left = false; }} onMouseUp={(e) => { e.preventDefault(); keys.current.left = false; }} onMouseLeave={(e) => { e.preventDefault(); keys.current.left = false; }}>◀</div>
                    <div className="btn" onTouchStart={(e) => { e.preventDefault(); keys.current.right = true; }} onMouseDown={(e) => { e.preventDefault(); keys.current.right = true; }} onTouchEnd={(e) => { e.preventDefault(); keys.current.right = false; }} onMouseUp={(e) => { e.preventDefault(); keys.current.right = false; }} onMouseLeave={(e) => { e.preventDefault(); keys.current.right = false; }}>▶</div>
                </div>
                <div className="btn" style={{ borderRadius: '12px', width: '90px', fontSize: '16px' }} onTouchStart={(e) => { e.preventDefault(); keys.current.jump = true; }} onMouseDown={(e) => { e.preventDefault(); keys.current.jump = true; }} onTouchEnd={(e) => { e.preventDefault(); keys.current.jump = false; }} onMouseUp={(e) => { e.preventDefault(); keys.current.jump = false; }} onMouseLeave={(e) => { e.preventDefault(); keys.current.jump = false; }}>JUMP</div>
            </div>
        </div>
    );
};

export default Super;
