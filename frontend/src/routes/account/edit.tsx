import { AccountForm } from "components/forms/accountForm";
import { post_data } from "../../helpers/api"
import { useContext, useEffect, useState } from "react"
import { FieldErrors } from "react-hook-form";
import { useToast } from "../../components/ui/use-toast"
import { LoginForm } from "components/forms/loginForm";
import { Separator } from "../../components/ui/separator";
import { SettingsLayout } from "components/shared/settingsLayout";
import { ProfileSettingsForm } from "components/forms/ProfileSettingsForm";
import AuthContext from "contexts/AuthContext";
import { ChangeAvatar } from "components/changeAvatar";
import { Button } from "components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "components/ui/avatar";
import GetAvatar from "helpers/getAvatar";
import { Pencil } from "lucide-react";

const Edit = () => {
    const [error, setError] = useState({field: "", message: ""})
    const { toast } = useToast()
    const auth = useContext(AuthContext)

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
    
    const changeAvatar = (avatar: string) => {
        auth?.setUserForcefully({...auth?.getUser(), user: {...auth?.getUser().user, avatar: avatar}})
    }
    
    return <>
        {/* <AccountForm handleSubmit={(v)=>onSubmit(v)} isLoading={false} setError={error}/> */}
        <SettingsLayout page={"Profile"}>
            <>
                <ChangeAvatar type="user" changeAvatar={(a)=>{changeAvatar(a)}}>
                    <div>  
                        <div className="peer w-20">
                            <Avatar className="w-20 h-20 mb-2">
                                <AvatarImage src={GetAvatar(auth?.getUser())}></AvatarImage>
                                <AvatarFallback>AVT</AvatarFallback>
                            </Avatar>
                        </div>
                        <div id="avatar_pencil" className={"peer-hover:visible block hover:visible invisible absolute cursor-pointer rounded-full z-10 w-20 h-20 mt-[-5.5rem] bg-[rgba(0,0,0,.5)]"}>
                            <Pencil strokeWidth={1.5} color="white" className={"ml-4 my-4 z-10 w-12 h-12"} ></Pencil>
                        </div>
                    </div>
                </ChangeAvatar>
                <ProfileSettingsForm originalDisplayName={auth?.getUser().user.displayName} originalEmail={auth?.getUser().user.email} handleSubmit={()=>{}} isLoading={false} />
            </>
        </SettingsLayout>
    </>
}
export default Edit