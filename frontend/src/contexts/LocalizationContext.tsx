import { createContext, useState } from "react";
import { post_data, setAccessToken } from "../helpers/api";
import { AuthContextProviderProps, AuthContextType, IAuth } from "../schemas/authSchema";
import Cookies from 'universal-cookie';
import { languageKey, table, textKey } from "helpers/localTable";
 
export type LocalizationContextType = {
    localize: (property:textKey) => string
    getLocale: () => string
    setLocaleCookie: (locale: "en" | "sk") => void
}
const LocalizationContext = createContext<LocalizationContextType>({localize: ()=>"", getLocale: ()=>"", setLocaleCookie: ()=>{}});
 
export const LocalizationContextProvider = ({ children }: AuthContextProviderProps) => {
    const cookies = new Cookies();

    const localize = (property:textKey) => {
        const l:"sk"|"en" = getLocale()
        if(l) return(table[l][property])

        return table[l][property] //default language
    }
    const getLocale = () => {
        const l = cookies.get("locale")
        if(!l) return "en"
        return l
    }
    
    const setLocaleCookie = (locale: "en" | "sk") => {
        cookies.set("locale", locale, {
            maxAge: 60*60*24*365,
            path: "/"
        })
        window.location.reload();
    }

    return (  
        <LocalizationContext.Provider value={{localize, getLocale, setLocaleCookie}}>
            {children}
        </LocalizationContext.Provider>
    );
};
 
export default LocalizationContext;