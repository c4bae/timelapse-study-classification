import { useState, useEffect } from "react"
import supabase from "../config/supabaseClient"
import { useUser, useReverification, UserProfile } from "@clerk/clerk-react"


function SettingsPage() {
    const { user, isLoaded } = useUser()

    const [firstName, setFirstName] = useState('')
    const [lastName, setLastName] = useState('')
    const [email, setEmail] = useState('')
    const [modelOption, setModelOption] = useState('Fast')
    const [settingsError, setSettingsError] = useState<string | null>(null)

    const [saved, setSaved] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            const { data, error } = await supabase
                .from('user_info')
                .select()
                .eq('user_id', user?.id)
                .single()

            if (data) {
                setFirstName(data.first_name)
                setLastName(data.last_name)
                setEmail(data.email_address)
                setModelOption(data.model_pref)
            }

            if (error) {
                console.log("Error found: ", error)
                setSettingsError(error)
            }
        }

        fetchData()
    }, [])

    const changeUserInfo = useReverification(async () => {
        if (!user) return null

        return await user?.update({
            firstName: firstName,
            lastName: lastName,
        })
    })

    // Submit new changes for user info
    const handleSubmit = async (e) => {
        e.preventDefault()

        setSaved(true)
        setTimeout(() => {setSaved(false); window.location.reload()}, 1000);

        if(!firstName || !lastName) {
            setSettingsError('Please fill in all fields.')
            return
        }
        
        changeUserInfo()

        const { data, error } = await supabase
            .from('user_info')
            .update({first_name: firstName, last_name: lastName, model_pref: modelOption})
            .eq('user_id', user?.id)
            .select()

        if (error) {
            setSettingsError('Please fill in all fields correctly.')
        }

        if (data) { 
            setSettingsError(null)
        }
    }

    return (
        <div className="flex flex-1">
            <div className="relative flex h-full w-full flex-1 flex-col gap-2 rounded-tl-2xl border border-neutral-200 bg-white p-2 md:p-8 dark:border-neutral-700 dark:bg-neutral-900">
                <div className="bg-base-100 h-full shadow rounded-lg">
                    <div className="p-7 ml-2">
                        <h1 className="font-[DM_Sans] text-4xl">Settings </h1>
                        <form className="mt-10 flex flex-col gap-10" onSubmit={handleSubmit} id="settings">
                            <div>
                                <h1 className="font-[DM_Sans]">Basic Info</h1>
                                <div className="divider"></div>
                                <div className="flex flex-col gap-5">
                                    <fieldset className="fieldset">
                                        <div className="flex ">
                                            <legend className="fieldset-legend text-lg">First Name</legend>
                                            <input type="text" className="input ml-49" placeholder="Type here" value={firstName} onChange={(e) => {setFirstName(e.target.value)}} />
                                        </div>
                                    </fieldset>
                                    <fieldset className="fieldset">
                                        <div className="flex ">
                                            <legend className="fieldset-legend text-lg">Last Name</legend>
                                            <input type="text" className="input ml-49" placeholder="Type here" value={lastName} onChange={(e) => {setLastName(e.target.value)}} />
                                        </div>
                                    </fieldset>
                                    <fieldset className="fieldset">
                                        <div className="flex ">
                                            <legend className="fieldset-legend text-lg">Email Address</legend>
                                            <input type="text" className="input ml-42" placeholder="Type here" value={email} disabled />
                                        </div>
                                    </fieldset>
                                </div>
                            </div>

                            <div className="mt-5">
                                <h1 className="font-[DM_Sans]">Usage Preferences</h1>
                                <div className="divider"></div>
                                <div className="flex flex-col gap-5">
                                    <fieldset className="fieldset">
                                        <div className="flex gap-12">
                                            <legend className="fieldset-legend text-lg">Analysis Preference</legend>
                                            <select className="select ml-17" value={modelOption} onChange={(e) => {setModelOption(e.target.value)}}>
                                                <option disabled={true}>Select model optimization:</option>
                                                <option>Fast</option>
                                                <option>Smart</option>
                                            </select>
                                        </div>
                                    </fieldset>
                                    <div className="font-[DM_Sans]">
                                        <p>Fast - Prioritize speed over thorough analysis</p>
                                        <p>Smart - Prioritize deep analysis at the cost of speed</p>
                                    </div>
                                </div>
                            </div>
                        </form>
                        <div className="flex justify-end">
                            {isLoaded && <button className={`btn btn-xl justify-self-end mr-5 btn transition-colors duration-200 ${saved ? 'btn btn-xl justify-self-end mr-5 bg-green-300 border-neutral-200' : ''}`} form="settings" type="submit">{saved ? "Saved!" : "Save Changes"}</button>}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default SettingsPage