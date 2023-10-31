import { AccountForm } from "components/forms/accountForm";
import { post_data } from "../../helpers/api"
import { useEffect, useState } from "react"
import { FieldErrors } from "react-hook-form";
import { useToast } from "../../components/ui/use-toast"
import { Button } from "../../components/ui/button";
import { LoginForm } from "components/forms/loginForm";
import { Separator } from "../../components/ui/separator";

const Edit = () => {
    const [error, setError] = useState({field: "", message: ""})
    const { toast } = useToast()

    useEffect(()=>{

    }, [error])

    const onSubmit = (e:{avatar: File}) => {
        console.log(error)
        console.log(e.avatar.size>1024*1024)
        var formData = new FormData();
        formData.append("avatar", e.avatar)
        if(e.avatar.size>1024*1024) {setError({field: "avatar", message: "File is too big! it has to be under 1Mb"}); return}
        else {
            setError({field: "", message: ""});
            if(e) post_data("/account/upload", formData, {}, true, {"Content-type":"multipart/form-data"}).then((res)=>{
                toast({
                    description: "Saved",
                })
            }).catch((err)=> {
                toast({
                    description: err.response.data,
                    variant: "destructive"
                })
            })
        }
    }
   
    
    return <>
        {/* <AccountForm handleSubmit={(v)=>onSubmit(v)} isLoading={false} setError={error}/> */}
        <div className="p-10 h-full">
            <div className="flex flex-row justify-stretch">
                
                <nav className="flex flex-col w-64">
                    <Button className="justify-start bg-muted" variant={"ghost"}>
                        Profile
                    </Button>
                    <Button className="justify-start hover:bg-transparent hover:underline" variant={"ghost"}>
                        Account
                    </Button>
                    <Button className="justify-start hover:bg-transparent hover:underline" variant={"ghost"}>
                        Security
                    </Button>
                </nav>
                <div className="w-1/2 p-6 pt-0 flex flex-col items-start">
                    <div className="mb-2 w-full">
                        <h2 className="scroll-m-20 pb-2 text-3xl font-semibold tracking-tight first:mt-0">
                            Profile Settings
                        </h2>
                        <p className="text-sm text-muted-foreground">This is where you can change your profile settings.</p>
                        <Separator className="my-3"/>
                    </div>
                    <div className="w-full flex flex-col">
                        <LoginForm googleSignIn={()=>{}} handleSubmit={()=>{}} isLoading={false} />
                    </div>
                </div>
            </div>
        </div>
    </>
}
export default Edit