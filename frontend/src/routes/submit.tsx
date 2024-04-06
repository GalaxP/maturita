import { post_data, get_data } from "../helpers/api"
import AuthContext from "../contexts/AuthContext";
import { useContext, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useDocumentTitle } from "hooks/setDocuemntTitle";
import { SubmitForm } from "../components/forms/submitForm"
import LocalizationContext from "contexts/LocalizationContext";
 
declare var grecaptcha:any

const Submit = () => {
    const auth = useContext(AuthContext)
    const navigate = useNavigate()
    const localeContext = useContext(LocalizationContext)
    const [documentTitle, setDocumentTitle] = useDocumentTitle(localeContext.localize("TITLE_SUBMIT"))
    const [commParams] = useSearchParams();
    const [isLoading, setIsLoading] = useState(false)
    const comm = commParams.get("comm")
    
    async function handleSubmit(forms:{ body: string; title: string; tag?:string, photos?: (string[] | undefined) }) {
        setIsLoading(true)
        grecaptcha.ready(function() {
          grecaptcha.execute(process.env.REACT_APP_RECAPTCHA_SITE_KEY, {action: 'post'}).then(function(token:string) {
            auth?.protectedAction(()=> {
                post_data("/post", {...forms, token: token}, {}, true).then((res)=>{
                  if(res.status===200)
                  {
                    navigate("/")
                    setIsLoading(false);
                  }
                })
              .catch((err)=>{setIsLoading(false);})
            }, ()=> {setIsLoading(false); navigate("/account/login")})
          })
        })
        
      }


    return <div className="sm w-11/12 lg:w-[700px] sm:w-11/12 mt-6 mx-auto">
      <SubmitForm showMyCommunities defaultCommunity={typeof comm === "string" ? comm : undefined} handleSubmit={handleSubmit} isLoading={isLoading}/>
    </div>
}

export default Submit