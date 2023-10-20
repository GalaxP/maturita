import { useContext, useEffect, useState } from "react";
import { useLocalization } from "hooks/useLocalization";
import LocalizationContext from "contexts/LocalizationContext";
import { ChevronDown, ChevronUp } from "lucide-react";
import { locales } from "helpers/localTable";
import { Button } from "./ui/button"

const LocaleSwitcher = () => {
    const locale = useContext(LocalizationContext);
    const [localeToggle, setLocaleToggle] = useState(false)
    const [reRender, setReRender] = useState(false)
    const localeContext = useContext(LocalizationContext)

    useEffect(()=>{
        setLocaleToggle(false)
        setReRender(false)
    }, [window.location.href, reRender])


    return <>{locales.map((lang)=>{
        return <>
        {lang.name === locale.getLocale() &&<Button variant="ghost" key={lang.name} className="pr-1" onClick={()=>setLocaleToggle(l => !l)}>
        {lang.text}
        {!localeToggle ? <ChevronDown strokeWidth={1.5} color="gray"/> :
        <ChevronUp strokeWidth={1.5} color="gray"/>}
        </Button>
        }
        </>
    })}
    <div className={"bg-white absolute shadow-md w-24" + (localeToggle ? " block" : " hidden")}>
        {locales.map((lang)=>{
            return <>
            {lang.name !== locale.getLocale() &&<Button key={lang.name} variant="ghost" className="pr-1 block w-full text-left" onClick={()=>{localeContext.setLocaleCookie(lang.name); setReRender(true)}}>
            {lang.text}
            </Button>
            }
            </>
        })}
    </div>
    </>
}

export default LocaleSwitcher