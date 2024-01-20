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
import { useDocumentTitle } from "hooks/setDocuemntTitle";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "components/ui/dialog";
import { Input } from "components/ui/input";
declare var grecaptcha:any

const Edit = () => {
    const [error, setError] = useState({field: "", message: ""})
    const { toast } = useToast()
    const auth = useContext(AuthContext)
    const documentTitle = useDocumentTitle("Account Settings")
    const [newEmail, setNewEmail] = useState("")
    const [confirmOpen, setConfirmOpen] = useState(false)

    const [loading, setLoading] = useState(false)
    
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

    const handleSubmit = (email:string) => {
        setNewEmail(email)
        setConfirmOpen(true)
    }

    const changeEmail = () => {
        setLoading(true)
        grecaptcha.ready(function() {
            grecaptcha.execute(process.env.REACT_APP_RECAPTCHA_SITE_KEY, {action: 'email'}).then(function(token:string) {
                setConfirmOpen(false)
                post_data("/account/change-email", {email: newEmail, token: token}, {}, true)
                .then((res)=> {
                    setLoading(false)
                    if(res.status === 200) {
                        auth?.logout();
                    }
                })
                .catch((err)=>{
                    if(err.response.status===409) {
                        toast({
                            description: "email has already been registered",
                            variant: "destructive"
                        })
                    } else {
                        toast({
                            description: "something went wrong",
                            variant: "destructive"
                        })
                    }
                    setLoading(false)
                })
            }
        )})
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
                <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
                    <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                            <DialogTitle>Are you sure you want to change your email?</DialogTitle>
                            <DialogDescription>
                                This is going to force a log out and you are going to have to back in with the new email.
                            </DialogDescription>
                        </DialogHeader>
                        <Input disabled readOnly value={newEmail}></Input>
                        <DialogFooter>
                            <DialogClose asChild>
                                <Button type="submit" variant={"secondary"}>Cancel</Button>
                            </DialogClose>
                            <Button type="submit" onClick={changeEmail}>Change Email</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
                <ProfileSettingsForm originalDisplayName={auth?.getUser().user.displayName} originalEmail={auth?.getUser().user.email} handleSubmit={(a)=>{handleSubmit(a.email)}} isLoading={loading} />
            </>
        </SettingsLayout>
    </>
}
export default Edit