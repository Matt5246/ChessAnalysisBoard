'use client'

import { AppSidebar } from '@/components/app-sidebar'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { Separator } from '@/components/ui/separator'
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar'
import { usePathname } from 'next/navigation'
import { ReactNode, useEffect, useState } from 'react'
import Link from 'next/link'
import React from 'react'
import { GameProvider } from '@/context/GameContext'

interface PageProps {
  children: ReactNode
}

export default function Page({ children }: PageProps) {
  const path = usePathname()
  const pathSegments = path.split('/').filter(segment => segment)
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                {pathSegments.map((segment, index) => {
                  const href = '/' + pathSegments.slice(0, index + 1).join('/')
                  const isLast = index === pathSegments.length - 1
                  return (
                    <React.Fragment key={href}>
                      <BreadcrumbItem>
                        <BreadcrumbLink asChild>
                          <Link href={href}>
                            {segment.charAt(0).toUpperCase() + segment.slice(1)}
                          </Link>
                        </BreadcrumbLink>
                      </BreadcrumbItem>
                      {!isLast && <BreadcrumbSeparator />}
                    </React.Fragment>
                  )
                })}
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        <div className="p-5"><GameProvider>{children}</GameProvider></div>
      </SidebarInset>
    </SidebarProvider>
  )
}
