function NavBar() {
    return (
        <div className="fixed inset-0 w-full h-1/8 text-white">
            <div className="flex w-full mt-2">
                <h1 className="w-full self-center text-xl md:text-2xl font-[DM_Sans] lg:text-3xl font-semibold text-neutral-300 max-w-7xl z-20 py-3 ml-10">StudyLapse</h1>
                <div className="flex w-1/2">
                    <h1 className="w-full self-center text-xl md:text-2xl font-[DM_Sans] lg:text-3xl font-semibold text-neutral-300 max-w-7xl z-20 py-5 text-right">Pricing</h1>
                    <h1 className="w-full self-center text-xl md:text-2xl font-[DM_Sans] lg:text-3xl font-semibold text-neutral-300 max-w-7xl z-20 py-5 text-right mr-10">Contact Us</h1>
                </div>
            </div>
        </div>
    )
}

export default NavBar