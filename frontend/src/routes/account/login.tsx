import { useContext, useEffect, useState } from "react";
import AuthContext from "../../contexts/AuthContext"
import { Link, useNavigate } from "react-router-dom";
import { GoogleLogin, useGoogleLogin } from "@react-oauth/google";
import { LoginForm } from "components/forms/loginForm";
import { useDocumentTitle } from "hooks/setDocuemntTitle";
import { post_data } from "helpers/api";
import axios from "axios";
import LocalizationContext from "contexts/LocalizationContext";
declare var grecaptcha:any
declare var google:any

const Login = () => {
    const auth = useContext(AuthContext);
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false)
    const [documentTitle, setDocumentTitle] = useDocumentTitle("Login")
    const [error, setError] = useState(false)
    //const [isInitialized, ]
    const localeContext = useContext(LocalizationContext)

    useEffect(()=>{
        google.accounts.id.initialize({
            client_id: "203110807748-0f7t1473amk5f0j3nhtq8aas8v5c2coq.apps.googleusercontent.com",
            context:"signin", 
            ux_mode: "redirect", 
            login_uri: process.env.REACT_APP_API_URL+"/account/google/callback"
        });
        google.accounts.id.renderButton(
            document.getElementById("buttonDiv"),
            { theme: "outline", size: "large", width: "350" }  // customization attributes
        );

    }, [])

    useEffect(()=> {
        if(auth?.isAuthenticated) navigate(-1)
    }, [])

    const googleLogin = () => {}

    const onSubmit = (values:any) => {
        setIsLoading(true)
        
        grecaptcha.ready(function() {
            grecaptcha.execute(process.env.REACT_APP_RECAPTCHA_SITE_KEY, {action: 'login'}).then(function(token:string) {
                auth?.login({email: values.email, password: values.password}, token)
                .then((res)=> {
                    //alert("successfully logged in as "+ res.user.email)
                    navigate("/")
                    setIsLoading(false)
                })
                .catch((res)=> {
                    if(res.response.status===401) setError(true)
                    setIsLoading(false)
                })
            });
        });
    }

    return <div className="m-0 h-[85vh] flex items-center">
        <div className="mx-auto w-[350px]">
            <LoginForm handleSubmit={onSubmit} isLoading={isLoading} googleSignIn={googleLogin} incorrectCredentials={error}/>

            <div id="buttonDiv" className="mt-3"></div>
            <div className="text-center mt-3"><p>{localeContext.localize("REGISTER_PROMPT")} <Link to={"/account/register"} className="text-primary">{localeContext.localize("REGISTER_HERE")} </Link></p></div>
        </div>
    </div>
}

export default Login