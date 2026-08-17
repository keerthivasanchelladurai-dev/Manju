import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Matter from 'matter-js';
import './Roses.css';

const Typewriter = ({ text, show, speed = 50 }) => {
    const [displayedText, setDisplayedText] = useState("");

    useEffect(() => {
        if (!show) return;

        setDisplayedText("");
        let i = 0;
        const interval = setInterval(() => {
            if (i < text.length) {
                setDisplayedText(text.substring(0, i + 1));
                i++;
            } else {
                clearInterval(interval);
            }
        }, speed);

        return () => clearInterval(interval);
    }, [text, show, speed]);

    return <span>{displayedText}<span className="cursor">|</span></span>;
};

const Roses = () => {
    const containerRef = useRef(null);
    const navigate = useNavigate();
    const [showMessage, setShowMessage] = useState(false);
    const [messageText, setMessageText] = useState("You don’t know me. I don’t know you. Yet this found its way to you.");
    const [isOpened, setIsOpened] = useState(false);
    const [isFadingOut, setIsFadingOut] = useState(false);
    const [showButton, setShowButton] = useState(false);

    useEffect(() => {
        const Engine = Matter.Engine,
            Render = Matter.Render,
            Runner = Matter.Runner,
            Bodies = Matter.Bodies,
            Composite = Matter.Composite,
            Mouse = Matter.Mouse,
            MouseConstraint = Matter.MouseConstraint;

        const engine = Engine.create();

        const render = Render.create({
            element: containerRef.current,
            engine: engine,
            options: {
                width: window.innerWidth,
                height: window.innerHeight,
                background: 'transparent',
                wireframes: false,
                pixelRatio: window.devicePixelRatio
            }
        });

        const wallOptions = { isStatic: true, render: { visible: false } };
        const ground = Bodies.rectangle(window.innerWidth / 2, window.innerHeight + 50, window.innerWidth * 2, 100, wallOptions);
        const leftWall = Bodies.rectangle(-50, window.innerHeight / 2, 100, window.innerHeight * 2, wallOptions);
        const rightWall = Bodies.rectangle(window.innerWidth + 50, window.innerHeight / 2, 100, window.innerHeight * 2, wallOptions);

        Composite.add(engine.world, [ground, leftWall, rightWall]);

        const roseTextures = ['/images/rose1.png', '/images/rose2.png', '/images/rose3.png'];

        let roseCount = 0;
        const isMobile = window.innerWidth <= 768;
        const maxRoses = isMobile ? 100 : 200;
        let isOpening = false;
        let effectTimeout, buttonTimeout, spawnInterval;

        function createRose() {
            if (roseCount >= maxRoses) {
                if (!isOpening) {
                    isOpening = true;
                    effectTimeout = setTimeout(openScreenEffect, isMobile ? 1000 : 2000);
                }
                return;
            }

            const radius = isMobile ? (25 + Math.random() * 15) : (45 + Math.random() * 25);
            const x = Math.random() * window.innerWidth;
            const y = -100 - Math.random() * 100;

            const texture = roseTextures[Math.floor(Math.random() * roseTextures.length)];

            const rose = Bodies.circle(x, y, radius, {
                restitution: 0.2,
                friction: 0.5,
                density: 0.04,
                label: 'rose',
                angle: Math.random() * Math.PI * 2,
                render: {
                    sprite: {
                        texture: texture,
                        xScale: (radius * 3.8) / 1080,
                        yScale: (radius * 3.8) / 1080
                    }
                }
            });

            Matter.Body.setAngularVelocity(rose, (Math.random() - 0.5) * 0.2);

            Composite.add(engine.world, rose);
            roseCount++;
        }

        function openScreenEffect() {
            setIsOpened(true);
            engine.world.gravity.y = 0;
            Composite.remove(engine.world, ground);
            Composite.remove(engine.world, [leftWall, rightWall]);

            const bodies = Composite.allBodies(engine.world);

            bodies.forEach(body => {
                if (body.label === 'rose') {
                    const isLeft = body.position.x < window.innerWidth / 2;
                    const velocityX = isLeft ? -25 - Math.random() * 15 : 25 + Math.random() * 15;
                    const velocityY = (Math.random() - 0.5) * 5;

                    Matter.Body.setVelocity(body, { x: velocityX, y: velocityY });
                }
            });

            setTimeout(() => {
                setShowMessage(true);
                setTimeout(() => {
                    setShowMessage(false);
                    setTimeout(() => {
                        setMessageText("Why these words? Why today? Keep watching. The answer is close.");
                        setShowMessage(true);
                        buttonTimeout = setTimeout(() => {
                            setShowButton(true);
                        }, 4000);
                    }, 1000);
                }, 5500);
            }, 1000);
        }

        for (let i = 0; i < (isMobile ? 10 : 20); i++) {
            setTimeout(createRose, i * 10);
        }

        spawnInterval = setInterval(() => {
            createRose();
        }, isMobile ? 80 : 150);

        const mouse = Mouse.create(render.canvas);
        const mouseConstraint = MouseConstraint.create(engine, {
            mouse: mouse,
            constraint: {
                stiffness: 0.2,
                render: {
                    visible: false
                }
            }
        });

        Composite.add(engine.world, mouseConstraint);
        render.mouse = mouse;

        const handleResize = () => {
            render.canvas.width = window.innerWidth;
            render.canvas.height = window.innerHeight;
            Matter.Body.setPosition(ground, { x: window.innerWidth / 2, y: window.innerHeight + 50 });
            Matter.Body.setVertices(ground, Bodies.rectangle(window.innerWidth / 2, window.innerHeight + 50, window.innerWidth * 2, 100).vertices);
            Matter.Body.setPosition(rightWall, { x: window.innerWidth + 50, y: window.innerHeight / 2 });
            Matter.Body.setVertices(rightWall, Bodies.rectangle(window.innerWidth + 50, window.innerHeight / 2, 100, window.innerHeight * 2).vertices);
        };

        window.addEventListener('resize', handleResize);
        Render.run(render);
        const runner = Runner.create();
        Runner.run(runner, engine);

        return () => {
            window.removeEventListener('resize', handleResize);
            clearTimeout(effectTimeout);
            clearTimeout(buttonTimeout);
            clearInterval(spawnInterval);
            Render.stop(render);
            Runner.stop(runner);
            if (render.canvas) {
                render.canvas.remove();
            }
            Engine.clear(engine);
        };
    }, [navigate]);

    return (
        <div className={`roses-body ${isOpened ? 'opened' : ''} ${isFadingOut ? 'fade-out' : ''}`}>
            <div id="canvas-container" ref={containerRef}></div>
            <div id="message" className={showMessage ? 'show' : ''}>
                <Typewriter text={messageText} show={showMessage} speed={50} />
            </div>
            {showButton && (
                <button
                    className="watch-btn"
                    onClick={() => {
                        setShowButton(false);
                        setShowMessage(false);
                        setIsFadingOut(true);
                        setTimeout(() => navigate('/fix'), 2000);
                    }}
                >
                    hey watch care fully!
                </button>
            )}
        </div>
    );
};

export default Roses;
