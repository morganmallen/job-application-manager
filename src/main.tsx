import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage.tsx'
import SignIn from './pages/SignIn.tsx'
import SignUp from './pages/SignUp.tsx';
import Board from './pages/Board.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/board" element={<Board />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
