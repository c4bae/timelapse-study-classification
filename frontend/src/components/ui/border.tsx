
function Border() {
    return (
        <div className="relative">
            <div className="fixed inset-0 border-10 border-neutral-900 pointer-events-none z-50"></div>
            <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[200px] h-[55px] rounded-b-xl bg-neutral-900 z-[51]"></div>
        </div>
    )
}

export default Border