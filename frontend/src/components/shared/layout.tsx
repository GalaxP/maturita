import { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom"
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
type LayoutProps = {
    children: React.ReactNode
}

const excludedFromLayout: string[] = []

const Layout = ({children}: LayoutProps) => {
    const auth = useContext(AuthContext);
    const [loaded, setLoaded] = useState(false)
    return <>
        {/* <div className="py-2 border-b border-s-zin-200 fixed w-full z-10 top-0 bg-card h-10"> */}
        <header className="sticky top-0 z-50 w-full border-b px-2">

            <NavigationMenu className="py-2">
                <NavigationMenuList>
                    <NavigationMenuItem>
                        <Link to={"/"}>
                            <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                            Home
                            </NavigationMenuLink>
                        </Link>
                    </NavigationMenuItem>
                    <NavigationMenuItem>

                        <Link to={auth?.isAuthenticated ? "/account/logout" : "/account/login"}>
                            <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                            {auth?.isAuthenticated ? "Logout" :  "Login" }
                            </NavigationMenuLink>
                        </Link>
                       
                        
                    </NavigationMenuItem>
                </NavigationMenuList>
            </NavigationMenu>
        </header>
        
        {/*auth?.isAuthenticated ? <><p className="w-max">logged in as {auth?.getUser().user.email} ({auth?.getUser().provider})</p><Link to={"/account/logout"}>Logout</Link></>: <Link to={"/account/login"}>Login</Link>*/}
        {/* </div> */}
        <div className="mt-12">
            {children}
        </div>
    </>
}

export default Layout