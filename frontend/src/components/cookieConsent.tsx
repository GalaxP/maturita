import { Cookie} from "lucide-react"
import { Button } from "../components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "../components/ui/card"
import { Link } from "react-router-dom"
import { useEffect, useState } from "react"

export const CookieConsent = () => {
    const [loaded, setLoaded] = useState(false)
    const [consent, setConsent] = useState(false)

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
                <CardTitle className="flex items-center"><Cookie className="inline-block mr-2"/> We use cookies</CardTitle>
            </CardHeader>
            <CardContent>Cookies help us deliver the best experience on our website. By using our website, you agree to the use of cookies. <Link to="/privacy-policy" className="font-semibold border-dotted border-b-2 border-black pb-0.5 hover:border-0">Privacy Policy</Link></CardContent>
            <CardFooter className="justify-end">
                {/* <Button className="font-semibold text-sm mr-2" variant={"secondary"}>Settings</Button> */}
                <Button className="font-semibold" onClick={giveConsent}>Accept</Button>
            </CardFooter>
        </Card>
    </div>: <></>
}