import { Separator } from "../../components/ui/separator";
import { Button } from "../../components/ui/button";
import { LoginForm } from "components/forms/loginForm";
import { useNavigate } from "react-router-dom";

const pages = {
    Profile: {
        "Title": "Profile Settings",
        "Description": "This is where you can change your profile settings.",
        "Url": "/edit"
    },
    Account: {
        "Title": "Account Settings",
        "Description": "This is where you can change your account settings.",
        "Url": "/edit"
    },
    Security: {
        "Title": "Security Settings",
        "Description": "This is where you can change your security settings.",
        "Url": "/security"
    }
}


export const SettingsLayout = ({children, page} : {children: React.ReactNode, page: keyof typeof pages}) => {
    const navigate = useNavigate();

    return <>
        <div className="pt-2 h-full sm:p-10">
            <div className="flex flex-row justify-stretch">
                <nav className="flex flex-col w-32 sm:w-64">
                    {Object.keys(pages).map((_page)=>{
                        return _page === page ?  <> 
                        <Button className="justify-start bg-muted" variant={"ghost"} onClick={()=>{navigate("/account"+pages[_page].Url)}}>
                        {_page}
                    </Button>
                        </> : <Button className="justify-start hover:bg-transparent hover:underline" variant={"ghost"} onClick={()=>{navigate("/account"+pages[_page as keyof typeof pages].Url)}}>
                        {_page}
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