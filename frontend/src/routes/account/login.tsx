import { useContext, useEffect, useState } from "react";
import AuthContext from "../../contexts/AuthContext"
import { useNavigate } from "react-router-dom";
import { GoogleLogin, useGoogleLogin } from "@react-oauth/google";
import { ProfileForm } from "../../components/ui/profileSchema"

import { Button } from "../../components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
  } from "../../components/ui/card"
  import { Input } from "../../components/ui/input"
  import { Label } from "../../components/ui/label"
  import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
  } from "../../components/ui/select"
import { LoginForm } from "components/forms/loginForm";

const Login = ({layout}: any) => {
    const auth = useContext(AuthContext);
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false)

    const responseMessage = (response:any) => {
        alert("yay");
    };
    const errorMessage = () => {
        console.log("error");
    };

    const handleSubmit = async(e:any) => {
        e.preventDefault();
        const form = e.target;
        const formData = new FormData(form);

        const formJson = Object.fromEntries(formData.entries());
        
        auth?.login({email: formJson.email.toString(), password: formJson.password.toString()})
        .then((res)=> {
            //alert("successfully logged in as "+ res.user.email)
            navigate("/")
        })
        .catch((res)=> {
            if(res.response.status===401) alert("incorrect credentials")
        })

        /*post_data("/account/login", formJson, {withCredentials:false}).then((res)=>{
        if(res.status===200)
        {
            alert("successfully logged in");
            setCookie("refreshToken", res.data.refreshToken, { 
                secure:true,
                sameSite: true,
                httpOnly: true
            })
            const cookies = new Cookies();
            cookies.set('refreshToken', res.data.refreshToken, { 
                path:"/",
                sameSite: false,
                httpOnly: true,
                secure: false
            })
            console.log(res.data);
        }
        }).catch((err)=>{if(err.response.status===401) alert('incorrect credentials')})*/
    }
    const googleLogin = useGoogleLogin({ux_mode:"redirect", redirect_uri:"http://localhost:8080/account/google/callback", flow: 'auth-code'});

    const onSubmit = (values:any) => {
        setIsLoading(true)
        auth?.login({email: values.email, password: values.password})
        .then((res)=> {
            //alert("successfully logged in as "+ res.user.email)
            navigate("/")
            setIsLoading(false)
        })
        .catch((res)=> {
            if(res.response.status===401) alert("incorrect credentials")
            setIsLoading(false)
        })
    }

    return <div className="m-0 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
        {
        /*
        <form method="post" onSubmit={handleSubmit} className="text">
            <label htmlFor="email">Email</label><br/>
            <input id="email" name="email"></input><br/>
            <label htmlFor="password">Password</label><br/>
            <input id="password" name="password" type="password"></input><br/>
            <input type="submit" value="submit"/>
        </form>
        <ProfileForm></ProfileForm>

        <Card className="max-w-[350px]">
        <CardHeader>
        <CardTitle>Sign In</CardTitle>
        <CardDescription>Deploy your new project in one-click.</CardDescription>
        </CardHeader>
        <CardContent>
        <form>
        <div className="grid w-full items-center gap-4">
        <div className="flex flex-col space-y-1.5">
        <Label htmlFor="email">Email</Label>
        <Input id="email" placeholder="email" />
        </div>
        <div className="flex flex-col space-y-1.5">
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password"/>
                </div>
                <div className="flex flex-col space-y-1.5">
                <Label htmlFor="framework">Framework</Label>
                <Select>
                <SelectTrigger id="framework">
                <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent position="popper">
                <SelectItem value="next">Next.js</SelectItem>
                <SelectItem value="sveltekit">SvelteKit</SelectItem>
                <SelectItem value="astro">Astro</SelectItem>
                <SelectItem value="nuxt">Nuxt.js</SelectItem>
                </SelectContent>
                </Select>
                </div>
                
                </div>
                </form>
                </CardContent>
                <CardFooter className="flex justify-between">
                <Button variant="outline">Cancel</Button>
                <Button>Login</Button>
                </CardFooter>
        </Card>
        */
        }
        {/*<Button onClick={()=>googleLogin()}>LogIn</Button>*/}
        {}
        
        <div className="mx-auto w-[350px] ">
            <LoginForm handleSubmit={onSubmit} isLoading={isLoading} googleSignIn={googleLogin}/>
            {/*<GoogleLogin shape="rectangular" ux_mode="redirect" login_uri="http://localhost:8080/account/google/callback" onSuccess={responseMessage}/>*/}
        </div>
        {/* <Card className="max-w-[350px]">
            <CardHeader>
                <CardTitle>Sign In</CardTitle>
                <CardDescription>Deploy your new project in one-click.</CardDescription>
            </CardHeader>
            <CardContent>
            </CardContent>
        </Card> */}
    </div>
}

export default Login