import './globals.css'
import StreamlineFreehandCameraModePhoto from './components/StreamlineFreehandCameraModePhoto'
import Border from './components/Border'
import NavBar from './components/NavBar'
import { Link } from 'react-router'

function Hero() {
    return (
        <div className="flex align-center justify-center h-full w-full">
            <Border></Border>
            <NavBar></NavBar>
            <div className="self-center flex flex-col justify-center text-center w-full">
                <h2 className="w-full self-center text-4xl md:text-5xl font-[DM_Sans] lg:text-6xl font-semibold text-neutral-200 max-w-7xl relative z-20 py-6">
                    Study <p className="font-[DM_Serif] inline font-light text-5xl md:text-6xl lg:text-8xl">smarter</p> at warp speed
                </h2>

                <p className="w-full self-center text-xl md:text-2xl font-[DM_Sans] lg:text-3xl font-medium text-neutral-300 max-w-7xl relative z-20 py-6 mb-15">With StudyLapse, your study videos can also help you study YOU.</p>
                <StreamlineFreehandCameraModePhoto className="z-50 w-1/2 fixed self-center mt-120"></StreamlineFreehandCameraModePhoto>
            </div>
            <div className="z-50 fixed mb-30 self-end flex gap-70">
                <Link to="/sign-up" className="font-[DM_Sans] shadow-[0_0_0_3px_#e6e6e6_inset] px-7 py-3 bg-black/30 dark:border-white dark:text-white text-xl text-neutral-300 rounded-lg font-medium transform hover:-translate-y-1 transition duration-400">
                    Sign Up
                </Link>
                <Link to="/login" className="font-[DM_Sans] shadow-[0_0_0_3px_#e6e6e6_inset] px-7 py-3 bg-black/30 dark:border-white dark:text-white text-xl text-neutral-300 rounded-lg font-medium transform hover:-translate-y-1 transition duration-400">
                    Login
                </Link>
            </div>
        </div>
    )
}

export default Hero