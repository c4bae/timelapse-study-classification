import Hero from './pages/Hero.tsx'
import Background from './components/ui/background.tsx'
import SignUpForm from './pages/Signup.tsx'
import SignInForm from './pages/Login.tsx'
import { BrowserRouter, Routes, Route} from 'react-router'
import { Dashboard } from './pages/Dashboard.tsx'
import './globals.css'
import NoPage from './pages/NoPage.tsx'

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
                    <Route path="*" element={<NoPage />}></Route>
                </Routes>
            </BrowserRouter>
        </>
    )
}

export default App