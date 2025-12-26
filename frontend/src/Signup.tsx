import { SignUp } from "@clerk/clerk-react"

function SignUpForm() {
   return (
        <div className="flex justify-center items-center h-full w-full">
            <SignUp
                appearance={{
                    variables: {
                        fontFamily: 'DM Sans'
                    }
                }}
                signInUrl='/login'
                forceRedirectUrl={"/dashboard"}
            >
            </SignUp>
        </div>
    )
}

export default SignUpForm