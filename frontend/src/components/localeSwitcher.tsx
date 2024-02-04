import { useContext, useEffect, useState } from "react";
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
        return <div key={lang.name}>
        {lang.name === locale.getLocale() &&<Button variant="ghost" key={lang.name} className="px-2 w-full text-left items-center flex justify-start" onBlur={()=>setTimeout(()=>setLocaleToggle(false),200 )}  onClick={()=>setLocaleToggle(l => !l)}>
        {lang.Flag}
        {lang.text}
        {!localeToggle ? <ChevronDown key={lang.name+" up"} strokeWidth={1.5} color="gray"/> :
        <ChevronUp key={lang.name+" down"} strokeWidth={1.5} color="gray"/>}
        </Button>
        }
        </div>
    })}
    <div key="languages" className={"bg-white absolute shadow-md w-[105px]" + (localeToggle ? " block" : " hidden")}>
        {locales.map((lang, i)=>{
            return <div key={lang.name} >
                {lang.name !== locale.getLocale() &&<Button variant="ghost" key={lang.name+i} className="px-2 w-full text-left items-center flex justify-start" onClick={()=>{localeContext.setLocaleCookie(lang.name); setReRender(true)}}>
                {lang.Flag}  
                {lang.text}
            </Button>
            }
            </div>
        })}
    </div>
    </>
}

export default LocaleSwitcher