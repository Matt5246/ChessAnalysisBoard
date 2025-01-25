"use client"

import * as React from "react"
import {
  BookOpen,
  Bot,
  Command,
  Frame,
  LifeBuoy,
  LucideIcon,
  Map,
  PieChart,
  Send,
  Settings2,
  SquareTerminal,
} from "lucide-react"
import { BiSolidChess as Chessboard } from "react-icons/bi";
import { NavMain } from "@/components/nav-main"
import { NavProjects } from "@/components/nav-projects"
import { NavSecondary } from "@/components/nav-secondary"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"


interface NavItem {
  title: string;
  url: string;
  icon: LucideIcon | any;
  isActive?: boolean;
  items?: { title: string; url: string }[];
}

const data: {
  user: { name: string; email: string; avatar: string };
  navMain: NavItem[];
  navSecondary: { title: string; url: string; icon: LucideIcon }[];
  projects: { name: string; url: string; icon: LucideIcon }[];
} = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  navMain: [
    {
      title: "Chess Analysis",
      url: "/analysis",
      icon: SquareTerminal,
      isActive: true,
      items: [
        {
          title: "History",
          url: "/analysis/history",
        },
        {
          title: "Starred/saved",
          url: "/analysis/starred",
        },
        {
          title: "Settings",
          url: "#",
        },
      ],
    },
    {
      title: "Position editor",
      url: "/position-editor",
      icon: Chessboard,
      items: [
        {
          title: "Editor",
          url: "#",
        },
        {
          title: "Export",
          url: "#",
        },
        {
          title: "Import",
          url: "#",
        },
      ],
    },
    {
      title: "Game evaluation",
      url: "#",
      icon: BookOpen,
      items: [
        {
          title: "Introduction",
          url: "#",
        },
        {
          title: "Get Started",
          url: "#",
        },
        {
          title: "Tutorials",
          url: "#",
        },
      ],
    },
    {
      title: "Settings",
      url: "#",
      icon: Settings2,
      items: [
        {
          title: "General",
          url: "#",
        },
        {
          title: "Board",
          url: "#",
        },
        {
          title: "Display",
          url: "#",
        },
        {
          title: "Page",
          url: "#",
        },
      ],
    },
  ],
  navSecondary: [
    {
      title: "Support",
      url: "#",
      icon: LifeBuoy,
    },
    {
      title: "Feedback",
      url: "#",
      icon: Send,
    },
  ],
  projects: [
    {
      name: "Page design",
      url: "#",
      icon: Frame,
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar variant="inset" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <a href="#">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                  <Command className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">Chess Analysis Inc</span>
                  <span className="truncate text-xs">Enterprise</span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavProjects projects={data.projects} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  )
}
