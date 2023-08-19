import axios from "axios";
import { FunctionComponent, createContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { post_data } from "../../helpers/api";
import { AuthContextProviderProps, AuthContextType, IAuth } from "../../schemas/authSchema";
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
    const cookies = new Cookies();

    const login = async (credentials: IAuth) => {
    post_data("/account/login", credentials, {withCredentials:false})
    .then((res)=>{
        if(res.status===200)
        {
            cookies.set('account', JSON.stringify(res.data.user), { 
                path:"/",
                sameSite: false,
                httpOnly: false,
                secure: false
            })
            setUser(res.data.user);
        }
    })
    .catch((err)=>{})}

    return (  
        <AuthContext.Provider value={{ user, login }}>
            {children}
        </AuthContext.Provider>
    );
};
 
export default AuthContext;