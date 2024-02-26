import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar"
import { Button } from "../components/ui/button"
import { MessageSquare, Mic, Mic2 } from 'lucide-react';
import { VoteButton } from "./voteButton";
import { Reply } from "./reply";
import { useContext, useState } from "react";
import AuthContext from "contexts/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import { post_data } from "helpers/api";
import { useToast } from "./ui/use-toast";
import { AiOutlineDelete } from "react-icons/ai";
import InteractiveTextArea from "./interactiveTextArea";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip";
import prettyDate from "helpers/dateFormat";
import CharacterCounter from "./characterCounter";
import { Badge } from "./ui/badge";
import { HiMicrophone } from "react-icons/hi";

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
    showLine?: boolean,
    disbled: boolean
    isOp: boolean
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
    const [reply, setReply] = useState("")
    const [voting, setVoting] = useState(false)
    
    const vote = (dir: number) => {
        if(!auth?.isAuthenticated) return navigate("/account/login")
        setVoting(true)
        grecaptcha.ready(function() {
            grecaptcha.execute(process.env.REACT_APP_RECAPTCHA_SITE_KEY, {action: 'action'}).then(function(token:string) {
                if(votes.user_vote===undefined || votes.user_vote === 0) {
                    post_data("/post/action", {postId: comment._id, type:"comment", direction: dir, token: token}, {}, true)
                    .then(()=> {
                        if(dir === 1) setVotes({...votes, votes_likes: votes.votes_likes+1, user_vote: dir})
                        if(dir === -1) setVotes({...votes, votes_dislikes: votes.votes_dislikes+1, user_vote: dir})
                        setVoting(false)
                    })
                    .catch(()=>{
                        toast({
                            variant: "destructive",
                            title: "Uh oh! Something went wrong.",
                        })
                        setVoting(false)
                    })
                } else if (votes.user_vote === dir) {
                    post_data("/post/action", {postId: comment._id, type:"comment", direction: 0, token: token}, {}, true)
                    .then(()=> {
                        if(votes.user_vote === 1) setVotes({...votes, votes_likes: votes.votes_likes-1, user_vote: 0})
                        else setVotes({...votes, votes_dislikes: votes.votes_dislikes-1, user_vote: 0})
                        setVoting(false)
                    })
                    .catch(()=>{
                        toast({
                            variant: "destructive",
                            title: "Uh oh! Something went wrong.",
                        })
                        setVoting(false)
                    })
                } else {
                    post_data("/post/action", {postId: comment._id, type:"comment", direction: dir, token: token}, {}, true)
                    .then(()=> {
                        if(dir === 1) setVotes({...votes, votes_likes: votes.votes_likes+1, votes_dislikes:votes.votes_dislikes-1, user_vote: dir})
                        else setVotes({...votes, votes_likes: votes.votes_likes-1, votes_dislikes:votes.votes_dislikes+1, user_vote: dir})
                        setVoting(false)
                    })
                    .catch(()=>{
                        toast({
                            variant: "destructive",
                            title: "Uh oh! Something went wrong.",
                        })
                        setVoting(false)
                    })
                }
            });
        });
    }
    return <>
    <div className="flex flex-row mt-2" style={{paddingLeft: comment.offset*/*40*/0+"px"}}>
        <div className="flex flex-col">
            <Avatar className="mt-2 shadow-md cursor-pointer">
                <AvatarImage src={comment.author.avatar===null ? process.env.REACT_APP_API_URL+"/avatar.png" : comment.author.avatar?.search("googleusercontent") !== -1 ? comment.author.avatar : process.env.REACT_APP_API_URL + comment.author.avatar} alt="@shadcn" />
                <AvatarFallback>CN</AvatarFallback>
            </Avatar>
            {comment.showLine && <div className="w-[2px] h-full bg-gray-200" style={{marginLeft: /*40*/18+"px"}}></div> }
        </div>
        <div className="ml-2 w-full">
            
            <div className="flex flex-row items-center">
                <Link to={"/user/"+comment.author.id}><span className="text-sm pl-2">{comment.author.displayName}</span></Link>
                <span className="text-sm text-muted-foreground pl-2">
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <>{prettyDate(new Date(comment.createdAt).getTime())} ago</>
                            </TooltipTrigger>
                            <TooltipContent>
                                {new Date(comment.createdAt).toLocaleDateString() + " " + new Date(comment.createdAt).toLocaleTimeString()}
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                </span>
                { comment.isOp && <Badge className="h-5 ml-1 text-center" variant={"outline"}>Original Poster</Badge> }
            </div>
            
            <span className="text-sm pl-2 block break-words whitespace-pre-line mt-1">{comment.body}</span>
            <div className="flex flex-row content-center space-x-1 pl-2 items-center">
                <VoteButton type="like" current_vote={votes.user_vote} votes={votes.votes_likes} onClick={()=>vote(1)} loading={voting || comment.disbled}/>
                <VoteButton type="dislike" current_vote={votes.user_vote} votes={votes.votes_dislikes} onClick={()=>vote(-1)} loading={voting || comment.disbled}/>
                {!comment.disbled && <Button variant="ghost" className="m-1" onClick={()=> {if(auth?.isAuthenticated) {setShowReply(r => !r)} else {navigate("/account/login")}}}>
                    <MessageSquare strokeWidth={1.5} size={20} className="mr-1"/>
                    Reply
                </Button>}
            </div>
            {showReply && <InteractiveTextArea id={"textarea"+comment._id} disabled={comment.disbled} buttonText="Reply" comment={reply} isAuthenticated={auth?.isAuthenticated} setComment={(e) => setReply(e)} submitComment={()=>comment.onReply(comment._id, reply)} placeholder="Type your reply here." />}
        </div>
    </div>
        
    </>
}

export default Comment