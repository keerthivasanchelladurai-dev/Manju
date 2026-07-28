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
    setTimeout(() => setLeaveMsgVisible(true), 500);
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
      else setTimeout(startShatter, 100);
    };
    rapid();
  };

  const startShatter = () => {
    if (shatterCanvasRef.current) shatterCanvasRef.current.classList.add('show');
    if (scrollCanvasRef.current) scrollCanvasRef.current.style.display = 'none';
    document.body.style.transition = 'background-color 2.5s ease';
    document.body.style.backgroundColor = '#000';

    const shCtx = shatterCanvasRef.current?.getContext('2d');
    if (!shCtx) return;

    const W = shatterCanvasRef.current.width;
    const H = shatterCanvasRef.current.height;
    const img = imagesRef.current[totalFrames - 1];

    const cR = W / H;
    const iR = img.width / img.height;
    let dW = W, dH = H, oX = 0, oY = 0;
    if (cR > iR) { dH = W / iR; oY = (H - dH) / 2; }
    else { dW = H * iR; oX = (W - dW) / 2; }

    const cols = 100;
    const rows = Math.floor(cols * (H / W));
    const pW = W / cols;
    const pH = H / rows;

    const particles = [];
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        const sX = x * pW;
        const sY = y * pH;
        particles.push({
          x: sX, y: sY, origX: sX, origY: sY,
          w: pW, h: pH,
          vx: (Math.random() - 0.5) * 35,
          vy: (Math.random() - 0.5) * 35 - 10,
          rot: 0, vrot: (Math.random() - 0.5) * 0.15,
          alpha: 1
        });
      }
    }

    let last = performance.now();
    let animId;
    const animS = (now) => {
      const dt = (now - last) / 1000;
      last = now;
      shCtx.clearRect(0, 0, W, H);
      let active = false;
      for (let p of particles) {
        p.vy += 15 * dt;
        p.x += p.vx * dt * 60;
        p.y += p.vy * dt * 60;
        p.rot += p.vrot;
        p.alpha -= dt * 0.4;

        if (p.alpha > 0) {
          active = true;
          shCtx.save();
          shCtx.translate(p.x + p.w / 2, p.y + p.h / 2);
          shCtx.rotate(p.rot);
          shCtx.globalAlpha = p.alpha;
          let iX = (p.origX - oX) * (img.width / dW);
          let iY = (p.origY - oY) * (img.height / dH);
          let iW = p.w * (img.width / dW);
          let iH = p.h * (img.height / dH);

          if (iX >= 0 && iX + iW <= img.width && iY >= 0 && iY + iH <= img.height) {
            shCtx.drawImage(img, iX, iY, iW, iH, -p.w / 2, -p.h / 2, p.w, p.h);
          } else {
            shCtx.fillStyle = '#fff';
            shCtx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
          }
          shCtx.restore();
        }
      }
      if (active) animId = requestAnimationFrame(animS);
      else startTeleportTunnel();
    };
    animId = requestAnimationFrame(animS);
  };

  const startTeleportTunnel = () => {
    if (shatterCanvasRef.current) shatterCanvasRef.current.style.display = 'none';
    setPortSceneActive(true);
    setTimeout(() => setPortCrossfade(true), 100);

    const scene3 = new THREE.Scene();
    scene3.fog = new THREE.FogExp2(0x000000, 0.002);
    const cam = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 1000);
    const ren = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    ren.setSize(window.innerWidth, window.innerHeight);
    ren.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    if (portContainerRef.current) portContainerRef.current.appendChild(ren.domElement);

    const mkCloud = () => {
      const c = document.createElement('canvas'); c.width = 512; c.height = 512;
      const x = c.getContext('2d');
      x.fillStyle = '#000'; x.fillRect(0, 0, 512, 512);
      const cols = ['rgba(0,243,255,0.1)', 'rgba(255,0,153,0.1)', 'rgba(0,255,100,0.1)', 'rgba(20,0,80,0.2)'];
      for (let i = 0; i < 30; i++) {
        const px = Math.random() * 512, py = Math.random() * 512, r = Math.random() * 200 + 50;
        const g = x.createRadialGradient(px, py, 0, px, py, r);
        g.addColorStop(0, cols[Math.floor(Math.random() * cols.length)]);
        g.addColorStop(1, 'rgba(0,0,0,0)');
        x.fillStyle = g; x.beginPath(); x.arc(px, py, r, 0, Math.PI * 2); x.fill();
      }
      x.fillStyle = '#fff';
      for (let i = 0; i < 200; i++) {
        x.globalAlpha = Math.random();
        x.beginPath(); x.arc(Math.random() * 512, Math.random() * 512, Math.random() * 1.5, 0, Math.PI * 2); x.fill();
      }
      const t = new THREE.CanvasTexture(c); t.wrapS = THREE.RepeatWrapping; t.wrapT = THREE.RepeatWrapping; return t;
    };

    const mkDust = () => {
      const c = document.createElement('canvas'); c.width = 32; c.height = 32;
      const x = c.getContext('2d');
      const g = x.createRadialGradient(16, 16, 2, 16, 16, 16);
      g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(0.5, 'rgba(255,255,255,0.8)'); g.addColorStop(1, 'rgba(255,255,255,0)');
      x.fillStyle = g; x.fillRect(0, 0, 32, 32);
      return new THREE.CanvasTexture(c);
    };

    const pts = [];
    for (let i = 0; i < 50; i++) { const t = i * 0.5; pts.push(new THREE.Vector3(Math.sin(t) * 10, Math.cos(t) * 10, i * 40)); }
    const curve3 = new THREE.CatmullRomCurve3(pts);

    const cloudTex = mkCloud();
    const tubeMat = new THREE.MeshBasicMaterial({ map: cloudTex, side: THREE.BackSide, transparent: true, opacity: 0.8, blending: THREE.AdditiveBlending, depthWrite: false });
    const tube3 = new THREE.Mesh(new THREE.TubeGeometry(curve3, 100, 8, 16, false), tubeMat);
    scene3.add(tube3);

    const dCount = 15000, dGeo = new THREE.BufferGeometry(), dPos = new Float32Array(dCount * 3);
    for (let i = 0; i < dCount; i++) {
      const p = curve3.getPointAt(Math.random());
      dPos[i * 3] = p.x + (Math.random() - 0.5) * 15;
      dPos[i * 3 + 1] = p.y + (Math.random() - 0.5) * 15;
      dPos[i * 3 + 2] = p.z;
    }
    dGeo.setAttribute('position', new THREE.BufferAttribute(dPos, 3));
    const dMat = new THREE.PointsMaterial({ color: 0xffffff, size: 0.25, map: mkDust(), transparent: true, opacity: 0.8, blending: THREE.AdditiveBlending, depthWrite: false });
    const dustSys = new THREE.Points(dGeo, dMat);
    scene3.add(dustSys);

    let spd = 0.5, ppos = 0;
    let anim3Id;
    const anim3 = () => {
      anim3Id = requestAnimationFrame(anim3);
      cloudTex.offset.x -= 0.005 * spd; cloudTex.offset.y += 0.002 * spd;
      ppos += 0.0008 * spd; if (ppos > 1) ppos = 0;
      const p1 = curve3.getPointAt(ppos % 1), p2 = curve3.getPointAt((ppos + 0.01) % 1);
      cam.position.copy(p1); cam.lookAt(p2);
      tube3.rotation.z += 0.005 * spd; dustSys.rotation.z -= 0.002 * spd;
      ren.render(scene3, cam);
    };
    anim3();

    const handleResize = () => {
      cam.aspect = window.innerWidth / window.innerHeight;
      cam.updateProjectionMatrix();
      ren.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    const msgs = [
      { text: "365 days,", label: "another beautiful chapter." },
      { text: "8,760 hours • 525,600 minutes,", label: "filled with countless memories." },
      { text: "And today...", label: "a new journey begins. ✨" },
      { text: "years of an amazing soul,", label: "Today is all about you." },
      { text: "Happy Birthday! a lady", label: "This surprise is just for you." }
    ];

    let curTime = 0, mIdx = -1;
    const updMsg = (data) => {
      setMsgVisible(false);
      setTimeout(() => {
        setHudClass(prev => prev === 'hud-left' ? 'hud-right' : 'hud-left');
        setHudMessage(data.text);
        setHudLabel(data.label);
        let ac = "#00f3ff";
        if (mIdx === 2) ac = "#ff0099";
        if (mIdx === 4) ac = "#ff3333";
        setMsgColor(ac);
        setMsgVisible(true);
      }, 200);
    };

    const hudInt = setInterval(() => {
      curTime += 0.1;
      if (curTime > 3 && curTime < 12) spd = 6.0;
      else if (curTime > 13) spd = 8.0;
      else spd = 2.0;
      let blk = Math.floor(curTime / 3);
      if (blk > mIdx && blk < msgs.length) { mIdx = blk; updMsg(msgs[mIdx]); }
      if (curTime >= 15) {
        clearInterval(hudInt);
        setFinalFlash(true);
        setTimeout(() => navigate('/moon'), 2000);
      }
    }, 100);

    setTimeout(() => { mIdx = 0; updMsg(msgs[0]); }, 100);

    return () => {
      cancelAnimationFrame(anim3Id);
      clearInterval(hudInt);
      window.removeEventListener('resize', handleResize);
    };
  };

  return (
    <div className="fix-body">
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

      <div id="port-scene" className={portSceneActive ? 'active' : ''}>
        <div id="port-crossfade" className={portCrossfade ? 'fade-out' : ''}></div>
        <div id="port-canvas-container" ref={portContainerRef}></div>
        <div id="port-flash" className={finalFlash ? 'final-flash' : ''}></div>

        {!finalFlash && (
          <div id="port-hud" className={hudClass}>
            <div className={`port-msg-container ${msgVisible ? 'visible' : ''}`}>
              <span id="port-label" style={{
                borderLeftColor: hudClass === 'hud-left' ? msgColor : 'transparent',
                borderRightColor: hudClass === 'hud-right' ? msgColor : 'transparent'
              }}>{hudLabel}</span>
              <h1 id="port-message" style={{ color: msgColor }}>{hudMessage}</h1>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Fix;
