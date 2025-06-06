"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, User, Book, Award, Bell, MessageSquare, MinusCircle, Gift, CreditCard, Crown, Trophy } from "lucide-react"
import { cn } from "@/lib/utils"
import { Sheet, SheetTrigger, SheetContent } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { ROLES } from "@/lib/constants"

interface MobileNavigationProps {
  userRole?: string
}

export function MobileNavigation({ userRole = "student" }: MobileNavigationProps) {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  
  // Reorder routes to prioritize important items
  const routes = [
    {
      href: `/${userRole}`,
      label: "الرئيسية",
      icon: Home,
      active: pathname === `/${userRole}`,
      roles: ["student", "teacher", "parent", "admin"]
    },
    // Move negative points to be in the main navigation for students
    {
      href: "/student/negative-points",
      label: "النقاط السلبية",
      icon: MinusCircle,
      active: pathname === "/student/negative-points",
      roles: ["student"],
      priority: true // Mark as priority
    },
    {
      href: "/student/rewards",
      label: "المكافآت",
      icon: Gift,
      active: pathname === "/student/rewards",
      roles: ["student"],
      priority: true // Mark as priority
    },
    {
      href: "/profile",
      label: "الملف الشخصي",
      icon: User,
      active: pathname === "/profile",
      roles: ["student", "teacher", "parent", "admin"]
    },
    {
      href: "/notifications",
      label: "الإشعارات",
      icon: Bell,
      active: pathname === "/notifications",
      roles: ["student", "teacher", "parent", "admin"]
    },
    {
      href: "/messages",
      label: "الرسائل",
      icon: MessageSquare,
      active: pathname === "/messages",
      roles: ["student", "teacher", "parent", "admin"]
    },
    {
      href: "/student/badges",
      label: "الشارات",
      icon: Award,
      active: pathname === "/student/badges",
      roles: ["student"]
    },
    {
      href: "/student/statement",
      label: "كشف الحساب",
      icon: Book,
      active: pathname === "/student/statement",
      roles: ["student"]
    },
    {
      href: "/student/attendance",
      label: "الحضور",
      icon: Book,
      active: pathname === "/student/attendance",
      roles: ["student"]
    },
    {
      href: "/parent/children",
      label: "الأبناء",
      icon: User,
      active: pathname.includes("/parent/children"),
      roles: ["parent"]
    },
    {
      href: "/parent/attendance",
      label: "الحضور",
      icon: Book,
      active: pathname === "/parent/attendance",
      roles: ["parent"]
    },
    {
      href: "/parent/rewards",
      label: "المكافآت",
      icon: Gift,
      active: pathname === "/parent/rewards",
      roles: ["parent"]
    },
    {
      href: "/parent/recharge",
      label: "شحن الرصيد",
      icon: CreditCard,
      active: pathname === "/parent/recharge",
      roles: ["parent"]
    },
    {
      href: "/parent/my-cards",
      label: "كروت الشحن",
      icon: CreditCard,
      active: pathname === "/parent/my-cards",
      roles: ["parent"]
    },
    {
      href: "/teacher/attendance",
      label: "تسجيل الحضور",
      icon: Book,
      active: pathname.includes("/teacher/attendance"),
      roles: ["teacher"]
    },
    {
      href: "/teacher/rewards",
      label: "المكافآت",
      icon: Gift,
      active: pathname === "/teacher/rewards",
      roles: ["teacher"]
    },
    {
      href: "/teacher/recharge",
      label: "شحن الرصيد",
      icon: CreditCard,
      active: pathname === "/teacher/recharge",
      roles: ["teacher"]
    },
    {
      href: "/teacher/my-cards",
      label: "كروت الشحن",
      icon: CreditCard,
      active: pathname === "/teacher/my-cards",
      roles: ["teacher"]
    },
    {
      href: "/admin/points-categories",
      label: "فئات النقاط",
      icon: Award,
      active: pathname === "/admin/points-categories",
      roles: ["admin"]
    },
    {
      href: "/admin/cards",
      label: "بطاقات الشحن",
      icon: CreditCard,
      active: pathname === "/admin/cards",
      roles: ["admin"]
    },
    {
      href: "/admin/classes",
      label: "الصفوف",
      icon: Book,
      active: pathname === "/admin/classes",
      roles: ["admin"]
    },
    {
      href: "/admin/emblems",
      label: "الشارات المميزة",
      icon: Crown,
      active: pathname === "/admin/emblems",
      roles: ["admin"]
    },
    {
      href: "/admin/tiers",
      label: "إدارة الطبقات",
      icon: Trophy,
      active: pathname === "/admin/tiers",
      roles: ["admin"]
    },
    {
      href: "/admin/reports",
      label: "التقارير",
      icon: Book,
      active: pathname === "/admin/reports",
      roles: ["admin"]
    }
  ]
  
  // Filter routes relevant to the current user role
  const filteredRoutes = routes.filter(route => route.roles.includes(userRole))
  
  // Extract priority routes first for bottom bar (if student)
  const priorityRoutes = filteredRoutes.filter(route => route.priority === true)
  const bottomNavRoutes = [...filteredRoutes.slice(0, 1), ...priorityRoutes, ...filteredRoutes.slice(1)].slice(0, 4)
  const sheetRoutes = filteredRoutes.filter(route => !bottomNavRoutes.includes(route))
  
  // Log for debugging
  console.log("Mobile nav routes for user role:", userRole)
  console.log("Bottom nav routes:", bottomNavRoutes.map(r => r.label))
  
  return (
    <>
      {/* Bottom Navigation Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-50 flex h-16 bg-background border-t md:hidden">
        <div className="flex items-center justify-around w-full">
          {bottomNavRoutes.map((route) => (
            <Link
              key={route.href}
              href={route.href}
              className={cn(
                "flex flex-col items-center justify-center flex-1 h-full p-1 text-muted-foreground transition-colors",
                route.active && "text-primary"
              )}
            >
              <route.icon className="w-5 h-5" />
              <span className="text-xs mt-1">{route.label}</span>
            </Link>
          ))}
          
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="flex-1 h-full rounded-none">
                <span className="sr-only">فتح القائمة</span>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                  <line x1="4" x2="20" y1="12" y2="12" />
                  <line x1="4" x2="20" y1="6" y2="6" />
                  <line x1="4" x2="20" y1="18" y2="18" />
                </svg>
                <span className="text-xs mt-1">المزيد</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="bottom" className="h-[70vh]">
              <div className="grid grid-cols-3 gap-4 pt-6">
                {sheetRoutes.map((route) => (
                  <Link
                    key={route.href}
                    href={route.href}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "flex flex-col items-center justify-center p-3 rounded-lg text-muted-foreground transition-colors",
                      route.active && "text-primary"
                    )}
                  >
                    <route.icon className="w-6 h-6 mb-1" />
                    <span className="text-xs text-center">{route.label}</span>
                  </Link>
                ))}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </>
  )
}
