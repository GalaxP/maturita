import React, { useContext } from "react"
import AuthContext from "../contexts/AuthContext"
import { Navigate, useLocation } from "react-router-dom"
import { redirect } from "react-router-dom";

type protectedProps = {
    children: React.ReactNode
}

const ProtectedRoute = ({children}:protectedProps) => {
    const auth = useContext(AuthContext)
    let location = useLocation();

    if(!auth?.isAuthenticated) return <Navigate to="/account/login" state={{ from: location}} replace />
    return <>{ children }</>
}

export default ProtectedRoute