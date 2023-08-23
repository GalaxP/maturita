import { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom"
import AuthContext from "../../contexts/AuthContext";
import { ReactNode } from "react";
import React from "react";

type LayoutProps = {
    children: React.ReactNode
}

const excludedFromLayout: string[] = []

const Layout = ({children}: LayoutProps) => {
    const auth = useContext(AuthContext);
    const [loaded, setLoaded] = useState(false)
    return <>
        {auth?.isAuthenticated ? <><p>logged in as {auth?.getUser().user.email}</p><Link to={"/account/logout"}>Logout</Link></>: <Link to={"/account/login"}>Login</Link>}
        {children}
    </>
}

export default Layout