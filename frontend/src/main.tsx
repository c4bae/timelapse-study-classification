import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import Hero from './Hero.tsx'
import Background from './Background.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Background></Background>
    <Hero></Hero>
  </StrictMode>
)
