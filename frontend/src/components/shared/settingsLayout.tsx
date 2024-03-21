import { Separator } from "../../components/ui/separator";
import { Button } from "../../components/ui/button";
import { LoginForm } from "components/forms/loginForm";
import { useNavigate } from "react-router-dom";
import { useContext } from "react";
import LocalizationContext from "contexts/LocalizationContext";




export const SettingsLayout = ({children, page} : {children: React.ReactNode, page: keyof typeof pages}) => {
    const navigate = useNavigate();
    const localeContext = useContext(LocalizationContext)

    const pages = {
        Profile: {
            "Title": localeContext.localize("PAGES_PROFILE_TITLE"),
            "Nav Title": localeContext.localize("PAGES_PROFILE_NAV_TITLE"),
            "Description": localeContext.localize("PAGES_PROFILE_DESCRIPTION"),
            "Url": "/edit"
        },
        /*Account: {
            "Title": "Account Settings",
            "Description": "This is where you can change your account settings.",
            "Url": "/edit"
        },
        Security: {
            "Title": "Security Settings",
            "Description": "This is where you can change your security settings.",
            "Url": "/security"
        }*/
    }

    return <>
        <div className="pt-2 h-full sm:p-10">
            <div className="flex flex-row justify-stretch">
                <nav className="flex flex-col w-32 sm:w-64">
                    {Object.keys(pages).map((_page)=>{
                        return _page === page ? 
                        <Button key={_page} className="justify-start bg-muted" variant={"ghost"} onClick={()=>{navigate("/account"+pages[_page].Url)}}>
                        {pages[_page]["Nav Title"]}
                        </Button>
                        : <Button key={_page} className="justify-start hover:bg-transparent hover:underline" variant={"ghost"} onClick={()=>{navigate("/account"+pages[_page as keyof typeof pages].Url)}}>
                        {pages[_page as keyof typeof pages]["Nav Title"]}
                    </Button>
                    })}
                </nav>
                <div className="w-full sm:w-1/2 p-3 sm:p-6 pt-0 flex flex-col items-start">
                    <div className="mb-2 w-full">
                        <h2 className="scroll-m-20 pb-2 text-3xl font-semibold tracking-tight first:mt-0">
                            {pages[page].Title}
                        </h2>
                        <p className="text-sm text-muted-foreground">{pages[page].Description}</p>
                        <Separator className="my-3"/>
                    </div>
                    <div className="w-full flex flex-col">
                        {children}
                    </div>
                </div>
            </div>
        </div>
    </>
}