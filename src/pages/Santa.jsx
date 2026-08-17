import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './Santa.css';

const Santa = () => {
  const navigate = useNavigate();
  const [stars, setStars] = useState([]);
  const [stage, setStage] = useState(0); 
  const [overlayVisible, setOverlayVisible] = useState(false);
  const [whiteScreenVisible, setWhiteScreenVisible] = useState(false);
  const [giftLanded, setGiftLanded] = useState(false);
  const giftRef = useRef(null);
  const santaRef = useRef(null);

  useEffect(() => {
    // Generate stars (reduced count for better performance)
    const newStars = [];
    for (let i = 0; i < 75; i++) {
      const size = Math.random() * 3 + 1;
      newStars.push({
        id: i,
        width: `${size}px`,
        height: `${size}px`,
        left: `${Math.random() * 100}vw`,
        top: `${Math.random() * 65}vh`,
        animationDuration: `${Math.random() * 3 + 1}s`,
        animationDelay: `${Math.random() * 2}s`
      });
    }
    setStars(newStars);

    // Animation physics
    let santaX = -300;
    const baseSantaSpeed = 0.42; // pixels per ms (approx 7px per 16.6ms)
    const santaY = window.innerHeight * 0.10;
    
    let giftDropped = false;
    let giftFalling = false;
    let giftY = 0;
    let giftVY = 0;
    const baseGiftGravity = 0.009; // per ms
    const groundY = window.innerHeight * 0.78;

    let animationFrame;
    let lastTime = performance.now();

    if (santaRef.current) {
      santaRef.current.style.top = '0px';
      santaRef.current.style.left = '0px';
      santaRef.current.style.transform = `translate3d(${santaX}px, ${santaY}px, 0)`;
    }

    const animate = (time) => {
      const deltaTime = time - lastTime;
      lastTime = time;
      
      // Cap deltaTime to prevent huge jumps if tab is inactive
      const dt = Math.min(deltaTime, 50);

      // Animate Santa
      if (santaX < window.innerWidth + 350) {
        santaX += baseSantaSpeed * dt;
        if (santaRef.current) {
          santaRef.current.style.transform = `translate3d(${santaX}px, ${santaY}px, 0)`;
        }
      } else if (santaRef.current && santaRef.current.style.display !== 'none') {
        santaRef.current.style.display = 'none';
      }

      // Drop gift when santa is at the center
      if (!giftDropped && santaRef.current && (santaX + (santaRef.current.offsetWidth / 2)) >= window.innerWidth / 2) {
        giftDropped = true;
        giftY = santaY + (santaRef.current.offsetHeight * 0.6);
        if (giftRef.current) {
          giftRef.current.style.top = `${giftY}px`;
          giftRef.current.style.opacity = '1';
        }
        giftFalling = true;
      }

      // Animate Gift
      if (giftFalling) {
        giftVY += baseGiftGravity * dt;
        giftY += giftVY * dt;

        if (giftY >= groundY) {
          giftY = groundY;
          giftVY = -giftVY * 0.4; // damp bounce
          if (Math.abs(giftVY) < 0.05) { // Stop bouncing threshold
            giftFalling = false;
            setGiftLanded(true);
            giftVY = 0;
          }
        }

        if (giftRef.current) {
          giftRef.current.style.top = `${giftY}px`;
        }
      }

      // Continue loop if Santa is still on screen or gift is still falling
      if (santaX < window.innerWidth + 350 || giftFalling) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);

    return () => {
      if (animationFrame) cancelAnimationFrame(animationFrame);
    };
  }, []);

  const handleGiftClick = () => {
    if (!giftLanded) return;
    if (giftRef.current) giftRef.current.style.display = 'none';
    setOverlayVisible(true);
    setStage(0);
  };

  const handleOverlayClick = () => {
    if (stage === 0) {
      setStage(1);
    } else if (stage === 1) {
      setOverlayVisible(false);
      setWhiteScreenVisible(true);
      setTimeout(() => {
        navigate('/roses');
      }, 1600);
    }
  };

  return (
    <div className="santa-body">
      <div id="stars-container">
        {stars.map((star) => (
          <div key={star.id} className="star" style={star}></div>
        ))}
      </div>
      
      <div className="moon"></div>
      <div className="snow-ground"></div>

      <img id="santa" ref={santaRef} src="/images/santa-claus.png" alt="Santa" />

      <svg 
        id="gift" 
        ref={giftRef} 
        viewBox="0 0 100 100" 
        onClick={handleGiftClick}
      >
        <rect x="15" y="35" width="70" height="55" fill="#FF0000" rx="5" stroke="#CC0000" strokeWidth="2"/>
        <rect x="10" y="25" width="80" height="14" fill="#CC0000" rx="3" stroke="#990000" strokeWidth="2"/>
        <rect x="42" y="25" width="16" height="65" fill="#FFD700"/>
        <rect x="10" y="48" width="80" height="16" fill="#FFD700"/>
        <path d="M 50,25 C 32,5 20,12 45,25 C 70,12 58,5 50,25 Z" fill="#FFD700" stroke="#B8860B" strokeWidth="1"/>
        <circle cx="50" cy="25" r="5" fill="#B8860B"/>
      </svg>

      <div id="gift-overlay" className={overlayVisible ? 'show' : ''} style={{ display: overlayVisible ? 'flex' : 'none' }}>
        <svg id="gift-big" viewBox="0 0 100 100">
          <rect x="15" y="35" width="70" height="55" fill="#FF0000" rx="5" stroke="#CC0000" strokeWidth="2"/>
          <rect x="10" y="25" width="80" height="14" fill="#CC0000" rx="3" stroke="#990000" strokeWidth="2"/>
          <rect x="42" y="25" width="16" height="65" fill="#FFD700"/>
          <rect x="10" y="48" width="80" height="16" fill="#FFD700"/>
          <path d="M 50,25 C 32,5 20,12 45,25 C 70,12 58,5 50,25 Z" fill="#FFD700" stroke="#B8860B" strokeWidth="1"/>
          <circle cx="50" cy="25" r="5" fill="#B8860B"/>
        </svg>
        <div className="overlay-text">
          {stage === 0 ? 'Do you like to open?' : 'Really, you wanna see?'}
        </div>
        <button className="overlay-btn" onClick={handleOverlayClick}>
          {stage === 0 ? 'Open it! 🎁' : 'Yes, show me! ✨'}
        </button>
      </div>

      <div id="white-screen" className={whiteScreenVisible ? 'show' : ''}></div>
    </div>
  );
};

export default Santa;
