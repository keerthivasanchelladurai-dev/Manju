import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import * as THREE from 'three';
import './Fix.css';

const Fix = () => {
  const navigate = useNavigate();
  const scrollCanvasRef = useRef(null);
  const shatterCanvasRef = useRef(null);
  const portContainerRef = useRef(null);

  const [choiceVisible, setChoiceVisible] = useState(false);
  const [leaveMsgVisible, setLeaveMsgVisible] = useState(false);
  const [portSceneActive, setPortSceneActive] = useState(false);
  const [portCrossfade, setPortCrossfade] = useState(false);
  const [hudClass, setHudClass] = useState('hud-left');
  const [msgVisible, setMsgVisible] = useState(false);
  const [hudMessage, setHudMessage] = useState('INITIALIZING');
  const [hudLabel, setHudLabel] = useState('Travel Status');
  const [finalFlash, setFinalFlash] = useState(false);
  const [msgColor, setMsgColor] = useState('#00f3ff');
  const [isFadingOut, setIsFadingOut] = useState(false);

  const imagesRef = useRef([]);
  const phase1End = 27;
  const totalFrames = 52;

  useEffect(() => {
    let loadedCount = 0;
    const images = [];
    let isMounted = true;
    let started = false;

    const sCtx = scrollCanvasRef.current?.getContext('2d');
    const shCtx = shatterCanvasRef.current?.getContext('2d');

    const drawImage = (img) => {
      if (!img || !img.complete || !scrollCanvasRef.current) return;
      const W = scrollCanvasRef.current.width;
      const H = scrollCanvasRef.current.height;
      const cR = W / H;
      const iR = img.width / img.height;
      let dW = W, dH = H, oX = 0, oY = 0;
      if (cR > iR) { dH = W / iR; oY = (H - dH) / 2; }
      else { dW = H * iR; oX = (W - dW) / 2; }
      sCtx.clearRect(0, 0, W, H);
      sCtx.drawImage(img, oX, oY, dW, dH);
    };

    const renderFrame = (idx) => {
      const c = Math.min(totalFrames - 1, Math.max(0, idx));
      const img = images[c];
      if (img && img.complete) drawImage(img);
      else if (img) img.onload = () => drawImage(img);
    };

    const startPhase1 = () => {
      let f = 0;
      const play = () => {
        if (!isMounted) return;
        renderFrame(f);
        f++;
        if (f < phase1End) setTimeout(play, 120);
        else {
          renderFrame(phase1End - 1);
          setTimeout(() => setChoiceVisible(true), 800);
        }
      };
      play();
    };

    const onAllLoaded = () => {
      if (started) return;
      started = true;
      renderFrame(0);
      setTimeout(startPhase1, 500);
    };

    // Load images
    for (let i = 1; i <= totalFrames; i++) {
      const img = new Image();
      img.src = `/hand/ezgif-frame-${i.toString().padStart(3, '0')}.jpg`;
      img.onload = () => { loadedCount++; if (loadedCount >= totalFrames) onAllLoaded(); };
      img.onerror = () => { loadedCount++; if (loadedCount >= totalFrames) onAllLoaded(); };
      images.push(img);
    }
    imagesRef.current = images;

    const resizeCanvas = () => {
      if (scrollCanvasRef.current && shatterCanvasRef.current) {
        scrollCanvasRef.current.width = window.innerWidth;
        scrollCanvasRef.current.height = window.innerHeight;
        shatterCanvasRef.current.width = window.innerWidth;
        shatterCanvasRef.current.height = window.innerHeight;
        if (started) renderFrame(phase1End - 1);
      }
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    setTimeout(() => { if (!started) onAllLoaded(); }, 5000);

    return () => {
      isMounted = false;
      window.removeEventListener('resize', resizeCanvas);
      document.body.style.transition = '';
      document.body.style.backgroundColor = '';
    };
  }, []);

  const handleAccept = () => {
    setChoiceVisible(false);
    setTimeout(startPhase2, 500);
  };

  const handleLeave = () => {
    setChoiceVisible(false);
    setTimeout(() => navigate('/last'), 500);
  };

  const startPhase2 = () => {
    let f = phase1End;
    const rapid = () => {
      if (scrollCanvasRef.current) {
        const sCtx = scrollCanvasRef.current.getContext('2d');
        const img = imagesRef.current[f];
        if (img && img.complete) {
          const W = scrollCanvasRef.current.width;
          const H = scrollCanvasRef.current.height;
          const cR = W / H;
          const iR = img.width / img.height;
          let dW = W, dH = H, oX = 0, oY = 0;
          if (cR > iR) { dH = W / iR; oY = (H - dH) / 2; }
          else { dW = H * iR; oX = (W - dW) / 2; }
          sCtx.clearRect(0, 0, W, H);
          sCtx.drawImage(img, oX, oY, dW, dH);
        }
      }
      f++;
      if (f < totalFrames) setTimeout(rapid, 100);
      else setTimeout(startFadeOut, 100);
    };
    rapid();
  };

  const startFadeOut = () => {
    setIsFadingOut(true);
    setTimeout(() => {
      navigate('/port');
    }, 2500);
  };

  return (
    <div className={`fix-body ${isFadingOut ? 'fade-out' : ''}`}>
      <canvas id="scrollCanvas" ref={scrollCanvasRef}></canvas>
      <canvas id="shatterCanvas" ref={shatterCanvasRef}></canvas>

      <div id="choice-screen" className={choiceVisible ? 'show' : ''} style={{ display: choiceVisible ? 'flex' : 'none' }}>
        <div className="choice-text">If you believe me...<br />give your hand</div>
        <div className="btn-row">
          <button className="choice-btn btn-accept" onClick={handleAccept}>I believe you 🤝</button>
          <button className="choice-btn btn-leave" onClick={handleLeave}>Leave it here</button>
        </div>
      </div>

      <div id="leave-msg" className={leaveMsgVisible ? 'show' : ''} style={{ display: leaveMsgVisible ? 'flex' : 'none' }}>
        <div className="choice-text">You have another option...<br />but the hand will wait.</div>
      </div>

    </div>
  );
};

export default Fix;
