"use client";

import React, { useEffect, useId, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useOutsideClick } from "../../hooks/use-outside-click";
import createClerkSupabaseClient from "../../config/supabaseClient"
import { useUser } from "@clerk/clerk-react";

export default function VideoGrid() {
  const [videos, setVideos] = useState(null)
  const [timestamps, setTimestamps] = useState(null)
  const { user, isLoaded } = useUser()
  
  const supabase = createClerkSupabaseClient()
  const [active, setActive] = useState<video | boolean | null>(
    null
  );
  const [activeTimestamps, setActiveTimestamps] = useState<{absent_timestamps: number[], phone_timestamps: number[]} | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [editingClassName, setEditingClassName] = useState(false);
  const [classNameValue, setClassNameValue] = useState("");
  const videoRef = useRef<HTMLVideoElement>(null);
  const id = useId();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setActive(false);
      }
    }

    if (active && typeof active === "object") {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [active]);


  useEffect(() => {
      const fetchVideos = async () => {
        const { data, error } = await supabase
        .from("user_videos")
        .select()
        .eq("user_id", user?.id)

        if (data) {
          // .map() does NOT change the original array
          const asyncData = data.map(async (video) => {
            const urlPaths = {
              imgPath: `${user?.id}/${video.video_name}/${video.video_name}frame0.jpg`,
              vidPath: `${user?.id}/${video.video_name}`,
            }

            const response = await fetch("/api/media", {
              method: "POST",
              body: JSON.stringify(urlPaths),
              headers: {
                'Content-Type': "application/json",
              }
            })

            // use .json() when parsing the response for a fetch, JSON.parse() when parsing for a callback
            const urls = await response.json()
            return {stats: { ...urls, video_name: video.video_name, created_at: video.created_at.slice(0, 10), focus_rate: video.focus_percentage, absent_rate: video.absent_percentage, phone_rate: video.phone_percentage, class_name: video.class_name, duration: video.duration}, timestamps: {absent_timestamps: video.absent_timestamps, phone_timestamps: video.phone_timestamps}}
          })

          const payload = await Promise.all(asyncData)
          setVideos(payload.map(data => data.stats))
          setTimestamps(payload.map(data => data.timestamps))
        }
        
        if (error) {
          console.log(error)
        }
      }

      if (isLoaded) {
        fetchVideos()
      }

  }, [isLoaded, user])

  useEffect(() => {
    if (active && videos && timestamps) {
      const videoIndex = videos.findIndex(v => v.video_name == active.video_name)
      setActiveTimestamps(timestamps[videoIndex])
      setClassNameValue(classNameValue)
    }
  }, [active, videos, timestamps])

  const handleSaveClassName = async () => {
    if (active && typeof active === "object") {
      const { data, error } = await supabase
        .from("user_videos")
        .update({ class_name: classNameValue })
        .eq("user_id", user?.id)
        .eq("video_name", active.video_name)
      
      if (data) {
        console.log(data)
      }
      
      if (!error) {
        setVideos((prevVideos: any) => 
          prevVideos?.map((v: any) => 
            v.video_name === active.video_name 
              ? { ...v, class_name: classNameValue }
              : v
          )
        )
        setActive({ ...active, class_name: classNameValue })
        setEditingClassName(false)
      } else {
        console.error("Error updating class name:", error)
      }
    }
  }

  useOutsideClick(ref, () => setActive(null));

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime)
    }
  }

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration)
    }
  }

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (videoRef.current && duration) {
      const rect = e.currentTarget.getBoundingClientRect()
      const percent = (e.clientX - rect.left) / rect.width
      videoRef.current.currentTime = percent * duration
    }
  }

  const getHighlightSegments = () => {
    if (!duration || !activeTimestamps) return []
    
    const segments: Array<{start: number, end: number, type: 'absent' | 'phone'}> = []
    const range = 0.5
    
    const allTimestamps = [
      ...(activeTimestamps.absent_timestamps || []).map(ts => ({time: ts, type: 'absent' as const})),
      ...(activeTimestamps.phone_timestamps || []).map(ts => ({time: ts, type: 'phone' as const}))
    ].sort((a, b) => a.time - b.time)
    
    allTimestamps.forEach(({time, type}) => {
      const start = Math.max(0, time - range)
      const end = Math.min(duration, time + range)
      segments.push({start, end, type})
    })
    
    return segments
  }

  return (
    <>
      <AnimatePresence>
        {active && typeof active === "object" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/20 h-full w-full z-10"
          />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {active && typeof active === "object" ? (
          <div className="fixed inset-0 grid place-items-center z-[100]">
            <motion.button
              key={`button-${active.video_name}-${id}`}
              layout
              initial={{
                opacity: 0,
              }}
              animate={{
                opacity: 1,
              }}
              exit={{
                opacity: 0,
                transition: {
                  duration: 0.05,
                },
              }}
              className="flex absolute top-2 right-2 lg:hidden items-center justify-center bg-white rounded-full h-6 w-6"
              onClick={() => setActive(null)}
            >
              <CloseIcon />
            </motion.button>
            <motion.div
              layoutId={`card-${active.video_name}-${id}`}
              ref={ref}
              className="w-full max-w-[500px]  h-full md:h-fit md:max-h-[90%] flex flex-col bg-white dark:bg-neutral-900 sm:rounded-3xl overflow-hidden"
            >
              <motion.div layoutId={`image-${active.video_name}-${id}`} className="relative bg-black">
                <video
                  ref={videoRef}
                  src={active.vid}
                  className="w-full h-auto max-h-[500px] object-contain blur-xs"
                  onTimeUpdate={handleTimeUpdate}
                  onLoadedMetadata={handleLoadedMetadata}
                  controls
                />
                
                <div className="absolute bottom-0 left-0 right-0 h-2 bg-neutral-800/50">
                  <div 
                    className="relative h-full cursor-pointer"
                    onClick={handleProgressClick}
                  >

                    {getHighlightSegments().map((segment, idx) => (
                      <div
                        key={idx}
                        className={`absolute h-full ${
                          segment.type === 'absent' 
                            ? 'bg-red-500/60' 
                            : 'bg-yellow-500/60'
                        }`}
                        style={{
                          left: `${(segment.start / duration) * 100}%`,
                          width: `${((segment.end - segment.start) / duration) * 100}%`,
                        }}
                      />
                    ))}
                    
                    <div
                      className="absolute top-0 left-0 h-full bg-blue-500/80"
                      style={{ width: `${(currentTime / duration) * 100}%` }}
                    />
                  </div>
                </div>
              </motion.div>

              <div>
                <div className="flex justify-between items-start p-3">
                  <div className="">
                    <motion.h3
                      layoutId={`title-${active.video_name}-${id}`}
                      className="font-medium text-neutral-700 dark:text-neutral-200 text-base font-[DM_Sans]"
                    >
                      {active.video_name}
                    </motion.h3>
                    <motion.p
                      layoutId={`description-${active.created_at}-${id}`}
                      className="text-neutral-600 dark:text-neutral-400 text-base font-[DM_Sans]"
                    >
                      {active.created_at}
                    </motion.p>
                    <motion.p
                      layoutId={`description-${active.duration}-${id}`}
                      className="text-neutral-600 dark:text-neutral-400 text-base font-[DM_Sans]"
                    >
                      {active.duration * 100} minutes
                    </motion.p>
                  </div>

                  <div className="text-right">
                    {editingClassName ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={classNameValue}
                          onChange={(e) => setClassNameValue(e.target.value)}
                          placeholder="Enter class name"
                          className="pl-2  py-1.5 text-sm border border-neutral-300 rounded-lg focus:outline-none focus:border-[#6fc7ea] text-neutral-700 font-[DM_Sans]"
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              handleSaveClassName()
                            } else if (e.key === "Escape") {
                              setClassNameValue(classNameValue)
                              setEditingClassName(false)
                            }
                          }}
                          autoFocus
                        />
                        <button
                          onClick={handleSaveClassName}
                          className="px-3 py-1.5 text-sm bg-[#6fc7ea] text-white rounded-lg hover:bg-[#4f9ebd] transition-all font-[DM_Sans]"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => {
                            setClassNameValue(active.class_name || "")
                            setEditingClassName(false)
                          }}
                          className="px-3 py-1.5 text-sm bg-neutral-200 text-neutral-600 rounded-lg hover:bg-neutral-300 transition-all font-[DM_Sans]"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 justify-end">
                        <span className="text-sm text-neutral-500 font-[DM_Sans]">
                          {active.class_name || "Class not set"}
                        </span>
                        <button
                          onClick={() => setEditingClassName(true)}
                          className="text-xs text-[#6fc7ea] hover:text-[#4f9ebd] underline font-[DM_Sans]"
                        >
                          Edit
                        </button>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="px-4 pb-2 flex gap-4 text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-red-500/60 rounded"></div>
                    <span className="text-neutral-600 dark:text-neutral-400 font-[DM_Sans]">Absent</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-yellow-500/60 rounded"></div>
                    <span className="text-neutral-600 dark:text-neutral-400 font-[DM_Sans]">Phone</span>
                  </div>
                </div>
                <div className="pt-4 relative px-5">
                  <motion.div
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-neutral-600 text-xs md:text-sm lg:text-base h-40 md:h-fit pb-10 flex flex-col items-start gap-4 overflow-auto dark:text-neutral-400 [scrollbar-width:none] [-ms-overflow-style:none] [-webkit-overflow-scrolling:touch]"
                  >
                    {<div className="flex flex-col gap-5">
                        <div className="flex">
                          <div className="relative group cursor-pointer">
                            <svg xmlns="http://www.w3.org/2000/svg" width="51" height="51" viewBox="0 0 24 24"><g fill="currentColor" fill-rule="evenodd" clip-rule="evenodd"><path d="M23.986 11.795a16 16 0 0 0-.3-2.798a1.73 1.73 0 0 0-.45-.919a2 2 0 0 0-.769-.36a14 14 0 0 0-1.548-.23a1.33 1.33 0 0 1-.68-.21c-.11-.099-.11-.349-.14-.618a6.7 6.7 0 0 0-.28-1.52c-.096-.266-.27-.5-.499-.668a2.6 2.6 0 0 0-1.059-.41a15 15 0 0 0-2.328 0a.34.34 0 0 0-.34.33a.35.35 0 0 0 .34.35a19 19 0 0 1 1.899.06c.358.032.702.156.999.359c.18.13.22.41.27.7q.045.84.2 1.668c.047.17.132.327.249.46c.217.2.482.341.77.409c2.137.63 2.097 0 2.287.999c.161 1.038.234 2.087.22 3.137a12 12 0 0 1-.11 1.798c-.01.177-.055.35-.13.51c-.22.191-.498.3-.79.31a7.3 7.3 0 0 0-1.308.28a2.1 2.1 0 0 0-.7.369a1.3 1.3 0 0 0-.459.86c-.08.459 0 1.068-.07 1.578c0 .25-.07.48-.26.59c-.366.208-.77.343-1.188.399q-.996.114-1.999.1a.3.3 0 0 0 0 .6q1.066.06 2.128 0a4 4 0 0 0 1.46-.41c.285-.146.504-.396.609-.7a6.6 6.6 0 0 0 .22-1.648c0-.26 0-.49.18-.6a2.2 2.2 0 0 1 .998-.3q.652-.083 1.28-.28a1.67 1.67 0 0 0 .768-.509c.182-.26.305-.556.36-.869c.156-.93.213-1.875.17-2.817M6.502 19.368q-2.002.045-3.996-.15a1.84 1.84 0 0 1-1.199-.51s0-.15-.05-.27c-.06-.419-.09-1.068-.11-1.778v-6.634q0-1.059-.06-2.158a7 7 0 0 1 0-1.508a1.35 1.35 0 0 1 .29-.73a2 2 0 0 1 .9-.559c.6-.15 1.218-.217 1.837-.2l2.718-.08a.29.29 0 0 0 .3-.29a.29.29 0 0 0-.29-.3l-2.708-.07a7.3 7.3 0 0 0-2.078.12c-.51.12-.977.38-1.348.75c-.301.331-.505.74-.59 1.179a8 8 0 0 0-.11 1.718v5.355c0 .64.06 2.578.18 3.997c.011.659.136 1.311.37 1.928a2.6 2.6 0 0 0 1.858.84c1.36.079 2.725.079 4.086 0a.34.34 0 0 0 .34-.34a.34.34 0 0 0-.34-.31"/><path d="M18.501 10.326a1.61 1.61 0 0 0-1.199-.76a29 29 0 0 0-3.257-.439h-.49a4 4 0 0 1 0-.42c0-1.458.15-4.835.08-6.344a2.7 2.7 0 0 0-.12-.829c-.06-.13-.23-.39-.619-.12a5.5 5.5 0 0 0-.69.65C10.939 3.343 8.42 6.4 6.493 8.808a120 120 0 0 0-2.328 2.997q-.135.185-.24.39a.47.47 0 0 0 0 .519a.63.63 0 0 0 .3.22q.54.152 1.1.19c1.228.12 3.206.14 3.916.17v.359c0 1.728-.21 5.705-.3 7.523v.84a.67.67 0 0 0 .36.649a.6.6 0 0 0 .639-.14q.27-.255.51-.54a97 97 0 0 0 4.056-5.175a57 57 0 0 0 3.736-5.465c.197-.302.289-.66.26-1.019m-1.399 1.06c-1.408 2.227-5.115 6.993-6.993 9.19c0-1.098.12-2.607.17-3.996s.07-2.767 0-3.387q.021-.225 0-.45a.54.54 0 0 0-.33-.399a2.4 2.4 0 0 0-.68-.07c-.998 0-3.097 0-4.196-.14l.4-.569c1.589-2.208 5.245-6.994 6.994-8.902c.17-.19.32-.41.45-.58a.5.5 0 0 1 0 .12c.05 1.19-.14 3.887-.19 5.615q-.056.744 0 1.489a.6.6 0 0 0 .22.41c.204.11.428.177.659.2c.849.14 2.547.28 3.536.559q.184.07.34.19c-.07.18-.22.46-.38.72"/></g></svg>
                          </div>
                          <p className="font-[DM_Sans] self-center text-xl">: {active.focus_rate}%</p>
                          <p className="ml-5 opacity-40 font-[DM_Sans] self-center">you were focused/studying</p>
                        </div>
                        <div className="flex">
                          <div className="relative group cursor-pointer">
                            <svg xmlns="http://www.w3.org/2000/svg" width="51" height="51" viewBox="0 0 24 24"><g fill="currentColor" fill-rule="evenodd" clip-rule="evenodd"><path d="M4.43 6.493c.442.202.912.334 1.395.392q.417.045.833 0c.284-.039.564-.11.832-.211a3.35 3.35 0 0 0 1.796-2.067a3.52 3.52 0 0 0-.16-2.639a2.6 2.6 0 0 0-.492-.652a4.2 4.2 0 0 0-.913-.702C3.868-1.523 2.815 2.76 2.755 3.062a3.15 3.15 0 0 0 .481 2.468a2.9 2.9 0 0 0 1.194.963m-.812-3.28c0-.282.812-3.803 3.672-1.897q.319.211.592.482c.158.16.287.347.38.551c.241.606.241 1.28 0 1.887A2.27 2.27 0 0 1 7.02 5.6q-.257.107-.532.14q-.286.03-.572 0a3.7 3.7 0 0 1-1.073-.25a1.9 1.9 0 0 1-.833-.512a2.17 2.17 0 0 1-.391-1.766"/><path d="M15.848 9.192a5.27 5.27 0 0 0-2.127-1.956a8 8 0 0 0-1.003-.442a3.2 3.2 0 0 0-.833-.18a4.6 4.6 0 0 0-1.455.2c-1.003.291-1.906.823-2.81 1.094a5.7 5.7 0 0 1-1.243.19q-.652.054-1.305 0a2.6 2.6 0 0 1-.772-.22a10 10 0 0 1-1.204-.703a3.5 3.5 0 0 0-1.094-.551A1.58 1.58 0 0 0 1 6.744a1.645 1.645 0 0 0-.923 2.007a4.4 4.4 0 0 0 1.685 2.378c.783.505 1.68.805 2.609.873c.872.035 1.745-.039 2.599-.221q.113.152.2.32a.18.18 0 0 1 0 .201a.62.62 0 0 1-.34.201c-.322.11-.683.15-1.004.261a4.8 4.8 0 0 0-1.003.592A3.1 3.1 0 0 0 4 14.359a5.3 5.3 0 0 0-.582 2.438c.002.874.248 1.729.712 2.469a3.07 3.07 0 0 0 1.244 1.083c.375.167.788.226 1.194.17l.642-.2a1.3 1.3 0 0 0 .813-1.164a2.4 2.4 0 0 0-.23-1.003a8 8 0 0 1-.452-1.064a1.06 1.06 0 0 1 .11-.792a2.6 2.6 0 0 1 .672-.743q.316-.184.673-.26q.268-.06.541-.06c.263.825.616 1.62 1.054 2.367a8.5 8.5 0 0 0 1.786 2.247a2.1 2.1 0 0 0 1.876.442a1.32 1.32 0 0 0 .793-1.264a3.8 3.8 0 0 0-.281-1.595a16 16 0 0 0-.953-1.927c-.793-1.354-1.455-2.318-2.107-3.461a23 23 0 0 1-.703-1.335a1 1 0 0 1 1.004-.29c.73.27 1.41.663 2.006 1.163c.365.275.82.4 1.275.351a1.2 1.2 0 0 0 .792-.642a2.07 2.07 0 0 0-.03-2.097m-.692 1.696c-.08.16-.18.25-.301.25a1.2 1.2 0 0 1-.592-.21a7.8 7.8 0 0 0-2.298-1.164a1.585 1.585 0 0 0-1.756.682a.28.28 0 0 0 0 .281c.311.813.622 1.485.944 2.147c.471 1.004 1.003 1.897 1.545 3.09q.47.884.832 1.817c.15.352.225.73.221 1.113c0 .191-.05.301-.18.321a1.27 1.27 0 0 1-.753-.25a7.6 7.6 0 0 1-1.686-1.877c-.496-.716-.9-1.49-1.204-2.307a.33.33 0 0 0-.421-.221q-.392-.06-.783 0c-.35.047-.69.156-1.003.321a3.2 3.2 0 0 0-1.073 1.134c-.178.36-.234.768-.161 1.164c.07.471.431 1.103.512 1.655a.33.33 0 0 1-.211.371l-.301.09a1.12 1.12 0 0 1-.712-.18a1.95 1.95 0 0 1-.612-.602a3.6 3.6 0 0 1-.562-1.846a4.26 4.26 0 0 1 .35-2.007c.121-.27.3-.51.523-.702a3.7 3.7 0 0 1 .812-.532c.291-.15.713-.2 1.004-.371c.2-.094.374-.24.501-.421a.85.85 0 0 0 .15-.633a2.9 2.9 0 0 0-.51-.883a.33.33 0 0 0-.412-.01a.26.26 0 0 0-.15 0a9.3 9.3 0 0 1-2.469.13a4.9 4.9 0 0 1-2.207-.812A3.47 3.47 0 0 1 1.09 8.901c-.18-.481-.21-1.003.32-1.234a.6.6 0 0 1 .462 0q.331.12.622.321q.632.455 1.324.813c.347.172.72.287 1.104.341a9 9 0 0 0 1.495.07a6.4 6.4 0 0 0 1.515-.22c.913-.271 1.856-.813 2.82-1.104c.348-.119.714-.18 1.083-.18q.273.007.531.1q.471.157.924.36a4.13 4.13 0 0 1 1.755 1.486a1.21 1.21 0 0 1 .11 1.234m8.71.632q-.702-.433-1.445-.793a.76.76 0 0 0-.723.1a1.8 1.8 0 0 0-.501.823a3.9 3.9 0 0 0-.13 1.274q.051.231.16.442a1.23 1.23 0 0 1-.853-.17a3.7 3.7 0 0 1-.953-.653a2.1 2.1 0 0 1-.341-.481a1.4 1.4 0 0 0-.382-.362a1 1 0 0 0-1.173.14l-.392.322a4.8 4.8 0 0 0-1.214 3.401a5.57 5.57 0 0 0 1.134 3.381c.19.231.381.442.592.653l.22.2h-.09a1 1 0 0 0-.632 0a.86.86 0 0 0-.501.783a2.65 2.65 0 0 0 .692 2.097a4.14 4.14 0 0 0 2.73 1.304a.342.342 0 0 0 0-.682a3.4 3.4 0 0 1-1.937-.853a1.91 1.91 0 0 1-.713-1.726q.12-.008.241 0q.322.139.672.17a1.86 1.86 0 0 0 .943-.3a.62.62 0 0 0 .251-.542a.6.6 0 0 0-.17-.381a3.5 3.5 0 0 0-.512-.361a5 5 0 0 1-.542-.512a9 9 0 0 1-.491-.572a4.52 4.52 0 0 1-.843-2.709a3.73 3.73 0 0 1 .873-2.619l.19-.17h.05c0 .06.151.13.201.2q.152.213.351.382c.456.387.985.68 1.555.863a1.87 1.87 0 0 0 1.365 0a.64.64 0 0 0 .391-.602c0-.191-.15-.452-.17-.663a3.2 3.2 0 0 1 0-.852c.032-.225.118-.438.25-.623c.06.412 1.235.602 1.556.693a.3.3 0 0 0 .381-.2a.29.29 0 0 0-.09-.402m-2.72 2.007v-.12c0-.051.07.11 0 .1z"/></g></svg>
                          </div>
                          <p className="font-[DM_Sans] self-center text-xl">: {active.absent_rate}%</p>
                          <p className="ml-5 opacity-40 font-[DM_Sans] self-center">you were outside of your study area</p>
                        </div>
                        <div className="flex">
                          <div className="relative group cursor-pointer">
                            <svg xmlns="http://www.w3.org/2000/svg" width="51" height="51" viewBox="0 0 24 24"><path fill="currentColor" d="M7.258 16.494c.33.08.673.08 1.003 0c.37-.082.698-.296.923-.602a1.53 1.53 0 0 0 .13-1.425a1.645 1.645 0 0 0-1.846-1.003c-.27.04-.524.154-.732.33a1.74 1.74 0 0 0-.602 1.415a1.415 1.415 0 0 0 1.124 1.285m.14-2.067a.7.7 0 0 1 .371-.25a.68.68 0 0 1 .773.571a.57.57 0 0 1-.13.532a.6.6 0 0 1-.362.12a1 1 0 0 1-.471 0a.42.42 0 0 1-.341-.421a.92.92 0 0 1 .16-.552m4.184-9.441l1.605-.712a66 66 0 0 1 2.288-1.004c.481-.682.27-1.003-1.164-.531c-.522.17-1.004.35-1.545.541c-.542.191-1.104.432-1.646.663q-.815.345-1.615.752l-.371.21C7.268 6.15 7.278 6.512 8.32 6.392l1.696-.733z"/><path fill="currentColor" d="M22.056 6.38a13 13 0 0 0-.582-2.478a3.8 3.8 0 0 0-.562-.772a3.1 3.1 0 0 0-1.003-.602L17.1 1.434c-.591-.22-1.163-.461-1.745-.612S14.19.462 13.598.301c-.35-.09-.702-.211-1.073-.271a3 3 0 0 0-.843 0a2.66 2.66 0 0 0-1.274.551a7.4 7.4 0 0 0-1.284 1.224a33 33 0 0 0-1.897 2.609a41 41 0 0 0-1.665 2.76c-.793 1.444-1.696 3.009-2.398 4.614c-.411.933-1.174 3.13-1.174 3.16c0 .693-.15 1.616-.13 2.479a4.2 4.2 0 0 0 .371 1.746c.244.449.587.837 1.003 1.133q.848.59 1.766 1.064a31 31 0 0 0 3.291 1.675c.77.34 1.574.599 2.398.773a6.8 6.8 0 0 0 1.706.18a3.2 3.2 0 0 0 1.224-.29a6.1 6.1 0 0 0 2.086-1.666c.739-1 1.409-2.05 2.007-3.14a41 41 0 0 0 1.886-3.492a40 40 0 0 0 1.515-3.662c.21-.592.522-1.234.722-1.866a5 5 0 0 0 .221-.883a10 10 0 0 0 0-2.618M6.274 7.575c.1-.17 3.01-4.404 3.612-5.136a6.4 6.4 0 0 1 1.134-1.074c.22-.175.484-.29.763-.331q.278-.013.551.05c.331.07 7.114 2.508 7.114 2.508q.307.118.582.301a.44.44 0 0 1 .18.311a5.85 5.85 0 0 1-.461 2.579l-.271.632a75 75 0 0 1-1.094 2.428A37 37 0 0 1 17.17 12.2c-.642 1.133-1.264 2.267-1.916 3.39q-.06.088-.11.181a21 21 0 0 0-2.78-1.846a23 23 0 0 0-1.685-.893a41 41 0 0 0-1.666-.752l-3.16-1.274a10 10 0 0 0-1.395-.301c.592-1.054 1.234-2.127 1.816-3.13M3.786 12.07c.12-.25.251-.501.381-.752a8.2 8.2 0 0 1 1.746.602c.893.401 1.746.913 2.559 1.344c.812.432 1.545.753 2.387 1.124s1.586.702 2.348 1.104q.796.417 1.545.913q-.42.69-.873 1.364q-.42.704-.933 1.344c-.186.23-.433.404-.712.502a1.2 1.2 0 0 1-.381 0a6 6 0 0 1-.743-.14c-.461-.1-.903-.211-1.334-.342a9.4 9.4 0 0 1-1.274-.481c-.422-.2-.843-.421-1.254-.652a16 16 0 0 1-1.194-.753c-.673-.461-1.525-.903-2.258-1.435q-.51-.426-1.063-.792a15.3 15.3 0 0 1 1.053-2.95m17.478-3.23q-.09.517-.291 1.003c-.211.542-.482 1.073-.673 1.575a39 39 0 0 1-1.595 3.522a43 43 0 0 1-1.916 3.35a28 28 0 0 1-2.007 3.01a5 5 0 0 1-1.655 1.405a2.3 2.3 0 0 1-1.003.22a9 9 0 0 1-1.214-.15a11.6 11.6 0 0 1-2.218-.632a31 31 0 0 1-3.22-1.545a14 14 0 0 1-1.726-.933a2.7 2.7 0 0 1-.813-.833a3.5 3.5 0 0 1-.34-1.424q-.046-.838 0-1.676q.357.377.772.692c.722.542 1.575 1.004 2.237 1.485q.602.421 1.234.813c.432.25.863.492 1.304.712q.664.324 1.365.552q.692.226 1.405.381q.42.115.852.181c.239.024.48.007.713-.05a2.5 2.5 0 0 0 1.144-.743q.552-.676 1.003-1.424a31 31 0 0 0 1.445-2.208c.682-1.103 1.324-2.237 2.006-3.37a21 21 0 0 0 1.003-1.917c.492-1.003.943-2.006 1.375-2.95q.408-.894.692-1.836c0 .14 0 .281.07.432a9 9 0 0 1 .05 2.358"/><path fill="currentColor" d="M11.592 7.996a40 40 0 0 0-1.595.812c-.984.532-1.987 1.104-2.89 1.706c-.532.552-.542.833.903.341c.27-.13.532-.28.813-.411c.933-.431 1.886-.813 2.829-1.214s1.896-.823 2.85-1.234c1.213-.562 2.437-1.134 3.671-1.666c.281-.12.572-.22.853-.33c1.204-.743.753-1.124 0-.854c-.391.12-.792.221-1.184.362a180 180 0 0 0-3.812 1.485c-.793.3-1.626.642-2.438 1.003"/></svg>
                          </div>
                          <p className="font-[DM_Sans] self-center text-xl">: {active.phone_rate}%</p>
                          <p className="ml-5 opacity-40 font-[DM_Sans] self-center">you were using an external device</p>
                        </div>
                      </div>}
                  </motion.div>
                </div>
              </div>
            </motion.div>
          </div>
        ) : null}
      </AnimatePresence>
      <div className="flex flex-col overflow-auto shadow rounded-md">
        <ul className="max-w-5xl mx-auto w-full grid grid-cols-4 md:grid-cols-4 items-start gap-4">
          {videos && videos.map((video, index) => (
            <motion.div
              layoutId={`card-${video.video_name}-${id}`}
              key={index}
              onClick={() => setActive(video)}
              className="p-4 flex flex-col hover:bg-neutral-50 dark:hover:bg-neutral-800 rounded-xl cursor-pointer"
            >
              <div className="flex gap-4 flex-col  w-full">
                <motion.div layoutId={`image-${video.video_name}-${id}`}>
                  {video.img && <img
                    width={100}
                    height={100}
                    src={video.img}
                    alt={video.video_name}
                    className="h-30 w-full  rounded-lg object-cover object-top"
                  />}
                </motion.div>
                <div className="flex justify-center items-center flex-col">
                  <motion.h3
                    layoutId={`title-${video.video_name}-${id}`}
                    className="font-medium text-neutral-800 dark:text-neutral-200 text-center md:text-left text-base font-[DM_Sans]"
                  >
                    {video.video_name}
                  </motion.h3>
                  <motion.p
                    layoutId={`description-${video.created_at}-${id}`}
                    className="text-neutral-600 dark:text-neutral-400 text-center md:text-left text-base font-[DM_Sans]"
                  >
                    {video.created_at}
                  </motion.p>
                </div>
              </div>
            </motion.div>
          ))}
        </ul>
      </div>
    </>
  );
}

export const CloseIcon = () => {
  return (
    <motion.svg
      initial={{
        opacity: 0,
      }}
      animate={{
        opacity: 1,
      }}
      exit={{
        opacity: 0,
        transition: {
          duration: 0.05,
        },
      }}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4 text-black"
    >
      <path stroke="none" d="M0 0h24v24H0z" fill="none" />
      <path d="M18 6l-12 12" />
      <path d="M6 6l12 12" />
    </motion.svg>
  );
};

interface video {
  video_name: string,
  created_at: string,
  duration: number,
  img: string,
  vid: string,
  focus_rate: number,
  absent_rate: number,
  phone_rate: number,
  class_name?: string
}
