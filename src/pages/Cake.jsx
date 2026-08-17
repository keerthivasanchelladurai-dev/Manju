import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Cake.css';

const Cake = () => {
    const navigate = useNavigate();
    
    // Canvas layers
    const layerPlateRef = useRef(null);
    const layerBottomRef = useRef(null);
    const layerMiddleRef = useRef(null);
    const layerTopRef = useRef(null);
    const layerCandleRef = useRef(null);

    const [cakeSceneActive, setCakeSceneActive] = useState(true);
    const [leftPanelVisible, setLeftPanelVisible] = useState(false);
    const [btnVisible, setBtnVisible] = useState(false);
    const [btnText, setBtnText] = useState("Ready to blow the cake? 🎂");
    const [btnStyle, setBtnStyle] = useState({});

    const dragState = useRef({
        audioContext: null,
        micStream: null,
        isCandleLit: true
    });

    useEffect(() => {
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

        setTimeout(() => { setLeftPanelVisible(true); }, 1500);
        setTimeout(() => { setBtnVisible(true); }, 2500);

        const resizeAndDraw = () => {
            const isMobilePortrait = window.innerWidth <= 768 && window.innerHeight > window.innerWidth;
            const widthFactor = isMobilePortrait ? 0.75 : 0.35;
            const heightFactor = isMobilePortrait ? 0.45 : 0.55;
            
            const maxPixelWidth = Math.floor((window.innerWidth * widthFactor) / gridWidth);
            const maxPixelHeight = Math.floor((window.innerHeight * heightFactor) / gridHeight);
            const maxPixelSize = isMobilePortrait ? 8 : 6;
            const pixelSize = Math.max(1, Math.min(maxPixelSize, Math.min(maxPixelWidth, maxPixelHeight)));

            const targetWidth = gridWidth * pixelSize;
            const targetHeight = gridHeight * pixelSize;
            
            const cakeContainer = document.getElementById('cakeContainer');
            if (cakeContainer) {
                cakeContainer.style.width = targetWidth + 'px';
                cakeContainer.style.height = targetHeight + 'px';
                if (contexts[1].canvas.width !== targetWidth || contexts[1].canvas.height !== targetHeight) {
                    for (let i = 1; i <= 5; i++) {
                        contexts[i].canvas.width = targetWidth;
                        contexts[i].canvas.height = targetHeight;
                    }
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
    }, []);

    const handleBlowCandle = async () => {
        if (dragState.current.audioContext) return;
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            dragState.current.micStream = stream;
            dragState.current.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const analyser = dragState.current.audioContext.createAnalyser();
            const microphone = dragState.current.audioContext.createMediaStreamSource(stream);

            analyser.smoothingTimeConstant = 0.5;
            analyser.fftSize = 256;
            microphone.connect(analyser);

            const dataArray = new Uint8Array(analyser.frequencyBinCount);

            setBtnText("Listening... BLOW now! 🌬️");
            setBtnStyle({ transform: 'scale(1.05)' });

            const checkBlow = () => {
                if (!dragState.current.isCandleLit) return;
                analyser.getByteFrequencyData(dataArray);
                let sum = 0;
                for (let i = 0; i < dataArray.length; i++) { sum += dataArray[i]; }
                let average = sum / dataArray.length;

                if (average > 35) {
                    dragState.current.isCandleLit = false;
                    
                    if (dragState.current.micStream) {
                        dragState.current.micStream.getTracks().forEach(track => track.stop());
                    }
                    if (dragState.current.audioContext && dragState.current.audioContext.state !== 'closed') {
                        dragState.current.audioContext.close().catch(() => {});
                    }

                    setBtnText("Yay! 👏");
                    setBtnStyle({ background: '#2d8a4e' });
                    
                    setTimeout(() => {
                        const blackout = document.createElement('div');
                        blackout.style.cssText = 'position:fixed;top:0;left:0;width:100vw;height:100vh;background:black;z-index:9999;opacity:0;transition:opacity 1.5s;';
                        document.body.appendChild(blackout);
                        setTimeout(() => blackout.style.opacity = '1', 50);
                        setTimeout(() => {
                            if (blackout) blackout.remove();
                            navigate('/last');
                        }, 1600);
                    }, 1200);
                } else {
                    requestAnimationFrame(checkBlow);
                }
            };
            checkBlow();
        } catch (err) {
            console.error("Mic access denied:", err);
            setBtnText("Mic access denied 😞");
            setBtnStyle({ background: '#991122' });
        }
    };

    useEffect(() => {
        return () => {
            if (dragState.current.micStream) {
                dragState.current.micStream.getTracks().forEach(track => track.stop());
            }
            if (dragState.current.audioContext && dragState.current.audioContext.state !== 'closed') {
                dragState.current.audioContext.close().catch(() => {});
            }
        }
    }, []);

    return (
        <div className="cake-body">
            <div id="cake-scene" className={cakeSceneActive ? 'active' : ''}>
                <div id="leftPanel" className={leftPanelVisible ? 'visible' : ''}>
                    <div className="quote" style={{fontSize: '24px', lineHeight: '1.4'}}>
                        You weren’t meant to solve the mystery.<br />
                        You were meant to discover the reason.<br />
                        Today is your day.<br />
                        Happy Birthday. 🎂✨
                    </div>
                    <button className={`ready-btn ${btnVisible ? 'visible' : ''}`} style={btnStyle} onClick={handleBlowCandle}>
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

export default Cake;
