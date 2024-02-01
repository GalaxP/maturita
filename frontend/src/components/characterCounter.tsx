import { useEffect, useState } from "react"
import CircularProgress from "./ui/circularProgress"

type props = {
    characterLimit: number,
    currentLength: number,
    showAt: number,
    className?: string
}
const CharacterCounter = (props:props) => {
    const [progress, setProgress] = useState(0)
    useEffect(()=> {
        setProgress((props.characterLimit - props.currentLength)/props.showAt*100)
    }, [props.currentLength])

    return props.characterLimit - props.currentLength <= props.showAt ? 
    <div className={props.className+" flex flex-row space-x-2 items-center"}>
        <CircularProgress progress={progress}/>
        <p className={props.characterLimit - props.currentLength < 0 ? "text-destructive " : ""}>{props.characterLimit - props.currentLength}</p>
    </div>
    : <></>
}
export default CharacterCounter