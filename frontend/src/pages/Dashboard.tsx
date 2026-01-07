"use client";
import React, { useState } from "react";
import { Sidebar, SidebarBody, SidebarLink } from "../components/ui/sidebar";
import accicon from "../assets/accicon.png";
import {
  IconArrowLeft,
  IconBrandTabler,
  IconSettings,
  IconVideo,
  IconPencil,
} from "@tabler/icons-react";
import StreamlineFreehandCameraModePhoto from '../components/ui/cameraIcon'
import { cn } from "../lib/utils";
import UserStats from "../components/UserStats";
import List from "../components/List";
import BarGraph from "../components/BarGraph";
import VideosPage from "./Videos"
import { Routes, Route } from "react-router";
import SettingsPage from "./Settings"; 
import { useUser } from "@clerk/clerk-react";
import ProtectedRoute from "../components/ProtectedRoute";
import ExamsPage from "./Exams";
import { useClerk } from "@clerk/clerk-react";
import { motion } from "framer-motion";
import NoPage from "./NoPage";

export function Dashboard() {
  const { user, isLoaded, isSignedIn} = useUser()
  const clerk = useClerk()

  const links = [
    {
      label: "Dashboard",
      href: "/dashboard",
      icon: (
        <IconBrandTabler className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" />
      ),
    },
    {
      label: "Videos",
      href: "/dashboard/videos",
      icon: (
        <IconVideo className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" />
      ),
    },
    {
      label: "Exams",
      href: "/dashboard/exams",
      icon: (
        <IconPencil className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" />
      ),
    },
    {
      label: "Settings",
      href: "/dashboard/settings",
      icon: (
        <IconSettings className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" />
      ),
    },
    {
      label: "Logout",
      href: "/",
      icon: (
        <IconArrowLeft className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" />
      ),
    },
  ];
  const [open, setOpen] = useState(false);

  return (
    <div
      className={cn(
        "mx-auto flex w-full flex-1 flex-col overflow-hidden rounded-md border border-neutral-200 bg-gray-100 md:flex-row dark:border-neutral-700 dark:bg-neutral-800",
        "h-full",
      )}
    >
      <Sidebar open={open} setOpen={setOpen} animate={true}>
        <SidebarBody className="justify-between gap-10 pl-5 bg-base-100">
          <div className="flex flex-1 flex-col overflow-x-hidden overflow-y-auto">
            <Logo />
            <div className="mt-8 flex flex-col gap-2">
              {links.map((link, idx) => (
                <SidebarLink key={idx} link={link} />
              ))}
            </div>
          </div>
          <div>
            { isLoaded && isSignedIn && <SidebarLink
              className="font-[DM_Sans] font-bold"
              link={{
                label: user!.fullName,
                href: "/dashboard/settings",
                icon: (
                  <img
                    src={accicon}
                    className="h-6 w-7 shrink-0 rounded-full"
                    width={50}
                    height={50}
                    alt="Avatar"
                  />
                ),
              }}
            />}
          </div>
        </SidebarBody>
      </Sidebar>

      <ProtectedRoute>
        <Routes>
            <Route index element={<DashboardSection />}></Route>
            <Route path="videos" element={<VideosPage />}></Route>
            <Route path="settings" element={<SettingsPage />}></Route>
            <Route path="exams" element={<ExamsPage />}></Route>
            <Route path="*" element={<NoPage />}></Route>
        </Routes>
      </ProtectedRoute>
    </div>
  );
}
export const Logo = () => {
  return (
    <a
      href="/dashboard"
      className="relative z-20 flex items-center space-x-2 py-1 text-sm font-normal text-black"
    >
      <StreamlineFreehandCameraModePhoto className="h-5 w-5 shrink-0 stroke-neutral-800"></StreamlineFreehandCameraModePhoto>
      <div className="font-bold text-2xl font-[DM_Sans] whitespace-pre text-neutral-700 dark:text-white">StudyLapse</div>
    </a>
  );
};
export const LogoIcon = () => {
  return (
    <a
      href="#"
      className="relative z-20 flex items-center space-x-2 py-1 text-sm font-normal text-black"
    >
      <div className="h-5 w-6 shrink-0 rounded-tl-lg rounded-tr-sm rounded-br-lg rounded-bl-sm bg-black dark:bg-white" />
    </a>
  );
};
 
// Dummy dashboard component with content
const DashboardSection = () => {
  const { user, isLoaded } = useUser();

  const containerVariants = {
    hidden: { opacity: 1 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { 
      opacity: 1, 
      y: 0, 
      transition: { duration: 0.5, ease: "easeOut" } 
    },
  };

  return (
    <motion.div 
      className="flex flex-1"
      variants={containerVariants}
      initial="hidden"
      animate="show"
    >
      <div className="relative flex h-full w-full flex-1 flex-col gap-2 rounded-tl-2xl border border-neutral-200 bg-white p-2 md:p-8 dark:border-neutral-700 dark:bg-neutral-900">
        
        <div className="relative flex flex-col gap-3">
          <motion.div variants={itemVariants} className="flex-2">
            {isLoaded ? <BarGraph fullName={user!.fullName} /> : <BarGraph fullName="..." />}
          </motion.div>

          <motion.div variants={itemVariants} className="flex gap-3">
            <UserStats />
            <div className="flex-2">
              <List />
            </div>
          </motion.div>
        </div>

        <motion.div variants={itemVariants} className="flex flex-1 pt-1">
          <div className="py-2 h-full w-full rounded-lg bg-base-100 dark:bg-neutral-800 shadow flex justify-center align-center font-[DM_Sans]">
            <p className="self-center text-center opacity-40">
              The truth is you don't have to be special. You just have to be what most people aren't: consistent. - Tom Brady
            </p>
          </div>
        </motion.div>

      </div>
    </motion.div>
  );
};
