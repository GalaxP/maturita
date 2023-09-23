import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar"
import { Button } from "../components/ui/button"
import { MessageSquare } from 'lucide-react';
import { VoteButton } from "./voteButton";
import { Reply } from "./reply";
import { useContext, useState } from "react";
import AuthContext from "contexts/AuthContext";
import { useNavigate } from "react-router-dom";

export interface IComment {
    _id: string,
    author: string,
    body: string,
    votes_likes: number,
    votes_dislikes: number,
    user_vote?: number,
    createdAt: Date,
    offset: number,
    onReply: (id:string, replyBody: string) => void,
}

const Comment = (comment: IComment) => {
    const [showReply, setShowReply] = useState(false)
    const auth = useContext(AuthContext);
    const navigate = useNavigate();

    return <>
    <div className="flex flex-row mt-2" style={{paddingLeft: comment.offset*3.5+"rem"}}>
        <Avatar className="mt-2">
            <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
            <AvatarFallback>CN</AvatarFallback>
        </Avatar>
        <div className="ml-2">
            <span className="text-sm pl-2">{comment.author}</span>
            <div className="inline-block"><span className="text-sm text-muted-foreground pl-2">{comment.createdAt.toString()}</span></div>
            
            <span className="text-sm pl-2 block">{comment.body}</span>
            <div className="flex flex-row content-center space-x-1 pl-2 items-center">
                <VoteButton type="like" current_vote={comment.user_vote} votes={comment.votes_likes} onClick={()=>{}}/>
                <VoteButton type="dislike" current_vote={comment.user_vote} votes={comment.votes_dislikes} onClick={()=>{}}/>
                <Button variant="ghost" className="m-1" onClick={()=> {if(auth?.isAuthenticated) {setShowReply(r => !r)} else {navigate("/account/login")}}}>
                    <MessageSquare strokeWidth={1.5} size={20} className="mr-1"/>
                    Reply
                </Button>
            </div>
            {showReply && <Reply submitReply={(e)=>comment.onReply(comment._id, e)}/>}
        </div>
    </div>
        
    </>
}

export default Comment