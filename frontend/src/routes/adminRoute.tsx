import AuthContext from "contexts/AuthContext"
import { LazyExoticComponent, Suspense, lazy, useContext, useEffect } from "react"
import { useNavigate } from "react-router-dom";
import { lazyLoad } from "./lazyLoad";



const AdminRoute = () => {
    const auth = useContext(AuthContext);
    const navigate = useNavigate();

    let AdminPanel:LazyExoticComponent<() => JSX.Element> | null = (auth?.isAuthenticated && auth?.getUser().user.roles && auth?.getUser().user.roles.includes('admin') ) ? lazy(()=>import("../components/adminPanel")) : null//authorized ? lazy(()=>import("../components/adminPanel")) : null

    useEffect(()=>{
        if(!auth?.isAuthenticated || !auth?.getUser().user.roles || !auth?.getUser().user.roles.includes('admin')) navigate("/")
    })
    return <Suspense fallback={<h1>loading...</h1>}>
        {AdminPanel && <AdminPanel/>}
    </Suspense>
}

export default AdminRoute