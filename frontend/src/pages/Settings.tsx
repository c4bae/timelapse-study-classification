function SettingsPage() {
    return (
        <div className="flex flex-1">
            <div className="relative flex h-full w-full flex-1 flex-col gap-2 rounded-tl-2xl border border-neutral-200 bg-white p-2 md:p-8 dark:border-neutral-700 dark:bg-neutral-900">
                <div className="bg-base-100 h-full shadow rounded-lg">
                    <div className="p-7">
                        <h1 className="font-[DM_Sans] text-4xl">Settings </h1>
                        <form className="mt-10 flex flex-col gap-10">
                            <div>
                                <h1 className="font-[DM_Sans]">Basic Info</h1>
                                <div className="divider"></div>
                                <div className="flex flex-col gap-5">
                                    <fieldset className="fieldset">
                                        <div className="flex ">
                                            <legend className="fieldset-legend text-lg">First Name</legend>
                                            <input type="text" className="input ml-49" placeholder="Type here" />
                                        </div>
                                    </fieldset>
                                    <fieldset className="fieldset">
                                        <div className="flex ">
                                            <legend className="fieldset-legend text-lg">Last Name</legend>
                                            <input type="text" className="input ml-49" placeholder="Type here" />
                                        </div>
                                    </fieldset>
                                    <fieldset className="fieldset">
                                        <div className="flex ">
                                            <legend className="fieldset-legend text-lg">Email Address</legend>
                                            <input type="text" className="input ml-42" placeholder="Type here" />
                                        </div>
                                    </fieldset>
                                </div>
                            </div>

                            <div className="mt-5">
                                <h1 className="font-[DM_Sans]">Security</h1>
                                <div className="divider"></div>
                                <div className="flex flex-col gap-5">
                                    <fieldset className="fieldset">
                                        <div className="flex ">
                                            <legend className="fieldset-legend text-lg">Password</legend>
                                            <input type="password" className="input ml-50" placeholder="Type here" />
                                        </div>
                                    </fieldset>
                                    <fieldset className="fieldset">
                                        <div className="flex ">
                                            <legend className="fieldset-legend text-lg">Confirm Password</legend>
                                            <input type="password" className="input ml-32" placeholder="Type here" />
                                        </div>
                                    </fieldset>
                                </div>
                            </div>
                        </form>
                        <div className="flex justify-end">
                            <button className="btn btn-xl justify-self-end mr-5">Save Changes</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default SettingsPage