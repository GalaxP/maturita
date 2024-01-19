import { useContext, useEffect, useState } from "react";
import { PostSchema } from "../schemas/postSchema";
import AuthContext from "../contexts/AuthContext";
import { post_data } from "../helpers/api";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../components/ui/card";
import { VoteButton } from "./voteButton";
import { AiOutlineComment, AiOutlineDelete } from "react-icons/ai";
import { Button } from "../components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { useToast } from "./ui/use-toast";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { GetCommunityAvatar } from "helpers/getAvatar";
import prettyDate from "helpers/dateFormat";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../components/ui/tooltip";

declare var grecaptcha:any

interface Iprop {
    props: PostSchema,
    showLinkToPost: boolean,
    width?: string,
    showCommunity?: boolean
}
const Post = ({props, showLinkToPost, width, showCommunity=true}: Iprop) => {
    const auth = useContext(AuthContext)
    //const [likes, setLikes] = useState(0)
    //const [dislikes, setDislikes] = useState(0)
    const [error, setError] = useState()
    const [post, setPost] = useState<PostSchema>({_id: props._id, community: props.community, author: props.author, body: props.body, createdAt: props.createdAt, title: props.title, votes_dislikes: props.votes_dislikes, votes_likes: props.votes_likes, user_vote: props.user_vote, comments: props.comments, comment_length: props.comment_length})
    const [votes, setVotes] = useState<any>({votes_likes: props.votes_likes, votes_dislikes: props.votes_dislikes, user_vote: props.user_vote})
    const [isVoting, setIsVoting] = useState(false)
    const navigate = useNavigate()
    const { toast } = useToast()

    const vote = (direction: number) => {
        var grecaptchaToken = ""
        if(isVoting) return
        setIsVoting(true)
        grecaptcha.ready(function() {
            grecaptcha.execute(process.env.REACT_APP_RECAPTCHA_SITE_KEY, {action: 'action'}).then(function(token:string) {
                grecaptchaToken = token
                
                auth?.protectedAction(()=> {
                    if(direction === 0 && votes.user_vote !== 0) {
                        post_data("/post/action", {postId: props._id, type: "vote", direction: 0, token: grecaptchaToken}, {}, true)
                        .then((res) => {
                            if(res.status===200) {
                                if(votes.user_vote === 1) {
                                    setVotes({...votes, votes_likes: votes.votes_likes-1, user_vote: 0})
                                }
                                else if (votes.user_vote === -1) {
                                    setVotes({...votes, votes_dislikes: votes.votes_dislikes-1, user_vote: 0})
                                }
                            } else {
                                setError(res.data)
                            }
                            setIsVoting(false)
                        })
                        .catch((err)=> {
                            setError(err)
                            setIsVoting(false)
                        })
                    }
                    if(direction === -1) {
                        post_data("/post/action", {postId: props._id, type: "vote", direction: -1, token: grecaptchaToken}, {}, true)
                        .then((res)=> {
                            if(res.status===200) {
                                if(votes.user_vote === 1) {
                                    setVotes({...votes, votes_likes: votes.votes_likes - 1, votes_dislikes: votes.votes_dislikes+1, user_vote: -1})
                                    
                                } else {
                                    setVotes({...votes, votes_dislikes: votes.votes_dislikes + 1, user_vote: -1})
                                }
                            } else {
                                setError(res.data)
                            }
                            setIsVoting(false)
                        })
                        .catch((err)=> {
                            setError(err)
                            setIsVoting(false)
                        })
                    } else if(direction === 1) {
                        post_data("/post/action", {postId: props._id, type: "vote", direction: 1, token: grecaptchaToken}, {}, true)
                        .then((res)=> {
                            if(res.status===200) {
                                if(votes.user_vote===-1) {
                                    setVotes({...votes, votes_likes: votes.votes_likes+1, votes_dislikes: votes.votes_dislikes-1, user_vote: 1})
                                } else {
                                    setVotes({...votes, votes_likes: votes.votes_likes+1, user_vote: 1})
                                }
                            } else {
                                setError(res.data)
                            }
                            setIsVoting(false)
                        })
                        .catch((err)=> {
                            setError(err)
                            setIsVoting(false)
                        })
                    }
                }, ()=> {setIsVoting(false);navigate("/account/login")})
            })
        })
    }

    const redirect = (e:any) => {
        if(e.target.localName!=="path" && e.target.localName!=="svg" && showLinkToPost) {
            switch(e.target.localName) {
                case "button" :
                    break;
                case "a":
                    //console.log(e.target)
                    break;
                default:
                    navigate("/post/"+props._id)
                    break;
            }
        }
    }

    useEffect(()=>{
        if(error) {
            toast({
                variant: "destructive",
                title: "Uh oh! Something went wrong.",
            })
        }
    }, [error])

    var width_class = `${width ? width : "w-11/12 lg:w-[700px] sm:w-11/12"} mx-auto`;
    return <>
        <Card className={width_class + (showLinkToPost?" cursor-pointer":"")} onClick={redirect}>
            <CardHeader className="pb-0">
                <CardDescription className="flex flex-row text-center align-middle">
                    {showCommunity&& <><Avatar className="shadow-md cursor-pointer w-[20px] h-[20px] inline-block mr-1">
                            <AvatarImage src={GetCommunityAvatar(props.community.avatar)} alt="@shadcn" />
                            <AvatarFallback>AVATAR</AvatarFallback>
                        </Avatar>
                        <Link to={"/community/"+props.community.name} className="hover:underline py-auto text-black flex-inline flex-row">
                    {props.community.name}</Link>
                <span className="dot-separator mx-1"></span></>}
                    <Link to={"/user/"+props.author.id} className="hover:underline sm:block hidden">{props.author.displayName}</Link> 
                <span className="dot-separator mx-1 sm:block hidden"></span>
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <div>{prettyDate(new Date(props.createdAt).getTime())} ago</div> 
                            </TooltipTrigger>
                            <TooltipContent>
                                {new Date(props.createdAt).toLocaleDateString() + " " + new Date(props.createdAt).toLocaleTimeString()}
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                </CardDescription>
                {!showLinkToPost &&<Link to={"/user/"+props.author.id} className="hover:underline sm:hidden block text-xs text-primary">u/{props.author.displayName}</Link>}

                <CardTitle>{props.title}</CardTitle>
                <p className="break-words">{props.body}</p>
                  
            </CardHeader>
            <CardContent className="pt-2 pb-4">
                <div className="flex flex-row content-center space-x-1">
                    <VoteButton type="like" votes={votes.votes_likes} current_vote={votes.user_vote} onClick={vote}/>
                    <VoteButton type="dislike" votes={votes.votes_dislikes} current_vote={votes.user_vote} onClick={vote}/>
                    {showLinkToPost && <Button variant="ghost" className="px-2">
                        <AiOutlineComment size={20} className="mr-1"/>
                        {props.comment_length}
                    </Button>}
                    { auth?.isAuthenticated && auth?.getUser().user.uid === props.author.id &&
                    <Button variant="ghost" className="px-2">
                        <AiOutlineDelete size={20} className="mr-1"/>
                        Delete
                    </Button>
                    }

                </div>
            </CardContent>
        </Card>
    </>
}

export {
    Post,
}