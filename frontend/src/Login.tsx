import { SignIn } from "@clerk/clerk-react"

function SignInForm() {
    return (
        <div className="flex justify-center items-center h-full w-full">
            <SignIn
                appearance={{
                    variables: {
                        fontFamily: 'DM Sans'
                    }
                }}
                signUpUrl='/sign-up'
            >
            </SignIn>
        </div>
    )
}

export default SignInForm