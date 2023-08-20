import { useContext, useEffect } from "react";
import AuthContext from "../../components/shared/AuthContext"
import { redirect, useNavigate } from "react-router-dom";

const Logout = () => {
    const auth = useContext(AuthContext);
    const navigate = useNavigate()

    useEffect(()=> {
        auth?.logout().catch((err)=>{})
        navigate("/")
    })
    
    return <></>
}

export default Logout