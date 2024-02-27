import { ChevronDown } from "lucide-react"
import { Button } from "./button"
import { cn } from "./lib/utils"

interface props {
    Icon: JSX.Element,
    Text: string,
    Class : string,
    children: any
}
const AddButton = (props: props) => {
    return <Button role="combobox" variant={"round_outline"} className={cn(props.Class, "font-semibold")} onClick={(e)=>{e.preventDefault()}}>
            <div className="mr-2">
                {props.Icon}
            </div>
            {props.Text}
            {props.children}
            <ChevronDown strokeWidth={1.3} className="ml-2"></ChevronDown>
        </Button>
}
 
export { AddButton }