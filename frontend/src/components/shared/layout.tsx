import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom"
import AuthContext from "../../contexts/AuthContext";
import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar"
import { Button } from "../ui/button"
import GetAvatar from "helpers/getAvatar";
import LocaleSwitcher from "components/localeSwitcher";
import LocalizationContext from "contexts/LocalizationContext";
import { Input } from "../ui/input";
import { MagnifyingGlassIcon } from "@radix-ui/react-icons";
import { Search } from "lucide-react";
import { SearchBox } from "components/searchBox";
import { CookieConsent } from "components/cookieConsent";
type LayoutProps = {
    children: React.ReactNode
}

const excludedFromLayout: string[] = []

const Layout = ({children}: LayoutProps) => {
    const auth = useContext(AuthContext);
    const [loaded, setLoaded] = useState(false)
    const localeContext = useContext(LocalizationContext)
    const [searchQuery, setSearchQuery] = useState("")

    const navigate = useNavigate();
    return <>
        <header className="sticky top-0 z-50 w-full border-b px-2 bg-white">
            <div className="h-full py-2 flex justify-between">
                <div className="flex flex-grow mr-2">
                    <Button key="home" variant="ghost" onClick={()=>navigate("/")}>Home
                    </Button>
                    <div className="mx-auto w-[250px]">
                        {/* <Search className="absolute top-[10px] ml-3 h-5 w-5" strokeWidth={1.3}></Search>
                        <Input placeholder="Search" className="w-full pl-9 rounded-full" value={searchQuery} onChange={(e)=>{setSearchQuery(e.target.value)}}/> */}
                        <SearchBox key="search"/>
                    </div>
                </div>
                <div className="flex">
                    <div>
                        <LocaleSwitcher key={crypto.randomUUID()}/>
                    </div>
                    <Button key="user" variant="ghost" className="" onClick={()=>navigate(auth?.isAuthenticated ? "/account/logout" : "/account/login")}>
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
        <CookieConsent/>
    </>
}

export default Layout