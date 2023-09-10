import { useContext, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import AuthContext from "../../../contexts/AuthContext";

const Callback = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate()
    const auth = useContext(AuthContext);
    
    useEffect(()=> {
        if(!searchParams) navigate('/')
        const user = searchParams.get('user')
        const token = searchParams.get('token')
        if(user && token) auth?.googleLogin(user, token)
        navigate("/")
    }, [])

    return <></>
}

export default Callback