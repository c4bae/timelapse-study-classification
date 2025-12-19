import DotGrid from "./components/DotGrid.tsx"
import { ShaderGradientCanvas, ShaderGradient } from '@shadergradient/react'

function Background() {
    return (
        <div className="fixed w-full h-full inset-0">
            <div className="absolute inset-0 z-0">
                <ShaderGradientCanvas className="w-full h-full pointer-events-none">
                    <ShaderGradient
                        animate="on"
                        bgColor1="#000000"
                        bgColor2="#000000"
                        brightness={0.3}
                        cAzimuthAngle={270}
                        cDistance={0.5}
                        cPolarAngle={180}
                        cameraZoom={15.1}
                        color1="#73bfc4"
                        color2="#ff810a"
                        color3="#8da0ce"
                        destination="onCanvas"
                        embedMode="off"
                        envPreset="city"
                        format="gif"
                        fov={45}
                        frameRate={10}
                        gizmoHelper="hide"
                        grain="on"
                        lightType="env"
                        pixelDensity={1}
                        positionX={-0.1}
                        positionY={0}
                        positionZ={0}
                        range="disabled"
                        rangeEnd={40}
                        rangeStart={0}
                        reflection={0.4}
                        rotationX={0}
                        rotationY={130}
                        rotationZ={70}
                        shader="defaults"
                        type="sphere"
                        uAmplitude={3.2}
                        uDensity={0.8}
                        uFrequency={5.5}
                        uSpeed={0.1}
                        uStrength={0.3}
                        uTime={0}
                        wireframe={false}
                        />
                </ShaderGradientCanvas>
            </div>
            <DotGrid
                dotSize={2}
                gap={50}
                baseColor="#c7c7c7ff"
                activeColor="#000000"
                proximity={120}
                shockRadius={250}
                shockStrength={5}
                resistance={750}
                returnDuration={1.5}
                className="inset-0 z-50 absolute"
            />
        </div>
    )
}


export default Background