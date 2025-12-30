import { useEffect } from "react";
import { useUser } from "@clerk/clerk-react";
import { useNavigate } from "react-router";

function ProtectedRoute({ children }) {
    const { user, isLoaded, isSignedIn } = useUser()
    const navigate = useNavigate()

    useEffect(() => {
        if ((isLoaded && !isSignedIn)) {
            navigate("/")
        }
        
    }, [isLoaded, isSignedIn, navigate, user])

    if (!isLoaded) {
        return (
            <div className="w-full h-full bg-white rounded-md border border-neutral-200 flex">
                <h1 className="font-[DM_Sans] text-5xl self-center text-center w-full">.  .  .</h1>
            </div>
        )
    }

    if (!isSignedIn) {
        return (
            null
        )
    }

    return children
}

export default ProtectedRoute