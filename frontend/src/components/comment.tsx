import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar"
import { Button } from "../components/ui/button"
import { MessageSquare } from 'lucide-react';
import { VoteButton } from "./voteButton";
import { Reply } from "./reply";
import { useContext, useState } from "react";
import AuthContext from "contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { post_data } from "helpers/api";
import { useToast } from "./ui/use-toast";

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
    onClick: (type: "like" | "dislike", user_vote?: number) => void
}

interface IVote {
    user_vote?: number, 
    votes_likes: number,
    votes_dislikes: number,
}

const Comment = (comment: IComment) => {
    const [showReply, setShowReply] = useState(false)
    const [votes, setVotes] = useState<IVote>({user_vote:comment.user_vote, votes_likes:comment.votes_likes, votes_dislikes: comment.votes_dislikes})
    const auth = useContext(AuthContext);
    const navigate = useNavigate();
    const { toast } = useToast()
    
    const vote = (dir: number) => {
        if(votes.user_vote===undefined || votes.user_vote === 0) {
            post_data("/post/action", {postId: comment._id, type:"comment", direction: dir}, {}, true)
            .then(()=> {
                if(dir === 1) setVotes({...votes, votes_likes: votes.votes_dislikes+1, user_vote: dir})
                if(dir === -1) setVotes({...votes, votes_dislikes: votes.votes_dislikes+1, user_vote: dir})
            })
            .catch(()=>{
                toast({
                    variant: "destructive",
                    title: "Uh oh! Something went wrong.",
                    description: "There was a problem with your request.",
                })
            })
        } else if (votes.user_vote === dir) {
            post_data("/post/action", {postId: comment._id, type:"comment", direction: 0}, {}, true)
            .then(()=> {
                if(votes.user_vote === 1) setVotes({...votes, votes_likes: votes.votes_likes-1, user_vote: 0})
                else setVotes({...votes, votes_dislikes: votes.votes_dislikes-1, user_vote: 0})
            })
            .catch(()=>{
                toast({
                    variant: "destructive",
                    title: "Uh oh! Something went wrong.",
                    description: "There was a problem with your request.",
                })
            })
        } else {
            post_data("/post/action", {postId: comment._id, type:"comment", direction: dir}, {}, true)
            .then(()=> {
                if(dir === 1) setVotes({...votes, votes_likes: votes.votes_likes+1, votes_dislikes:votes.votes_dislikes-1, user_vote: dir})
                else setVotes({...votes, votes_likes: votes.votes_likes-1, votes_dislikes:votes.votes_dislikes+1, user_vote: dir})
            })
            .catch(()=>{
                toast({
                    variant: "destructive",
                    title: "Uh oh! Something went wrong.",
                    description: "There was a problem with your request.",
                })
            })
        }
    }

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
                <VoteButton type="like" current_vote={votes.user_vote} votes={votes.votes_likes} onClick={()=>vote(1)}/>
                <VoteButton type="dislike" current_vote={votes.user_vote} votes={votes.votes_dislikes} onClick={()=>vote(-1)}/>
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