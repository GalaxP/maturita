import { AiOutlineDislike, AiOutlineLike } from "react-icons/ai"
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar"
import { Button } from "../components/ui/button"
import { MessageSquare } from 'lucide-react';
import { VoteButton } from "./voteButton";

interface IComment {
    author: string,
    body: string,
    votes_likes: number,
    votes_dislikes: number,
    user_vote?: number,
    createdAt: Date
}
const Comment = (comment: IComment) => {
    return <>
    <div className="flex flex-row mt-2">
        <Avatar className="mt-2">
            <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
            <AvatarFallback>CN</AvatarFallback>
        </Avatar>
        <div className="ml-2">
            <span className="text-sm pl-3">{comment.author}</span>
            <div className="inline-block"><span className="text-sm text-muted-foreground pl-2">{comment.createdAt.toUTCString()}</span></div>
            
            <span className="text-sm pl-3 block">{comment.body}</span>
            <div className="flex flex-row content-center space-x-1 pl-3 mt-1 items-center">
                <VoteButton type="like" current_vote={comment.user_vote} votes={comment.votes_likes}/>
                <VoteButton type="dislike" current_vote={comment.user_vote} votes={comment.votes_dislikes}/>
                <Button variant="ghost" className="m-1">
                    <MessageSquare strokeWidth={1.5} size={20} className="mr-1"/>
                    Reply
                </Button>
            </div>

        </div>
    </div>
        
    </>
}

export default Comment