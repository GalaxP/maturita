import { Cookie} from "lucide-react"
import { Button } from "../components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "../components/ui/card"
import { Link } from "react-router-dom"
import { useEffect, useState } from "react"
import Cookies from 'universal-cookie';

export const CookieConsent = () => {
    const cookies = new Cookies();
    const [loaded, setLoaded] = useState(false)
    const [consent, setConsent] = useState(false)

    useEffect(()=>{
        setLoaded(false)
        if(cookies.get("consent")) setConsent(true)
        setLoaded(true)
    })

    const giveConsent = () => {
        cookies.set("consent", true, {maxAge: 60 * 60* 24 * 365})
        setConsent(true)
    }
    return loaded && !consent ? <div className="fixed block bottom-0 right-0 p-4 max-w-[550px]">
        <Card className="shadow-lg">
            <CardHeader className="pb-3">
                <CardTitle className="flex items-center"><Cookie className="inline-block mr-2"/> We use cookies</CardTitle>
            </CardHeader>
            <CardContent>Blah Blah some jargon about cookies and how we like totally care about your privacy but in reality we are forced to show this popup. <Link to="/legal/cookies" className="font-semibold border-dotted border-b-2 border-black pb-0.5 hover:border-0">Privacy Policy</Link></CardContent>
            <CardFooter className="justify-end">
                <Button className="font-semibold text-sm mr-2" variant={"secondary"}>Settings</Button>
                <Button className="font-semibold" onClick={giveConsent}>Accept</Button>
            </CardFooter>
        </Card>
    </div>: <></>
}