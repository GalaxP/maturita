import { useContext, useEffect, useState } from "react";
import AuthContext from "../../contexts/AuthContext"
import { useNavigate } from "react-router-dom";
import { GoogleLogin, useGoogleLogin } from "@react-oauth/google";
import { LoginForm } from "components/forms/loginForm";
import { useDocumentTitle } from "hooks/setDocuemntTitle";
import { post_data } from "helpers/api";
import axios from "axios";
declare var grecaptcha:any

const Login = () => {
    const auth = useContext(AuthContext);
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false)
    const [documentTitle, setDocumentTitle] = useDocumentTitle("Login")

    const responseMessage = (response:any) => {
        alert("yay");
    };

    useEffect(()=> {
        if(auth?.isAuthenticated) navigate(-1)
    }, [])
    const googleLogin = useGoogleLogin({ux_mode:"redirect", redirect_uri:"http://localhost:8080/account/google/callback", flow: 'auth-code'});
    

    const onSubmit = (values:any) => {
        setIsLoading(true)
        
        grecaptcha.ready(function() {
            grecaptcha.execute('6Ld0mW4oAAAAAMQH12Drl2kwd1x3uwQ9yKCJIO5o', {action: 'login'}).then(function(token:string) {
                auth?.login({email: values.email, password: values.password}, token)
                .then((res)=> {
                    //alert("successfully logged in as "+ res.user.email)
                    navigate("/")
                    setIsLoading(false)
                })
                .catch((res)=> {
                    if(res.response.status===401) alert("incorrect credentials")
                    setIsLoading(false)
                })
            });
        });
    }

    return <div className="m-0 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
        <div className="mx-auto w-[350px] ">
            <LoginForm handleSubmit={onSubmit} isLoading={isLoading} googleSignIn={googleLogin}/>
            {<GoogleLogin shape="rectangular" ux_mode="redirect" login_uri="http://localhost:8080/account/google/callback" onSuccess={responseMessage}/>}
        </div>
    </div>
}

export default Login