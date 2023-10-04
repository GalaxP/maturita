import { useDocumentTitle } from "hooks/setDocuemntTitle";
import { post_data } from "../../helpers/api";
declare var grecaptcha:any

const Register = () => {
    const [documentTitle, setDocumentTitle] = useDocumentTitle("Register")
    
    const handleSubmit = (e:any) => {
        e.preventDefault();
        const form = e.target;
        const formData = new FormData(form);

        const formJson = Object.fromEntries(formData.entries());
        grecaptcha.ready(function() {
            grecaptcha.execute('6Ld0mW4oAAAAAMQH12Drl2kwd1x3uwQ9yKCJIO5o', {action: 'register'}).then(function(token:string) {
                post_data("/account/register", {...formJson, token:token}).then((res)=>{
                if(res.status===200)
                {
                    alert("successfully registered")
                }
                }).catch((err)=>{console.log(err)})
            });
        });
    }

    return <div className="register">
        <form method="post" onSubmit={handleSubmit}>
            <label htmlFor="firstName">First Name</label><br/>
            <input id="firstName" name="firstName"></input><br/>
            <label htmlFor="lastName">Last Name</label><br/>
            <input id="lastName" name="lastName"></input><br/>
            <label htmlFor="email">Email</label><br/>
            <input id="email" name="email" type="email"></input><br/>
            <label htmlFor="displayName">User Name</label><br/>
            <input id="displayName" name="displayName"></input><br/>
            <label htmlFor="password">Password</label><br/>
            <input id="password" name="password" type="password"></input><br/>

            <input type="submit" value="submit"/>
        </form>
    </div>
}

export default Register