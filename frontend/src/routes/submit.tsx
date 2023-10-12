import { post_data, get_data } from "../helpers/api"
import AuthContext from "../contexts/AuthContext";
import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { useDocumentTitle } from "hooks/setDocuemntTitle";


declare var grecaptcha:any

const Submit = () => {
    const auth = useContext(AuthContext)
    const navigate = useNavigate()
    const [documentTitle, setDocumentTitle] = useDocumentTitle("Submit")
    
    async function handleSubmit(e:any) {
        // Prevent the browser from reloading the page
        e.preventDefault();
    
        // Read the form data
        const form = e.target;
        const formData = new FormData(form);
    
        // Or you can work with it as a plain object:
        const formJson = Object.fromEntries(formData.entries());
        // You can pass formData as a fetch body directly:
        //fetch('http://localhost:8080/post', { method: form.method});
        grecaptcha.ready(function() {
          grecaptcha.execute(process.env.REACT_APP_RECAPTCHA_SITE_KEY, {action: 'post'}).then(function(token:string) {
            auth?.protectedAction(()=> {
                post_data("/post", {...formJson, token: token}, {}, true).then((res)=>{
                if(res.status===200)
                {
                    alert("success")
                }})
              .catch((err)=>{})
            }, ()=> {navigate("/account/login")})
          })
        })
        //console.log(formJson.data);
        //<Link key={posts[i]._id} to={"/post/"+posts[i]._id} className="Link mx-auto block">
        //
      }


    return <form method="post" onSubmit={handleSubmit}>
    <label htmlFor="title">Title</label><br/>
    <input id="title" name="title"></input><br/>
    <label htmlFor="body">Body</label><br/>
    <input id="body" name="body"></input><br/>
    <input type="submit" value="submit"/>
  </form>
}

export default Submit