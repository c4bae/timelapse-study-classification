"use client";
import React, { useState } from "react";
import { Sidebar, SidebarBody, SidebarLink } from "./components/ui/sidebar";
import accicon from "./assets/accicon.png"
import {
  IconArrowLeft,
  IconBrandTabler,
  IconSettings,
  IconUserBolt,
  IconVideo,
} from "@tabler/icons-react";
import StreamlineFreehandCameraModePhoto from './components/StreamlineFreehandCameraModePhoto'
import { cn } from "./lib/utils";
import UserStats from "./components/UserStats";
import List from "./components/List";
import BarGraph from "./components/BarGraph";
import VideosPage from "./components/Videos"
 
export function Dashboard() {
  const links = [
    {
      label: "Dashboard",
      href: "#",
      icon: (
        <IconBrandTabler className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" />
      ),
    },
    {
      label: "Videos",
      href: "#",
      icon: (
        <IconVideo className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" />
      ),
    },
    {
      label: "Settings",
      href: "#",
      icon: (
        <IconSettings className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" />
      ),
    },
    {
      label: "Logout",
      href: "",
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
        "h-full", // for your use case, use `h-screen` instead of `h-[60vh]`
      )}
    >
      <Sidebar open={open} setOpen={setOpen} animate={false}>
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
            <SidebarLink
              className="font-[DM_Sans] font-bold"
              link={{
                label: "Manu Arora",
                href: "#",
                icon: (
                  <img
                    src={accicon}
                    className="h-7 w-7 shrink-0 rounded-full"
                    width={50}
                    height={50}
                    alt="Avatar"
                  />
                ),
              }}
            />
          </div>
        </SidebarBody>
      </Sidebar>
      {/* <DashboardSection /> */}
      <VideosPage></VideosPage>
    </div>
  );
}
export const Logo = () => {
  return (
    <a
      href="#"
      className="relative z-20 flex items-center space-x-2 py-1 text-sm font-normal text-black"
    >
      <StreamlineFreehandCameraModePhoto className="h-10 w-10 shrink-0 stroke-black"></StreamlineFreehandCameraModePhoto>
      <div className="font-bold text-3xl font-[DM_Sans] whitespace-pre text-black dark:text-white">StudyLapse</div>
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
  return (
    <div className="flex flex-1">
      <div className="relative flex h-full w-full flex-1 flex-col gap-2 rounded-tl-2xl border border-neutral-200 bg-white p-2 md:p-8 dark:border-neutral-700 dark:bg-neutral-900">
        <div className="relative flex flex-col gap-3">
          <div className="flex-2">
            <BarGraph />
          </div>
          <div className="flex gap-3">
            <UserStats />
            <div className="flex-2">
              <List />
            </div>
          </div>
        </div>
        <div className="flex flex-1 pt-1">
            <div className="py-2 h-full w-full rounded-lg bg-base-100 dark:bg-neutral-800 shadow flex justify-center align-center font-[DM_Sans]">
              <p className="self-center text-center opacity-40">The truth is you don't have to be special. You just have to be what most people aren't: consistent. - Tom Brady</p>
            </div>
        </div>
      </div>
    </div>
  );
};
