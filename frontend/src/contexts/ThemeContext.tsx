import { createContext, useEffect } from "react";
type ThemeContextChildrem = {
    children: JSX.Element
}
type ThemeContextType = {
    setTheme: (arg0: string) => void
    getTheme: () => string
}
export const ThemeContext = createContext<ThemeContextType>({getTheme: ()=>"", setTheme: ()=>{}});

export const ThemeContextProvider = ({children}: ThemeContextChildrem)=> {
    useEffect(()=>{
        setTheme(getTheme())
    }, [])
    const getTheme = () => {
        let theme = localStorage.getItem("theme")
        let systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
        if(!theme) theme = systemTheme
        if(theme === "system") return theme
        if(theme !== "light" && theme !== "dark") theme = systemTheme
        return theme
    }

    const setTheme = (theme: string) => {
        let setTheme = theme
        if(theme === "system") {
            setTheme = "system";
            document.documentElement.className = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
            localStorage.setItem("theme", setTheme)
        } else {
            document.documentElement.className = setTheme
            localStorage.setItem("theme", setTheme)
        }
    }

    return <ThemeContext.Provider value={{setTheme, getTheme}}>
        {children}
    </ThemeContext.Provider>
}