import Hero from './Hero.tsx'
import Background from './Background.tsx'
import SignUpForm from './Signup.tsx'
import SignInForm from './Login.tsx'
import { BrowserRouter, Routes, Route} from 'react-router'
import { Dashboard } from './Dashboard.tsx'
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
                    <Route path="/dashboard/*" element={<Dashboard />}></Route>
                </Routes>
            </BrowserRouter>
        </>
    )
}

export default App