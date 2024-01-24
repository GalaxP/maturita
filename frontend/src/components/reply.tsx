import { useContext, useState } from "react"
import { Button } from "./ui/button"
import { Textarea } from "./ui/textarea"
import CharacterCounter from "./characterCounter"

interface IReply {
    submitReply: (replaceBody: string) => void
}
export const Reply = ({submitReply}: IReply) => {
    const [reply, setReply] = useState("")

    return <>
        <div>
            <Textarea value={reply} onChange={e => setReply(e.target.value)} placeholder={"Type your reply here."}/>
            <Button className="w-20 " onClick={()=> submitReply(reply)}>Comment</Button>
        </div>
    </>
}