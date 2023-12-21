import AuthContext from "contexts/AuthContext"
import { useContext, useEffect } from "react"
import { useNavigate } from "react-router-dom";

const AdminPanel = () => {
    const auth = useContext(AuthContext);
    const navigate = useNavigate();

    useEffect(()=>{
        if(!auth?.isAuthenticated) navigate("/")
    })
    return <h1>Admin Panel</h1>
}

export default AdminPanel