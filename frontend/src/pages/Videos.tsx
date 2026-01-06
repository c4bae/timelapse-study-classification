import VideoGrid from "../components/ui/videos-grid"
import DropZonePage from "../components/Dropzone"

function VideosPage() {
    return (
        <div className="flex flex-1">
            <div className="relative flex h-full w-full flex-1 flex-col gap-2 rounded-tl-2xl border border-neutral-200 bg-white p-2 md:p-8 dark:border-neutral-700 dark:bg-neutral-900">
                <h1 className="mx-auto text-3xl font-semibold text-neutral-800 font-[DM_Sans]">Your Study Videos</h1>
                <div className="flex w-full flex-col">
                <div className="divider"></div>
                <DropZonePage />
                </div>
                <VideoGrid></VideoGrid>
            </div>
        </div>
    )
}

export default VideosPage