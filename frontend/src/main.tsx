import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import Hero from './Hero.tsx'
import Background from './Background.tsx'
import SignUp from './Signup.tsx'
import { BrowserRouter, Routes, Route} from 'react-router'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Background></Background>
    
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Hero />}></Route>
        <Route path="/sign-up" element={<SignUp />}></Route>
        <Route path="/login"></Route>
      </Routes>
    </BrowserRouter>
  </StrictMode>
)
