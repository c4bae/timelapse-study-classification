import Hero from './Hero.tsx'
import Background from './Background.tsx'
import SignUpForm from './Signup.tsx'
import SignInForm from './Login.tsx'
import { BrowserRouter, Routes, Route} from 'react-router'
import './globals.css'

function App() {
    return (
        <>
            <Background></Background>
        
            <BrowserRouter>
            <Routes>
                <Route path="/" element={<Hero />}></Route>
                <Route path="/sign-up" element={<SignUpForm />}></Route>
                <Route path="/login" element={<SignInForm />}></Route>
            </Routes>
            </BrowserRouter>
        </>
    )
}

export default App