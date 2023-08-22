import { useContext } from "react";
import AuthContext from "../../components/shared/AuthContext"
import { useNavigate } from "react-router-dom";

const Login = ({layout}: any) => {
    const auth = useContext(AuthContext);
    const navigate = useNavigate();

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

    return <div className="login">
        <form method="post" onSubmit={handleSubmit}>
            <label htmlFor="email">Email</label><br/>
            <input id="email" name="email"></input><br/>
            <label htmlFor="password">Password</label><br/>
            <input id="password" name="password"></input><br/>
            <input type="submit" value="submit"/>
        </form>
    </div>
}

export default Login