import axios from "axios";
import { FunctionComponent, createContext, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { post_data, setAccessToken, getAccessToken } from "../helpers/api";
import { AuthContextProviderProps, AuthContextType, IAuth } from "../schemas/authSchema";
import Cookies from 'universal-cookie';
 
const AuthContext = createContext<AuthContextType | null>(null);
 
export const AuthContextProvider = ({ children }: AuthContextProviderProps) => {
    const [user, setUser] = useState(() => {
        const cookies = new Cookies();
        let user = cookies.get('account')
        if (user) {
            return user
        }
        return null;
    });
    const [isAuthenticated, setIsAuthenticated] = useState(()=> {
        if(user) return true
        return false
    })

    const cookies = new Cookies();

    const protectedAction = (action: Function, onFail?:Function) => {
        if(isAuthenticated) return action()
        return onFail ? onFail() : null
    }

    const login = (credentials: IAuth) => {
        return new Promise((resolve, reject) => {
            post_data("/account/login", credentials, {withCredentials:true})
            .then((res)=>{
                if(res.status===200)
                {
                    let user = {
                        user: res.data.user,
                    }

                    cookies.set('account', JSON.stringify(user), { 
                        path:"/",
                        sameSite: "lax",
                        httpOnly: false,
                        secure: false
                    })

                    setUser({user});
                    setIsAuthenticated(true)
                    setAccessToken(res.data.accessToken)
                    return resolve(user);
                }
                else {
                    setUser(null);
                    setIsAuthenticated(false)
                    setAccessToken("")
                    return reject(res)
                }
            })
            .catch((err)=>{setIsAuthenticated(false);setAccessToken("");return reject(err)})}
    )}

    const logout = () => {
        return new Promise((resolve, reject) => {
            const _user = getUser();
            if(!isAuthenticated) return reject("Not Authenticated")

            post_data("/account/logout", {}, {withCredentials:true})
            .then((res)=> {
                if(res.status===204) {
                    cookies.remove("account", { 
                        path:"/",
                        sameSite: "lax",
                        httpOnly: false,
                        secure: false
                    });
                    cookies.remove('refreshToken', {
                        path: "/",
                        sameSite: "lax",
                        httpOnly: false,
                        secure: false
                    })
                    cookies.remove('accessToken', {
                        path: "/",
                        sameSite: "lax",
                        httpOnly: false,
                        secure: false
                    })
                    setIsAuthenticated(false)
                    setUser(null)
                    setAccessToken("")
                    return resolve("successfully logged out")
                } else {
                    return reject()
                }
            })
            .catch((err)=>{reject(err)})
        })
    }

    const getUser = () => {
        const cookies = new Cookies();
        let user = cookies.get('account')
        if (user) {
            return user
        }
        return null;
    }

    return (  
        <AuthContext.Provider value={{ getUser, isAuthenticated, protectedAction, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};
 
export default AuthContext;