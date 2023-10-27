import { Cookie} from "lucide-react"
import { Button } from "../components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "../components/ui/card"
import { Link } from "react-router-dom"
import { useEffect } from "react"

export const CookieConsent = () => {
    useEffect(()=>{
        
    })
    return <div className="fixed block bottom-0 right-0 p-4 max-w-[550px]">
        <Card className="shadow-lg">
            <CardHeader className="pb-3">
                <CardTitle className="flex items-center"><Cookie className="inline-block mr-2"/> We use cookies</CardTitle>
                
            </CardHeader>
            <CardContent>Blah Blah some jargon about cookies and how we like totally care about your privacy but in reality we are forced to show this popup. <Link to="/legal/cookies" className="font-semibold border-dotted border-b-2 border-black pb-0.5 hover:border-0">Privacy Policy</Link></CardContent>
            <CardFooter className="justify-end">
                <Button className="w-28 h-14 font-semibold text-sm">Accept</Button>
            </CardFooter>
        </Card>
    </div>
}