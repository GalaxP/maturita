import { AccountForm } from "components/forms/accountForm";
import { post_data } from "../../helpers/api"
import { useEffect, useState } from "react"
import { FieldErrors } from "react-hook-form";
import { useToast } from "../../components/ui/use-toast"

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
    <AccountForm handleSubmit={(v)=>onSubmit(v)} isLoading={false} setError={error}/>
    </>
}
export default Edit