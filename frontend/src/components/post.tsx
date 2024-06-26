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
import { AspectRatio } from "./ui/aspect-ratio";
import LocalizationContext from "contexts/LocalizationContext";
import { Skeleton } from "./ui/skeleton";

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
    const [imageLoading, setImageLoading] = useState(true)

    const localeContext = useContext(LocalizationContext)

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
    }, [error, imageLoading])

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
                    <DialogTitle>{localeContext.localize("DELETE_CONFIRM")}</DialogTitle>
                    <DialogDescription>
                        {localeContext.localize("DELETE_CONFIRM_TEXT")}
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <DialogClose asChild>
                        <Button type="submit" variant={"secondary"}>{localeContext.localize("CANCEL")}</Button>
                    </DialogClose>
                    <Button type="submit" onClick={deletePost}>{localeContext.localize("CONTINUE")}</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
        <Dialog open={confirmLockOpen} onOpenChange={setConfirmLockOpen}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{localeContext.localize("LOCK_CONFIRM").replace("ACTION", props.locked ? localeContext.localize("LOCK_ACTION_UNLOCK") : localeContext.localize("LOCK_ACTION_LOCK"))}</DialogTitle>
                    <DialogDescription>
                        {localeContext.localize("LOCK_CONFIRM_TEXT")}
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <DialogClose asChild>
                        <Button type="submit" variant={"secondary"}>{localeContext.localize("CANCEL")}</Button>
                    </DialogClose>
                    <Button type="submit" onClick={lockOrUnlockPost}>{localeContext.localize("CONTINUE")}</Button>
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
                        <Link to={"/community/"+props.community.name} className="text-accent-foreground hover:underline py-auto flex-inline flex-row max-w-[5rem] xs:max-w-none overflow-clip" key={props._id+ "community"}>
                    {props.community.name}</Link>
                    <span className="dot-separator mx-1"></span></>}

                {!showCommunity&& <><Avatar className="shadow-md cursor-pointer w-[20px] h-[20px] inline-block mr-1">
                            <AvatarImage src={getStringAvatar(props.author.avatar, props.author.provider)} alt="@shadcn" />
                            <AvatarFallback>AVATAR</AvatarFallback>
                        </Avatar>
                    </>}

                    <Link to={"/user/"+props.author.id} className="hover:underline max-w-[6rem] xs:max-w-none overflow-clip " key={props._id+" user"}>{props.author.displayName}</Link> 
                    
                    <span className="dot-separator mx-1"></span>
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <>
                                    <div className="hidden xs:block">{localeContext.getLocale()==="sk"  && localeContext.localize("AGO")} {prettyDate(new Date(props.createdAt).getTime(), localeContext)} {localeContext.getLocale()!=="sk"  && localeContext.localize("AGO")}</div> 
                                    <div className="block xs:hidden">{localeContext.getLocale()==="sk"  && localeContext.localize("AGO")} {prettyDate(new Date(props.createdAt).getTime(), localeContext, true)} {localeContext.getLocale()!=="sk"  && localeContext.localize("AGO")}</div> 
                                </>
                            </TooltipTrigger>
                            <TooltipContent>
                                {new Date(props.createdAt).toLocaleDateString() + " " + new Date(props.createdAt).toLocaleTimeString()}
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                    {props.tag && <Link to={"/community/"+props.community.name+"?tag="+props.tag?.name}><Badge aria-description="tag" onClick={()=>{navigate("/community/"+props.community.name+"?tag="+props.tag?.name)}} className="h-5 ml-1 text-center hidden sm:flex cursor-pointer" style={{backgroundColor: props.tag.color, color: contrastingColor(props.tag.color)}} variant={"secondary"}>{props.tag.name}</Badge></Link>}
                    <div className="ml-auto space-x-2 flex flex-row items-center">

                        {props.locked && 
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Lock className="" size={16} ></Lock>
                                </TooltipTrigger>
                                <TooltipContent>{localeContext.localize("LOCKED_DESCRIPTION")}</TooltipContent>
                            </Tooltip>
                        </TooltipProvider> }
                        { auth?.isAuthenticated && auth?.getUser() && (auth?.getUser().user.uid === props.author.id || props.author.isMod || auth?.isUserAdmin()) && 
                            <DropdownMenu open={menuOpen} onOpenChange={setMenuOpen}>
                                <DropdownMenuTrigger asChild>
                                    <Button className="" size={"ultra_sm"} variant={"ghost"}>
                                        <MoreHorizontal  />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent>
                                    { (props.author.isMod || auth?.isUserAdmin()) && 
                                    <DropdownMenuItem aria-description="donothing" onSelect={()=>{setMenuOpen(false) ;setConfirmLockOpen(true)}}>
                                        <Lock className="mr-2 h-4 w-4"/>
                                        {props.locked ? localeContext.localize("UNLOCK") : localeContext.localize("LOCK")}
                                    </DropdownMenuItem>}
                                    <DropdownMenuItem aria-description="donothing" onSelect={()=>{setMenuOpen(false) ;openConfirmBox()}}>
                                        <Trash className="mr-2 h-4 w-4"/>
                                        {localeContext.localize("DELETE")}
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        }
                    </div>
                </CardDescription>
                {props.tag && <Badge aria-description="tag" onClick={()=>{navigate("/community/"+props.community.name+"?tag="+props.tag?.name)}} className="h-5 w-max text-center flex sm:hidden cursor-pointer" style={{backgroundColor: props.tag.color, color: contrastingColor(props.tag.color)}} variant={"secondary"}>{props.tag.name}</Badge>}

                <CardTitle>{props.title}</CardTitle>
                
                {
                    props.photos && props.photos.length > 0 &&
                    <>
                        {imageLoading && <Skeleton className="w-full h-full aspect-[0.9] object-contain max-h-[450px]"></Skeleton>}
                    
                        <div aria-description="donothing" className={"aspect-[0.9] object-contain max-h-[450px] bg-accent cursor-pointer "+(imageLoading ? "hidden" : "")} style={{marginTop: "1rem"}}>
                            <a aria-description="donothing" href={props.photos[0]} target="_blank">
                                
                                <img onLoad={()=>{setImageLoading(false)}} aria-description="donothing" className="aspect-square w-full max-h-[450px] object-contain h-full " src={props.photos[0]} onError={(e:any)=>{e.target.src=process.env.REACT_APP_API_URL+"/cdn/404.png"}}/>
                            </a>
                        </div>

                    </>
                }
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