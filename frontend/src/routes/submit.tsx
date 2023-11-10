import { post_data, get_data } from "../helpers/api"
import AuthContext from "../contexts/AuthContext";
import { useContext } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useDocumentTitle } from "hooks/setDocuemntTitle";
import { SubmitForm } from "../components/forms/submitForm"
 
declare var grecaptcha:any

const Submit = () => {
    const auth = useContext(AuthContext)
    const navigate = useNavigate()
    const [documentTitle, setDocumentTitle] = useDocumentTitle("Submit")
    const [commParams] = useSearchParams();
    const comm = commParams.get("comm")
    
    async function handleSubmit(forms:{ body: string; title: string; }) {
        grecaptcha.ready(function() {
          grecaptcha.execute(process.env.REACT_APP_RECAPTCHA_SITE_KEY, {action: 'post'}).then(function(token:string) {
            auth?.protectedAction(()=> {
                post_data("/post", {...forms, token: token}, {}, true).then((res)=>{
                if(res.status===200)
                {
                    navigate("/")
                }})
              .catch((err)=>{})
            }, ()=> {navigate("/account/login")})
          })
        })
        //console.log(formJson.data);
        //<Link key={posts[i]._id} to={"/post/"+posts[i]._id} className="Link mx-auto block">
        //
      }


    return <div className="lg:w-3/5 sm:w-3/4 mt-6 w-[90%] mx-auto">
      <SubmitForm defaultCommunity={typeof comm === "string" ? comm : undefined} handleSubmit={handleSubmit} isLoading={false}/>
    </div>
}

export default Submit