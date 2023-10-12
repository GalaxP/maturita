import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar"
import { Button } from "../components/ui/button"
import { MessageSquare } from 'lucide-react';
import { VoteButton } from "./voteButton";
import { Reply } from "./reply";
import { useContext, useState } from "react";
import AuthContext from "contexts/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import { post_data } from "helpers/api";
import { useToast } from "./ui/use-toast";
import { AiOutlineDelete } from "react-icons/ai";

declare var grecaptcha:any

export interface IComment {
    _id: string,
    author: {id: string, displayName:string, avatar:string},
    body: string,
    votes_likes: number,
    votes_dislikes: number,
    user_vote?: number,
    createdAt: Date,
    offset: number,
    onReply: (id:string, replyBody: string) => void,
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
        if(!auth?.isAuthenticated) return navigate("/account/login")

        grecaptcha.ready(function() {
            grecaptcha.execute(process.env.REACT_APP_RECAPTCHA_SITE_KEY, {action: 'action'}).then(function(token:string) {
                if(votes.user_vote===undefined || votes.user_vote === 0) {
                    post_data("/post/action", {postId: comment._id, type:"comment", direction: dir, token: token}, {}, true)
                    .then(()=> {
                        if(dir === 1) setVotes({...votes, votes_likes: votes.votes_likes+1, user_vote: dir})
                        if(dir === -1) setVotes({...votes, votes_dislikes: votes.votes_dislikes+1, user_vote: dir})
                    })
                    .catch(()=>{
                        toast({
                            variant: "destructive",
                            title: "Uh oh! Something went wrong.",
                        })
                    })
                } else if (votes.user_vote === dir) {
                    post_data("/post/action", {postId: comment._id, type:"comment", direction: 0, token: token}, {}, true)
                    .then(()=> {
                        if(votes.user_vote === 1) setVotes({...votes, votes_likes: votes.votes_likes-1, user_vote: 0})
                        else setVotes({...votes, votes_dislikes: votes.votes_dislikes-1, user_vote: 0})
                    })
                    .catch(()=>{
                        toast({
                            variant: "destructive",
                            title: "Uh oh! Something went wrong.",
                        })
                    })
                } else {
                    post_data("/post/action", {postId: comment._id, type:"comment", direction: dir, token: token}, {}, true)
                    .then(()=> {
                        if(dir === 1) setVotes({...votes, votes_likes: votes.votes_likes+1, votes_dislikes:votes.votes_dislikes-1, user_vote: dir})
                        else setVotes({...votes, votes_likes: votes.votes_likes-1, votes_dislikes:votes.votes_dislikes+1, user_vote: dir})
                    })
                    .catch(()=>{
                        toast({
                            variant: "destructive",
                            title: "Uh oh! Something went wrong.",
                        })
                    })
                }
            });
        });
    }
    return <>
    <div className="flex flex-row mt-2" style={{paddingLeft: comment.offset*3.5+"rem"}}>
        <Avatar className="mt-2 shadow-md cursor-pointer">
            <AvatarImage src={comment.author.avatar===null ? process.env.REACT_APP_API_URL+"/avatar.png" : comment.author.avatar} alt="@shadcn" />
            <AvatarFallback>CN</AvatarFallback>
        </Avatar>
        <div className="ml-2 w-full">
            <Link to={"/user/"+comment.author.id}><span className="text-sm pl-2">{comment.author.displayName}</span></Link>
            
            <div className="inline-block"><span className="text-sm text-muted-foreground pl-2">{new Date(comment.createdAt.toString()).toLocaleString()}</span></div>
            
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