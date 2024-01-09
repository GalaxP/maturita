import { Cookie } from "lucide-react"
import { Button } from "./ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "./ui/card"
import { Link } from "react-router-dom"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "./ui/dialog"
import { Label } from "./ui/label"
import { Input } from "./ui/input"
import { useEffect, useState } from "react"

export const NewsLetter = () => {
    const [loaded, setLoaded] = useState(false)
    const [close, setClose] = useState(false)
    const [email, setEmail] = useState("")

    useEffect(()=>{
        setLoaded(false)
        if(localStorage.getItem("newsletter") === "true") {
            setClose(true)
        }
        
        setLoaded(true)
    }, [])

    const whenClosed = () => {
        localStorage.setItem("newsletter", "true")
    }
    
    return loaded ? <>
        <div className="fixed block bottom-0 right-0 p-4 max-w-[550px]">
        <Dialog defaultOpen={!close} onOpenChange={(isOpen)=>{if(!isOpen)whenClosed();}}>

      <DialogContent className="sm:max-w-[425px]" >
        <DialogHeader>
          <DialogTitle>Subscribe To Our Newsletter!</DialogTitle>
          <DialogDescription>
            Receive exclusive updates, insightful content delivered directly to your inbox
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
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
        </div>
        <DialogFooter>
            <Button type="submit">Subscribe</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
    </div>
        
    </> : <></>
}