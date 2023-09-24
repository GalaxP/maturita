import { post_data } from "../../helpers/api";

const Register = () => {

    const handleSubmit = (e:any) => {
        e.preventDefault();
        const form = e.target;
        const formData = new FormData(form);

        const formJson = Object.fromEntries(formData.entries());

        post_data("/account/register", formJson).then((res)=>{
        if(res.status===200)
        {
            alert("successfully registered")
        }
        }).catch((err)=>{console.log(err)})
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