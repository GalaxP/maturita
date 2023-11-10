import { ContactForm } from "components/forms/contactForm"
import { post_data } from "helpers/api"
import { useEffect, useState } from "react"
import { useToast } from "components/ui/use-toast"
import { useNavigate } from "react-router-dom"
declare var grecaptcha:any
declare var google:any

export const Contact = () => {
    const [loading, setLoading] = useState(false)
    const { toast } = useToast();
    const navigate = useNavigate()

    useEffect(()=> {

    }, [loading])

    const onSubmit = (e:any) => {
        setLoading(true);
        
        grecaptcha.ready(function() {
            grecaptcha.execute(process.env.REACT_APP_RECAPTCHA_SITE_KEY, {action: 'contact'}).then(function(token:string) {
                
                post_data("/contact", {...e, token: token})
                .then((res)=> {
                    toast({
                        title: "successfully sent" 
                    })
                    setLoading(false);
                    navigate("/")
                })
                .catch((err)=> {
                    toast({
                        variant: "destructive",
                        title: "There was a problem with your request" 
                    })
                    setLoading(false);
                })
            })
        })
    }

    return <div className="flex justify-center items-center mt-5 mx-auto w-11/12 lg:w-[650px] sm:w-11/12">
        <ContactForm handleSubmit={(e)=>onSubmit(e)} isLoading={loading}/>
    </div> 
}