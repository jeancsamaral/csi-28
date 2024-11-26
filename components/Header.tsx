"use client"

import Link from "next/link"
import {
  CircleUser,
  Menu,
  Package2,
  Book,
  Activity,
  Calendar,
  List,
  FileText,
  User,
  HelpCircle,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { ModeToggle } from "./ModeToggle"
import { navLinks } from "@/constants/constants"
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu"
import * as React from "react"
import { cn } from "@/lib/utils"
import Image from "next/image"
import logobranca from "@/assets/images/inoa-logo-white.png"
import logodark from "@/assets/images/inoa-logo.png"
import { ParagraphCN } from "./ParagraphCN"
import brasil from "@/assets/brasil.png"
import { useTheme } from "next-themes"
import { getAuth, signOut } from "firebase/auth"
import { app } from "@/firebase"
import { useRouter } from "next/navigation"


export default function Header() {
  const { theme, setTheme } = useTheme()
  const router = useRouter()
  const studyLinks = navLinks.filter((link) => ["Aulas", "Questões", "Provas"].includes(link.label))
  // const otherLinks = navLinks.filter((link) => !["Aulas", "Questões", "Provas"].includes(link.label))
  const otherLinks = navLinks

  const handleLogout = async () => {
    try {
      const auth = getAuth(app)
      await signOut(auth)
      router.push('/login')
    } catch (error) {
      console.error('Error logging out:', error)
    }
  }

  return (
    <header className="sticky top-0 flex h-20 items-center gap-4 border-b bg-background px-4 md:px-6 z-40">
      <div className="flex w-full items-center justify-between">
        <nav className="hidden flex-col gap-6 text-lg font-medium md:flex md:flex-row md:items-center md:gap-5 md:text-sm lg:gap-6">
          <Link href="/" className="flex items-center gap-2 text-lg font-semibold md:text-base mr-4 justify-center">
            <Image src={theme === "dark" ? logobranca : logodark}
              alt="Atomize Logo"
              className="h-10 w-20 mb-2" />
            <span className="sr-only">Atomize LOGO</span>
          </Link>
          {otherLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className={`${link.className} transition-colors hover:text-foreground flex flex-col mt-3 mb-3 items-center gap-2`}
            >
              <link.icon className="h-5 w-5" />
              {link.label}
            </Link>
          ))}
        </nav>
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="shrink-0 md:hidden">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Menu de navegação</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left">
            <nav className="grid gap-6 text-lg font-medium">
              <Link href="#" className="flex items-center gap-2 text-lg font-semibold">
                <Package2 className="h-6 w-6" />
                <span className="sr-only">Atomize</span>
              </Link>
              {navLinks.map((link) => (
                <Link key={link.label} href={link.href} className={`hover:text-foreground ${link.className} flex items-center gap-2`}>
                  <link.icon className="h-5 w-5" />
                  {link.label}
                </Link>
              ))}
            </nav>
          </SheetContent>
        </Sheet>
        <div className="flex items-center gap-4 md:ml-auto md:gap-2 lg:gap-4">

          <ModeToggle />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="secondary" size="icon" className="rounded-full">
                <CircleUser className="h-5 w-5" />
                <span className="sr-only">Menu do usuário</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Minha conta</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Configurações</DropdownMenuItem>
              <DropdownMenuItem>Suporte</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>
                Sair
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}

const ListItem = React.forwardRef<
  React.ElementRef<"a">,
  React.ComponentPropsWithoutRef<"a">
>(({ className, title, children, ...props }, ref) => {
  return (
    <li>
      <NavigationMenuLink asChild>
        <a
          ref={ref}
          className={cn(
            "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
            className
          )}
          {...props}
        >
          <div className="text-sm font-medium leading-none">{title}</div>
          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">{children}</p>
        </a>
      </NavigationMenuLink>
    </li>
  )
})
ListItem.displayName = "ListItem"
