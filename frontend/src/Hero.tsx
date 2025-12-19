import './globals.css'
import StreamlineFreehandCameraModePhoto from './components/StreamlineFreehandCameraModePhoto'

function Hero() {
    return (
        <div className="flex align-center justify-center h-full">
            <div className="self-center flex flex-col justify-center text-center w-full">
                <h2 className="w-full self-center text-4xl md:text-5xl font-[DM_Sans] lg:text-6xl font-semibold text-neutral-300 max-w-7xl relative z-20 py-6">
                    Study <p className="font-[DM_Serif] inline font-light text-5xl md:text-6xl lg:text-8xl">smarter</p> at warp speed
                </h2>

                <p className="w-full self-center text-xl md:text-2xl font-[DM_Sans] lg:text-3xl font-medium text-neutral-300 max-w-7xl relative z-20 py-6 mb-15">With StudyLapse, your study videos can also help you study YOU.</p>
                <StreamlineFreehandCameraModePhoto className="z-50 w-1/2 fixed self-center mt-120"></StreamlineFreehandCameraModePhoto>
            </div>
        </div>
    )
}

export default Hero