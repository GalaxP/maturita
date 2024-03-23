import { useDocumentTitle } from "hooks/setDocuemntTitle";
import { post_data } from "../../helpers/api";
import { RegisterForm } from "components/forms/registerForm";
import { useToast } from "../../components/ui/use-toast"
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { UseFormReturn, useForm } from "react-hook-form";

declare var grecaptcha:any

const Register = () => {
    const [documentTitle, setDocumentTitle] = useDocumentTitle("Register")
    const [isLoading, setIsLoading] = useState(false)
    const { toast } = useToast()
    const navigate = useNavigate();
    const [error, setError] = useState({field: "", message: ""})

    const onSubmit = (values:any) => {
        grecaptcha.ready(function() {
            grecaptcha.execute(process.env.REACT_APP_RECAPTCHA_SITE_KEY, {action: 'register'}).then(function(token:string) {
                setIsLoading(true)
                post_data("/account/register", {...values, token:token}).then((res)=>{
                    if(res.status===200) {
                        setIsLoading(false)
                        toast({
                            description: "Account successfully created.",
                        })
                        navigate("/")
                    }
                    }).catch((err)=>{
                        if(err.response?.status === 409) {
                            if(err.response.data?.error?.message?.split(" ")[0]==="email") {
                                setError({field: "email", message:"A user with this email address already exists"})
                            } else if(err.response.data?.error?.message?.split(" ")[0]==="username") {
                                setError({field: "displayName", message:"A user with this user name address already exists"})
                            }
                            else {
                                toast({
                                    variant: "destructive",
                                    title: "Uh oh! Something went wrong.",
                                })
                            }
                            //form.setError("displayName", {message: "already exists"})
                        }
                        else {
                            toast({
                                variant: "destructive",
                                title: "Uh oh! Something went wrong.",
                            })
                        }
                        setIsLoading(false)
                    })
            })
        })
    }

    return <div className="m-0 h-[85vh] flex items-center">
         <div className="mx-auto w-[350px] ">
            <RegisterForm handleSubmit={onSubmit} isLoading={isLoading} setError={error}/>
        </div>
    </div>
}

export default Register