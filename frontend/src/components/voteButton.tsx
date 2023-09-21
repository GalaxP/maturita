import { AiOutlineDislike, AiOutlineLike, AiFillLike, AiFillDislike } from "react-icons/ai"
import { Button } from "../components/ui/button"


interface IButton {
    type: "like" | "dislike",
    votes: number,
    current_vote?: number
}
export const VoteButton = (props: IButton) => {
    return <>
    <Button variant="ghost" className="px-2">
        {props.type==="like" && (props.current_vote === 1 ? <AiFillLike size={20} className="mr-1"/> : <AiOutlineLike size={20} className="mr-1"/>)}
        {props.type==="dislike" && (props.current_vote === -1 ? <AiFillDislike size={20} className="mr-1"/> : <AiOutlineDislike size={20} className="mr-1"/>)}
        {props.votes}
    </Button>
    </>
}