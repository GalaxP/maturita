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
import GetAvatar, { GetCommunityAvatar, getStringAvatar } from "helpers/getAvatar";
import prettyDate from "helpers/dateFormat";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../components/ui/tooltip";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "./ui/dialog";
import { Progress } from "./ui/progress";
import { Badge } from "./ui/badge";

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
    const [votes, setVotes] = useState<any>({votes_likes: props.votes_likes, votes_dislikes: props.votes_dislikes, user_vote: props.user_vote})
    const [isVoting, setIsVoting] = useState(false)
    const [confirmOpen, setConfirmOpen] = useState(false)
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

    const openConfirmBox = () => {
        setConfirmOpen(true)
    }

    const deletePost = () => {
        if(!props._id) return
        grecaptcha.ready(function() {
            grecaptcha.execute(process.env.REACT_APP_RECAPTCHA_SITE_KEY, {action: 'delete'}).then(function(token:string) {
                post_data("/post/"+props._id+"/delete", {token: token}, {}, true).then((res)=>{
                    toast({
                        variant: "default",
                        title: "successfully deleted your post.",
                    })
                    setConfirmOpen(false)
                    if(window.location.pathname.includes("post")) navigate("/")
                    window.location.reload()
                })
                .catch(()=>{
                    toast({
                        variant: "destructive",
                        title: "Uh oh! Something went wrong.",
                    })
                    setConfirmOpen(false)
                })
            })
        })
    }
    
    const contrastingColor = (hex: string) => {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        if ((r*0.299 + g*0.587 + b*0.114) > 186 ) {
            return "black"
        }
        return "white"
    }

    var width_class = `${width ? width : "w-11/12 lg:w-[700px] sm:w-11/12"} mx-auto`;
    return <>
        <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Are you sure you want to delete your post?</DialogTitle>
                    <DialogDescription>
                        This action cannot be reversed.
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <DialogClose asChild>
                        <Button type="submit" variant={"secondary"}>Cancel</Button>
                    </DialogClose>
                    <Button type="submit" onClick={deletePost}>Yes</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>

        <Card className={width_class + (showLinkToPost?" cursor-pointer":"")} onClick={redirect}>
            <CardHeader className="pb-0">
                <CardDescription className="flex flex-row text-center items-center center">
                    {showCommunity&& <><Avatar className="shadow-md cursor-pointer w-[20px] h-[20px] inline-block mr-1">
                            <AvatarImage src={GetCommunityAvatar(props.community.avatar)} alt="@shadcn" />
                            <AvatarFallback>AVATAR</AvatarFallback>
                        </Avatar>
                        <Link to={"/community/"+props.community.name} className="hover:underline py-auto text-black flex-inline flex-row" key={props._id+ "community"}>
                    {props.community.name}</Link>
                <span className="dot-separator mx-1"></span></>}

                {!showCommunity&& <><Avatar className="shadow-md cursor-pointer w-[20px] h-[20px] inline-block mr-1">
                            <AvatarImage src={getStringAvatar(props.author.avatar, props.author.provider)} alt="@shadcn" />
                            <AvatarFallback>AVATAR</AvatarFallback>
                        </Avatar>
                    </>}

                    <Link to={"/user/"+props.author.id} className="hover:underline" key={props._id+" user"}>{props.author.displayName}</Link> 
                    
                <span className="dot-separator mx-1"></span>
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
                    {props.tag && <Badge className="h-5 ml-1 text-center hidden sm:block text-white" style={{backgroundColor: props.tag.color, color: contrastingColor(props.tag.color)}} variant={"secondary"}>{props.tag.name}</Badge>}

                </CardDescription>
                {props.tag && <Badge className="h-5 w-max text-center block sm:hidden text-white" style={{backgroundColor: props.tag.color, color: contrastingColor(props.tag.color)}} variant={"secondary"}>{props.tag.name}</Badge>}
                {!showLinkToPost &&<Link to={"/user/"+props.author.id} className="hover:underline sm:hidden block text-xs text-primary">u/{props.author.displayName}</Link>}

                <CardTitle>{props.title}</CardTitle>
                <p className="break-words whitespace-pre-line">{props.body}</p>
                  
            </CardHeader>
            <CardContent className="pt-2 pb-4">
                <div className="flex flex-row content-center space-x-1">
                    <VoteButton type="like" votes={votes.votes_likes} current_vote={votes.user_vote} onClick={vote} loading={isVoting}/>
                    <VoteButton type="dislike" votes={votes.votes_dislikes} current_vote={votes.user_vote} onClick={vote} loading={isVoting}/>
                    {showLinkToPost && <Button variant="ghost" className="px-2">
                        <AiOutlineComment size={20} className="mr-1"/>
                        {props.comment_length}
                    </Button>}
                    { auth?.isAuthenticated && auth?.getUser() && auth?.getUser().user.uid === props.author.id &&
                    <Button variant="ghost" className="px-2" onClick={openConfirmBox}>
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