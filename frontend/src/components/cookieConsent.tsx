import { Cookie} from "lucide-react"
import { Button } from "../components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "../components/ui/card"
import { Link } from "react-router-dom"
import { useContext, useEffect, useState } from "react"
import LocalizationContext from "contexts/LocalizationContext"

export const CookieConsent = () => {
    const [loaded, setLoaded] = useState(false)
    const [consent, setConsent] = useState(false)
    const localeContext = useContext(LocalizationContext)

    useEffect(()=>{
        setLoaded(false)
        if(localStorage.getItem("consent")=== "true") setConsent(true)
        setLoaded(true)
    })

    const giveConsent = () => {
        localStorage.setItem("consent", "true")
        setConsent(true)
    }
    return loaded && !consent ? <div className="fixed block bottom-0 right-0 p-4 max-w-[550px]">
        <Card className="shadow-lg">
            <CardHeader className="pb-3">
                <CardTitle className="flex items-center"><Cookie className="inline-block mr-2"/> {localeContext.localize("COOKIE_TITLE")}</CardTitle>
            </CardHeader>
            <CardContent>{localeContext.localize("COOKIE_MESSAGE")} <Link to="/privacy-policy" className="font-semibold border-dotted border-b-2 border-black pb-0.5 hover:border-0">{localeContext.localize("PRIVACY_POLICY")}</Link></CardContent>
            <CardFooter className="justify-end">
                {/* <Button className="font-semibold text-sm mr-2" variant={"secondary"}>Settings</Button> */}
                <Button className="font-semibold" onClick={giveConsent}>{localeContext.localize("COOKIE_ACCEPT")}</Button>
            </CardFooter>
        </Card>
    </div>: <></>
}