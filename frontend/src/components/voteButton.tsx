import { AiOutlineDislike, AiOutlineLike, AiFillLike, AiFillDislike } from "react-icons/ai"
import { Button } from "../components/ui/button"


interface IButton {
    type: "like" | "dislike",
    votes: number,
    onClick: (dir: number) => void
    current_vote?: number,
}

export const VoteButton = (props: IButton) => {
    var new_vote = 0
    if(props.type==="like") if(props.current_vote === 1) new_vote = 0; else new_vote = 1
    if(props.type==="dislike") if(props.current_vote === -1) new_vote = 0; else new_vote = -1
    
    return <>
    <Button variant="ghost" className="px-2" onClick={()=>props.onClick(new_vote)}>
        {props.type==="like" && (props.current_vote === 1 ? <AiFillLike size={20} className="mr-1"/> : <AiOutlineLike size={20} className="mr-1"/>)}
        {props.type==="dislike" && (props.current_vote === -1 ? <AiFillDislike size={20} className="mr-1"/> : <AiOutlineDislike size={20} className="mr-1"/>)}
        {props.votes}
    </Button>
    </>
}