import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Index from './pages/Index'
import Intro from './pages/Intro'
import Game from './pages/Game'
import Santa from './pages/Santa'
import Fix from './pages/Fix'
import Moon from './pages/Moon'
import Super from './pages/Super'
import Last from './pages/Last'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/intro" element={<Intro />} />
        <Route path="/game" element={<Game />} />
        <Route path="/santa" element={<Santa />} />
        <Route path="/fix" element={<Fix />} />
        <Route path="/moon" element={<Moon />} />
        <Route path="/super" element={<Super />} />
        <Route path="/last" element={<Last />} />
      </Routes>
    </Router>
  )
}

export default App
