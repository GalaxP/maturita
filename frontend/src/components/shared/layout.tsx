import { useContext, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom"
import AuthContext from "../../contexts/AuthContext";
import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar"
import { Button } from "../ui/button"
import GetAvatar from "helpers/getAvatar";
import LocaleSwitcher from "components/localeSwitcher";
import LocalizationContext from "contexts/LocalizationContext";
import { Input } from "../ui/input";
import { MagnifyingGlassIcon, PersonIcon } from "@radix-ui/react-icons";
import { Menu, MoreVertical, Pencil, PlusCircle, Search, SearchIcon, User, User2, UserCircle2, Users } from "lucide-react";
import { SearchBox } from "components/searchBox";
import { CookieConsent } from "components/cookieConsent";
import { UserNav } from "components/userNav";
import { NewsLetter } from "components/newsLetter";
import { Drawer,
    DrawerClose,
    DrawerContent,
    DrawerDescription,
    DrawerFooter,
    DrawerHeader,
    DrawerTitle,
    DrawerTrigger, } from "components/ui/drawer";
import { HiOutlineUserGroup } from "react-icons/hi";
import { Sheet, SheetClose, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "components/ui/sheet";
import { Command } from "components/ui/command";
import { ModeToggle } from "components/ui/modeToggle";
type LayoutProps = {
    children: React.ReactNode
    openNewsletter: boolean;
}

const excludedFromLayout: string[] = []

const Layout = ({children, openNewsletter}: LayoutProps) => {
    const auth = useContext(AuthContext);
    const [loaded, setLoaded] = useState(false)
    const localeContext = useContext(LocalizationContext)
    const [searchQuery, setSearchQuery] = useState("")
    const [isSearchOpen, setIsSearchOpen] = useState(false)

    useEffect(()=>{

    }, [openNewsletter])

    const navigate = useNavigate();
    return <div>
        <header className="sticky top-0 z-50 w-full border-b px-2 bg-background">
            <div className="h-full py-2 flex justify-between">
                <div className="flex flex-grow mr-2 items-center">
                    <Sheet>
                        <SheetTrigger asChild>            
                            <Button variant={"ghost_round"} className="p-1 sm:hidden mx-1 w-10 h-10">
                                <Menu className="w-5 h-5"/>
                            </Button> 
                        </SheetTrigger>
                        <SheetContent className="px-0 py-6" side={"left"}>
                            <SheetClose className="mt-3 justify-start" asChild>
                                <Button className="w-full" variant={"ghost"} onClick={()=>setIsSearchOpen(true)}>
                                    <Search className="mr-2"/>
                                    {localeContext.localize("SEARCH")}
                                </Button>
                            </SheetClose>
                            <SheetClose className="mt-1 justify-start" asChild>
                                <Button className="w-full" variant={"ghost"} onClick={()=>navigate('/submit')}>
                                    <PlusCircle className="mr-2"/>
                                    {localeContext.localize("CREATE")}
                                </Button>
                            </SheetClose>
                        </SheetContent>
                    </Sheet>
                    <Link to={"/"} className="my-auto w-10 h-10 sm:ml-5">
                        {/* PLACEHOLDER LOGO I DONT FUCKING KNOW HOW TO MAKE LOGOS HEEEELP */}
                        <svg data-v-0dd9719b="" version="1.0" className="cursor-pointer" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 60 60" preserveAspectRatio="xMidYMid meet" colorInterpolationFilters="sRGB">
                            <g className="icon-text-wrapper icon-svg-group iconsvg">
                                <g className="iconsvg-imagesvg">
                                <g>
                                    <rect fill="#faf2f0" fillOpacity="0" strokeWidth="2" x="0" y="0" width="60" height="60" className="image-rect"/>
                                    <svg x="0" y="0" width="60" height="60" className="image-svg-svg primary">
                                    <svg version="1.1" id="logo" xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" viewBox="1.4378819310159623 1.136910748745294 103.85852420820703 103.86148597172613" enableBackground="new 0 0 106 106">
                                        <path fill="#f5900c" d="M53.37,1.14c-28.68,0-51.93,23.25-51.93,51.93C1.43,81.75,24.69,105,53.37,105
                                c28.68,0,51.93-23.25,51.93-51.93C105.3,24.39,82.04,1.14,53.37,1.14z M59.09,14.7c9.96,0,18.75,4.99,24.02,12.6
                                c-5.27-3.01-11.36-4.74-17.86-4.74c-16.7,0-30.75,11.37-34.84,26.78c-0.33-1.76-0.52-3.57-0.52-5.43
                                C29.88,27.78,42.96,14.7,59.09,14.7z M83.92,84.32c-7.68,7.52-18.19,12.17-29.8,12.17c-23.52,0-42.59-19.07-42.59-42.59
                                c0-11.41,4.5-21.76,11.8-29.41c-3.07,5.42-4.83,11.68-4.83,18.35c0,14.92,8.76,27.78,21.42,33.74c-1.67-3.53-2.63-7.46-2.63-11.61
                                c0-15.07,12.21-27.28,27.28-27.28c15.07,0,27.28,12.22,27.28,27.28c0,7.56-3.07,14.4-8.04,19.34
                                C83.86,84.31,83.88,84.32,83.92,84.32z"/>
                                    </svg>
                                    </svg>
                                </g>
                                </g>
                            </g>
                            <defs v-gra="od"/>
                        </svg>
                    </Link>
                    <div className="mx-auto w-[250px] sm:block hidden ">
                        <SearchBox key="search"/>
                    </div>
                    <div className="my-auto ml-5 sm:hidden ">
                        <Drawer direction="top" onOpenChange={(e)=>{setSearchQuery(""); setIsSearchOpen(e)}} open={isSearchOpen}>
                            <DrawerTrigger className="block sm:hidden"><Search strokeWidth={1.5} className="cursor-pointer"></Search></DrawerTrigger>
                            <DrawerContent>
                                <DrawerFooter>
                                    <div className="flex flex-row space-x-4">
                                        <Input placeholder="Search" value={searchQuery} onChange={(e:any)=>setSearchQuery(e.target.value)}></Input>
                                        <DrawerClose>
                                            <Button variant="outline">Cancel</Button>
                                        </DrawerClose>
                                    </div>
                                    <div className="flex flex-col space-y-3 curosr-pointer">
                                        <div className="flex flex-row items-center" onClick={()=>{setIsSearchOpen(false); navigate('/search?q='+searchQuery+"&t=community")  }}>
                                            <HiOutlineUserGroup className="mr-2 h-4 w-4" />
                                            <span>Search '{searchQuery}' in Communities</span>
                                        </div>
                                        <div className="flex flex-row items-center" onClick={()=>{setIsSearchOpen(false); navigate('/search?q='+searchQuery+"&t=post")}}>
                                            <Pencil className="mr-2 h-4 w-4" />
                                            <span>Search '{searchQuery}' in Posts</span>
                                        </div>
                                        <div className="flex flex-row items-center" onClick={()=>{setIsSearchOpen(false); navigate('/search?q='+searchQuery+"&t=user")}}>
                                            <Users className="mr-2 h-4 w-4" />
                                            <span>Search '{searchQuery}' in Users</span>
                                        </div>
                                    </div>
                                </DrawerFooter>
                                
                            </DrawerContent>
                        </Drawer>
                    </div>
                </div>
                <div className="flex items-center">
                        {
                            auth?.isAuthenticated &&
                            <Button variant={"ghost"} className="p-2 hidden sm:flex" size="sm" onClick={()=>{auth?.protectedAction(()=>navigate("/submit"))}}>
                                <PlusCircle className="mr-1" strokeWidth={1.5}/>
                                {localeContext.localize("CREATE")}
                            </Button>
                        } 
                        
                    <div className="mr-2">
                        <LocaleSwitcher/>
                    </div>
                    <ModeToggle></ModeToggle>
                    <div className="flex items-center mx-2">
                        {auth?.isAuthenticated ? <UserNav displayName={auth?.getUser()?.user && auth?.getUser()?.user?.displayName} email={auth?.getUser().user && auth?.getUser()?.user?.email} avatar={GetAvatar(auth?.getUser())} />: <Button variant={"ghost"} onClick={()=>navigate("/account/login")}><User2 strokeWidth={1.5} className="mr-1"></User2>{localeContext.localize("LOGIN")}</Button>}
                    </div>
                    
                </div>
            </div>
        </header>

        {children}
        <CookieConsent/>
        <NewsLetter toggleNewsletter={openNewsletter}/>
    </div>
}

export default Layout