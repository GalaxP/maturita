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
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuLabel, DropdownMenuItem, DropdownMenuTrigger} from "../components/ui/dropdown-menu"
import { Badge } from "./ui/badge";
import { Lock, MoreHorizontal, Trash } from "lucide-react";

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
    const [menuOpen, setMenuOpen] = useState(false)

    const [confirmLockOpen, setConfirmLockOpen] = useState(false)
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
                    switch(e.target.ariaDescription) {
                        case "tag":
                            navigate("/community/"+props.community.name+"?tag="+props.tag?.name)
                            break;
                        case "donothing":
                            break;
                        default:
                            navigate("/post/"+props._id)
                        break;
                    }
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
                let z = 20;
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

    const lockOrUnlockPost = () => {
        if(!props._id) return
        post_data("/post/"+props._id+"/"+ (props.locked? "unlock":"lock"), {}, {}, true).then((res)=>{
            toast({
                variant: "default",
                title: "successfully "+(props.locked? "unlocked":"locked")+" your post.",
            })
            setConfirmOpen(false)
            //if(window.location.pathname.includes("post")) navigate("/")
            window.location.reload()
        })
        .catch((err:any)=>{
            console.log(err)
            toast({
                variant: "destructive",
                title: "Uh oh! Something went wrong.",
            })
            setConfirmOpen(false)
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
        <Dialog open={confirmLockOpen} onOpenChange={setConfirmLockOpen}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Are you sure you want to {props.locked ? "Unlock" : "Lock"} this post?</DialogTitle>
                    <DialogDescription>
                        Users will no longer have the ability to add comments or leave a reaction to the post or its comments. This action can be reversed
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <DialogClose asChild>
                        <Button type="submit" variant={"secondary"}>Cancel</Button>
                    </DialogClose>
                    <Button type="submit" onClick={lockOrUnlockPost}>Yes</Button>
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
                        <Link to={"/community/"+props.community.name} className="hover:underline py-auto text-black flex-inline flex-row max-w-[5rem] xs:max-w-none overflow-clip" key={props._id+ "community"}>
                    {props.community.name}</Link>
                    <span className="dot-separator mx-1"></span></>}

                {!showCommunity&& <><Avatar className="shadow-md cursor-pointer w-[20px] h-[20px] inline-block mr-1">
                            <AvatarImage src={getStringAvatar(props.author.avatar, props.author.provider)} alt="@shadcn" />
                            <AvatarFallback>AVATAR</AvatarFallback>
                        </Avatar>
                    </>}

                    <Link to={"/user/"+props.author.id} className="hover:underline max-w-[6rem] xs:max-w-none overflow-clip" key={props._id+" user"}>{props.author.displayName}</Link> 
                    
                    <span className="dot-separator mx-1"></span>
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <>
                                    <div className="hidden xs:block">{prettyDate(new Date(props.createdAt).getTime())} ago</div> 
                                    <div className="block xs:hidden">{prettyDate(new Date(props.createdAt).getTime(), true)} ago</div> 
                                </>
                            </TooltipTrigger>
                            <TooltipContent>
                                {new Date(props.createdAt).toLocaleDateString() + " " + new Date(props.createdAt).toLocaleTimeString()}
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                    {props.tag && <Link to={"/community/"+props.community.name+"?tag="+props.tag?.name}><Badge aria-description="tag" onClick={()=>{navigate("/community/"+props.community.name+"?tag="+props.tag?.name)}} className="h-5 ml-1 text-center hidden sm:block cursor-pointer" style={{backgroundColor: props.tag.color, color: contrastingColor(props.tag.color)}} variant={"secondary"}>{props.tag.name}</Badge></Link>}
                    <div className="ml-auto space-x-2 flex flex-row items-center">

                        {props.locked && 
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Lock className="" size={16} ></Lock>
                                </TooltipTrigger>
                                <TooltipContent>This post has been locked by the moderators of this community</TooltipContent>
                            </Tooltip>
                        </TooltipProvider> }
                        { auth?.isAuthenticated && auth?.getUser() && (auth?.getUser().user.uid === props.author.id || props.author.isMod) && 
                            <DropdownMenu open={menuOpen} onOpenChange={setMenuOpen}>
                                <DropdownMenuTrigger asChild>
                                    <Button className="" size={"ultra_sm"} variant={"ghost"}>
                                        <MoreHorizontal color={"black"} />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent>
                                    <DropdownMenuItem aria-description="donothing" onSelect={()=>{setMenuOpen(false) ;openConfirmBox()}}>
                                        <Trash className="mr-2 h-4 w-4"/>
                                        Delete
                                    </DropdownMenuItem>
                                    { props.author.isMod && 
                                    <DropdownMenuItem aria-description="donothing" onSelect={()=>{setMenuOpen(false) ;setConfirmLockOpen(true)}}>
                                        <Lock className="mr-2 h-4 w-4"/>
                                        {props.locked ? "Unlock" : "Lock"}
                                    </DropdownMenuItem>}
                                </DropdownMenuContent>
                            </DropdownMenu>
                        }
                    </div>
                </CardDescription>
                {props.tag && <Badge aria-description="tag" onClick={()=>{navigate("/community/"+props.community.name+"?tag="+props.tag?.name)}} className="h-5 w-max text-center block sm:hidden cursor-pointer" style={{backgroundColor: props.tag.color, color: contrastingColor(props.tag.color)}} variant={"secondary"}>{props.tag.name}</Badge>}

                <CardTitle>{props.title}</CardTitle>
                <p className="break-words whitespace-pre-line">{props.body}</p>
            </CardHeader>
            <CardContent className="pt-2 pb-4">
                <div className="flex flex-row content-center space-x-1">
                    <VoteButton type="like" votes={votes.votes_likes} current_vote={votes.user_vote} onClick={vote} loading={isVoting || props.locked}/>
                    <VoteButton type="dislike" votes={votes.votes_dislikes} current_vote={votes.user_vote} onClick={vote} loading={isVoting|| props.locked}/>
                    {showLinkToPost && <Button onClick={()=>navigate("/post/"+props._id)} variant="ghost" className="px-2">
                        <AiOutlineComment size={20} className="mr-1"/>
                        {props.comment_length}
                    </Button>}
                </div>
            </CardContent>
        </Card>
    </>
}

export {
    Post,
}