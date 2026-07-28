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
    // Generate stars
    const newStars = [];
    for (let i = 0; i < 150; i++) {
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
    const santaSpeed = 2.5;
    const santaY = window.innerHeight * 0.10;
    
    let giftDropped = false;
    let giftFalling = false;
    let localGiftLanded = false;
    let giftY = 0;
    let giftVY = 0;
    const giftGravity = 0.15;
    const groundY = window.innerHeight * 0.78;

    let santaAnimationFrame;
    let giftAnimationFrame;

    if (santaRef.current) {
      santaRef.current.style.top = `${santaY}px`;
      santaRef.current.style.left = `${santaX}px`;
    }

    const animateSanta = () => {
      santaX += santaSpeed;
      if (santaRef.current) {
        santaRef.current.style.left = `${santaX}px`;
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

      if (santaX < window.innerWidth + 350) {
        santaAnimationFrame = requestAnimationFrame(animateSanta);
      } else if (santaRef.current) {
        santaRef.current.style.display = 'none';
      }
    };

    const animateGift = () => {
      if (giftFalling) {
        giftVY += giftGravity;
        giftY += giftVY;

        if (giftY >= groundY) {
          giftY = groundY;
          giftVY = -giftVY * 0.4; // damp bounce
          if (Math.abs(giftVY) < 0.5) {
            giftFalling = false;
            localGiftLanded = true;
            setGiftLanded(true);
            giftVY = 0;
          }
        }

        if (giftRef.current) {
          giftRef.current.style.top = `${giftY}px`;
        }
      }
      giftAnimationFrame = requestAnimationFrame(animateGift);
    };

    santaAnimationFrame = requestAnimationFrame(animateSanta);
    giftAnimationFrame = requestAnimationFrame(animateGift);

    return () => {
      if (santaAnimationFrame) cancelAnimationFrame(santaAnimationFrame);
      if (giftAnimationFrame) cancelAnimationFrame(giftAnimationFrame);
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
        navigate('/fix');
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
