import { useContext, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom"
import AuthContext from "../../contexts/AuthContext";
import { ReactNode } from "react";
import React from "react";
import {
    NavigationMenu,
    NavigationMenuContent,
    NavigationMenuIndicator,
    NavigationMenuItem,
    NavigationMenuLink,
    NavigationMenuList,
    NavigationMenuTrigger,
    NavigationMenuViewport,
    navigationMenuTriggerStyle
  } from "../ui/navigation-menu"
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar"
import { Button } from "../ui/button"
import GetAvatar from "helpers/getAvatar";
import LocaleSwitcher from "components/localeSwitcher";
import LocalizationContext from "contexts/LocalizationContext";
type LayoutProps = {
    children: React.ReactNode
}

const excludedFromLayout: string[] = []

const Layout = ({children}: LayoutProps) => {
    const auth = useContext(AuthContext);
    const [loaded, setLoaded] = useState(false)
    const localeContext = useContext(LocalizationContext)

    const navigate = useNavigate();
    return <>
        <header className="sticky top-0 z-50 w-full border-b px-2">
            <div className="h-full my-2 flex space-x-2">
                <div className="flex">
                    <Button variant="ghost" onClick={()=>navigate("/")}>Home
                    </Button>
                </div>
                <div className="flex flex-1 justify-end">
                    <div>
                        <LocaleSwitcher/>
                    </div>
                    <Button variant="ghost" className="" onClick={()=>navigate(auth?.isAuthenticated ? "/account/logout" : "/account/login")}>
                        {auth?.isAuthenticated &&<Avatar className="shadow-md cursor-pointer mr-2">
                            <AvatarImage src={GetAvatar(auth?.getUser())} alt="@shadcn" />
                            <AvatarFallback>AVATAR</AvatarFallback>
                        </Avatar> }
                            {auth?.isAuthenticated ? auth?.getUser().user.displayName :  localeContext.localize("LOGIN") }
                    </Button>
                    
                </div>
            </div>
        </header>
        
        {/*auth?.isAuthenticated ? <><p className="w-max">logged in as {auth?.getUser().user.email} ({auth?.getUser().provider})</p><Link to={"/account/logout"}>Logout</Link></>: <Link to={"/account/login"}>Login</Link>*/}
        {/* </div> */}
        
        {/* <div className="mt-8">
            {children}
        </div> */}
        {children}
    </>
}

export default Layout