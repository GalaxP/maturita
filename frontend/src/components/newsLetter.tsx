import { Cookie, Loader2 } from "lucide-react"
import { Button } from "./ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "./ui/card"
import { Link } from "react-router-dom"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "./ui/dialog"
import { Label } from "./ui/label"
import { Input } from "./ui/input"
import { useContext, useEffect, useState } from "react"
import { post_data } from "helpers/api"
import LocalizationContext from "contexts/LocalizationContext"

export const NewsLetter = (toggleNewsletter: {toggleNewsletter: (boolean)}) => {
    const [loaded, setLoaded] = useState(false)
    const [close, setClose] = useState(false)
    const [email, setEmail] = useState("")
    const [error, setError] = useState("")
    const [loading, setLoading] = useState(false)
    const [isSignedUp, setIsSignedUp] = useState(false)
    
    const localeContext = useContext(LocalizationContext)
    useEffect(()=>{
      let delay = toggleNewsletter.toggleNewsletter ? 0 : 5000
      if(toggleNewsletter.toggleNewsletter) {localStorage.removeItem("newsletter"); setClose(false); setLoaded(true);}
        setTimeout(()=>{
            setLoaded(false)
            if(localStorage.getItem("newsletter") === "true") {
                setClose(true)
            }
            
            setLoaded(true)
        }, delay)
    }, [toggleNewsletter])

    const whenClosed = () => {
        localStorage.setItem("newsletter", "true")
        setClose(true)
    }

    const subscribe = (email:string) => {
      if(!email) {
        setError(localeContext.localize("FIELD_REQUIRED"))
        return;
      }
      if((email.match(
        /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
      ))===null){
        setError(localeContext.localize("INVALID_EMAIL"))
        return;
      }
      setError("")
      setLoading(true)
      post_data("/subscribe", {email: email})
      .then(()=>{
        setLoading(false)
        setIsSignedUp(true)
        localStorage.setItem("newsletter", "true")
      })
      .catch((err)=>{
        if(err.response.status === 409) {
          setError(localeContext.localize("NEWSLETTER_ALREADY_SUBCRIBED"))
          setLoading(false)
          return
        }
        setError(localeContext.localize("ERROR_GENERIC"))
      })
      setLoading(false)
    }
    
    return loaded ? <>
        <div className="fixed block bottom-0 right-0 p-4 max-w-[550px]">
        <Dialog defaultOpen={!close} open={!close} onOpenChange={(isOpen)=>{if(!isOpen)whenClosed();}}>

      <DialogContent className="sm:max-w-[425px]" >
        <DialogHeader>
          <DialogTitle>{localeContext.localize("NEWSLETTER_SUBSCRIBE_TITLE")}</DialogTitle>
          <DialogDescription>
            {localeContext.localize("NEWSLETTER_DESCRIPTION")}
          </DialogDescription>
        </DialogHeader>
        <div hidden={isSignedUp}>
          <div className="pt-4">
            <div className="flex items-center align-middle space-x-4">
              <Label htmlFor="name" className="text-right">
                Email
              </Label>
              <Input
                id="email"
                className="col-span-3"
                type="text"
                value={email}
                placeholder="name@example.com"
                onChange={(value)=>setEmail(value.target.value)}
                />
            </div>
            <div className="flex flex-col items-center mt-1">
              <Label className="text-sm font-medium text-destructive" hidden={error===""}>
                {error}
              </Label>
            </div>
          </div>
        </div>
        <div hidden={!isSignedUp}>
          <div className="pt-4">
            <div className="flex items-center align-middle space-x-4">
              {localeContext.localize("NEWSLETTER_SUBSCRIBE_SUCCESS")}
            </div>
          </div>
        </div>
        <DialogFooter hidden={isSignedUp}>
            <Button type="submit" onClick={()=>subscribe(email)}>{localeContext.localize("NEWSLETTER_SUBSCRIBE")}<Loader2 className={loading ? "ml-2 h-4 w-4 animate-spin" : "hidden"} /> </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
    </div>
        
    </> : <></>
}