import React, { useEffect, useRef, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Index from './pages/Index'
import Intro from './pages/Intro'
import Game from './pages/Game'
import Santa from './pages/Santa'
import Roses from './pages/Roses'
import Fix from './pages/Fix'
import Port from './pages/Port'
import Moon from './pages/Moon'
import Cake from './pages/Cake'
import Super from './pages/Super'
import Last from './pages/Last'

const GlobalAudio = () => {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSongIndex, setCurrentSongIndex] = useState(0);

  const songs = ['/music/song1.mp3', '/music/song2.mp3'];

  useEffect(() => {
    const playAudio = () => {
      if (audioRef.current && !isPlaying) {
        audioRef.current.play().then(() => {
          setIsPlaying(true);
          document.removeEventListener('click', playAudio);
          document.removeEventListener('touchstart', playAudio);
          document.removeEventListener('keydown', playAudio);
        }).catch(err => {
          console.log("Audio play failed:", err);
        });
      }
    };

    document.addEventListener('click', playAudio);
    document.addEventListener('touchstart', playAudio);
    document.addEventListener('keydown', playAudio);

    return () => {
      document.removeEventListener('click', playAudio);
      document.removeEventListener('touchstart', playAudio);
      document.removeEventListener('keydown', playAudio);
    };
  }, [isPlaying]);

  useEffect(() => {
    if (isPlaying && audioRef.current) {
      audioRef.current.play().catch(e => console.log(e));
    }
  }, [currentSongIndex, isPlaying]);

  const handleEnded = () => {
    if (currentSongIndex < songs.length - 1) {
      setCurrentSongIndex(currentSongIndex + 1);
    } else {
      setCurrentSongIndex(0);
    }
  };

  return (
    <audio ref={audioRef} src={songs[currentSongIndex]} onEnded={handleEnded} />
  );
};

function App() {
  return (
    <Router>
      <GlobalAudio />
      <Routes>
        <Route path="/" element={<Game />} />
        <Route path="/game" element={<Game />} />
        <Route path="/santa" element={<Santa />} />
        <Route path="/roses" element={<Roses />} />
        <Route path="/fix" element={<Fix />} />
        <Route path="/port" element={<Port />} />
        <Route path="/moon" element={<Moon />} />
        <Route path="/cake" element={<Cake />} />
        <Route path="/last" element={<Last />} />
      </Routes>
    </Router>
  )
}

export default App
