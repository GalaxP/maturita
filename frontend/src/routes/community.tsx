import { Post } from "components/post";
import AuthContext from "contexts/AuthContext";
import { get_data, post_data } from "helpers/api";
import { useDocumentTitle } from "hooks/setDocuemntTitle";
import { useContext, useEffect, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { PostSchema } from "schemas/postSchema";
import { Button } from "../components/ui/button"
import { ArrowBigUp, ArrowDownWideNarrowIcon, BadgePlus, Check, ChevronDown, Cross, Pencil, PlusCircle, Shield, Tag, Users, X } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import CreatePost from "components/createPost";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../components/ui/card";
import { useToast } from "../components/ui/use-toast"
import GetAvatar, { GetCommunityAvatar } from "helpers/getAvatar";
import { ChangeAvatar } from "components/changeAvatar";
import { NoPosts } from "components/noPosts";
import HomeSkeleton from "components/skeleton/home";
import { Badge } from "components/ui/badge";
import { Dialog, DialogContent, DialogHeader } from "../components/ui/dialog";
import { DialogTrigger } from "components/ui/dialog";
import { CreateTagForm } from "components/forms/createTagForm";
import { AddModeratorForm } from "components/forms/addModsForm";
import {   AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger } from "components/ui/alert-dialog"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
    } from "components/ui/popover"
import {
        Command,
        CommandDialog,
        CommandEmpty,
        CommandGroup,
        CommandInput,
        CommandItem,
        CommandList,
        CommandSeparator,
        CommandShortcut,
      } from "components/ui/command"
import { cn } from "../components/ui/lib/utils";
      

const Community = ({about}: {about?:boolean}) => {
    const community_name = useParams().community;
    const [searchParams] = useSearchParams();
    const [loaded, setLoaded] = useState(false);
    const [posts, setPosts] = useState<PostSchema[]>([{author:{id:"",displayName:"", avatar:"", provider: ""}, locked: false, title:"", createdAt: new Date(), body:"", _id:"", community: {name:"", avatar:""}, votes_likes:0, votes_dislikes:0, user_vote:0, comments:[], comment_length :0}]);
    const [error, setError] = useState("");
    const [communityInfo, setCommunityInfo] = useState({description: "", members: 0, tags: [{name: "", color:""}], moderators: [{uid: "", displayName:"", avatar: "", provider: ""}], isModerator:false, isMember: false, avatar: ""})
    const [documentTitle, setDocumentTitle] = useDocumentTitle("")
    const [sortBy, setSortBy] = useState<{type:"newest" | "best", timeFrame: "alltime" | "day" | "week" | "month" | "year"}>({type: "newest", timeFrame: "day"})
    const navigate = useNavigate();
    const { toast } = useToast()
    const [sortToggle, setSortToggle] = useState(false)
    const [tagLoading, setTagLoading] = useState(false)
    const [moderatorLoading, setModeratorLoading] = useState(false)
    const [refresh, setRefresh] = useState(0)
    const [mod, setMod] = useState<{id: string, displayName: string}>({id:"", displayName:""})
    const [confirm, setConfirm] = useState(false)
    const [tag, setTag] = useState("")

    const auth = useContext(AuthContext)
    useEffect(()=>{
        setSortToggle(false)
        if(community_name) setDocumentTitle(community_name)
        let tag_name = searchParams.get("tag")
        if(tag_name) {setTag(tag_name)}
        setLoaded(false)
        get_data("/community/"+community_name+"/posts?sort="+sortBy.type+"&t="+sortBy.timeFrame+ (tag_name!==null ? ("&tag="+tag_name) : ""), {}, auth?.isAuthenticated).then((res)=>{
            setPosts(res.data.post);
            setCommunityInfo(res.data.community)
            setLoaded(true)
          }).catch((err)=>{
            if(err.response && err.response.data.error.message==="community does not exist") {setError(err.response.data.error.message)}
            else setError(err)
            setLoaded(true);
        })
    }, [sortBy, refresh, tag, searchParams])

    const handleJoinButton = () => {
        auth?.protectedAction(()=>{
            if(communityInfo.isMember) {
                post_data("/community/"+community_name+"/leave", {}, {}, true)
                .then(()=>{
                    toast({
                        description: "Left "+community_name+" as a member!"
                    })
                    setCommunityInfo({...communityInfo, isMember : false})
                })
                .catch(()=>{
                    alert("rip")
                })
            } else {
                post_data("/community/"+community_name+"/join", {}, {}, true)
                .then(()=>{
                    toast({
                        description: "Joined "+community_name+" as a member!",
                        
                    })
                    setCommunityInfo({...communityInfo, isMember : true})
                })
                .catch(()=>{
                    alert("rip")
                })
            }
        }, ()=>navigate('/account/login'))
    }

    const changeAvatar = (avatar:string) => {
        setCommunityInfo({...communityInfo, avatar: avatar})
        window.location.reload()
    }

    const createTag = (name: string, color: string) => {
        setTagLoading(true)
        post_data("/community/"+community_name+"/add-tag", {name: name, color: color}, {}, true)
        .then((res)=>{
            setTagLoading(false)
            setRefresh(refresh+1)
        })
        .catch(()=>{
            toast({
                description: "Something went wrong",
                variant: "destructive"
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

    const addModerator = (id: string, displayName: string) => {
        setModeratorLoading(true)
        setMod({id: id, displayName: displayName});
        setConfirm(true)
    } 

    const confirmAddModerator = (id: string) => {
        post_data("/community/"+community_name+"/add-moderator", {id: id}, {}, true)
        .then((res)=>{
            setModeratorLoading(false)
            setRefresh(refresh + 1)
        })
        .catch((err)=>{
            if(err.response.data.error.message) toast({"variant": "destructive", description: err.response.data.error.message})
            setModeratorLoading(false)
        });
    }

    return ( loaded ? <>
            <div className="px-0 w-full bg-slate-50 p-4" > 
                <div className="w-11/12 lg:max-w-[975px] m:w-11/12 sm:w-11/12 mx-auto">
                    <div className="flex flex-row text-center">
                        <div className="peer">
                            <Avatar className={"w-16 h-16 shadow-md "+(communityInfo.isModerator && "cursor-pointer")}>
                                <AvatarImage className="" src={GetCommunityAvatar(communityInfo.avatar)} />
                                <AvatarFallback>CN</AvatarFallback>
                            </Avatar>
                        </div>
                        {communityInfo.isModerator && 
                        <ChangeAvatar type="community" changeAvatar={changeAvatar} community_name={community_name || ""}>
                            <div id="avatar_pencil" className={"peer-hover:visible block hover:visible invisible mr-6 absolute cursor-pointer rounded-full z-10 w-16 h-16 bg-[rgba(0,0,0,.5)]"}>
                                <Pencil strokeWidth={1.5} color="white" className={"ml-3.5 my-3.5 z-10 w-9 h-9"} ></Pencil>
                            </div>
                        </ChangeAvatar>}
                        <div className="flex flex-col ml-3 justify-start">
                            <div className="flex flex-row items-top">
                                <h2 className="mb-0 scroll-m-20 text-3xl font-semibold tracking-tight first:mt-0 inline-block">{community_name}</h2>
                                <Button variant={"outline"} className="rounded-full w-20 ml-2" onClick={handleJoinButton}>
                                    {communityInfo.isMember ? "Leave" : "Join"}
                                </Button>
                            </div>
                            <p className="text-left">{communityInfo && communityInfo.description}</p>
                        </div>
                    </div>       
                </div>
            </div>
            <div className="mt-6">
                <div className="flex flex-row w-full justify-center lg:hidden">
                    <div className="w-11/12 lg:w-[974px] mb-2">
                        { !about ? <>
                                <Button className="mr-2" variant={"round_outline"}>Posts</Button>
                                <Button variant={"ghost_round"} onClick={()=>navigate("./about")}>About</Button>
                            </> : <>
                                <Button className="mr-2" variant={"ghost_round"} onClick={()=>navigate("/community/"+community_name)}>Posts</Button>
                                <Button variant={"round_outline"}>About</Button>
                            </>
                        }
                    </div>
                </div>
                <div className="flex flex-row w-full justify-center">
                    <AlertDialog open={confirm} onOpenChange={setConfirm}>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                            <AlertDialogTitle>Are you sure you want to add a user as a moderator?</AlertDialogTitle>
                            <AlertDialogDescription>
                                Are you sure that you want to add the user {mod.displayName} as a moderator of this community?
                            </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                            <AlertDialogCancel onClick={()=>{setModeratorLoading(false)}}>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={()=>confirmAddModerator(mod.id)}>Continue</AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                    { 
                    !about ? <>
                        <div className="w-11/12 lg:w-[650px] sm:w-11/12 space-y-2">
                            {auth?.isAuthenticated && <div className="w-full"><CreatePost defaultCommunity={community_name}/></div>}
                            <Card className={"mx-auto pt-6"}>
                            <CardContent>
                                <div className="flex flex-row items-center space-x-2 flex-flow-row-wrap">
                                    <div className="mr-2">
                                        <ArrowDownWideNarrowIcon className="inline-block"/>
                                        Sort By
                                    </div>
                                    <Button variant={sortBy.type==="newest" ? "secondary" : "outline"} className="px-2 border-0 font-semibold" onClick={()=>setSortBy({type: "newest", timeFrame: "day"})}>
                                        <BadgePlus className="mr-1" strokeWidth={1.5}/>
                                        Newest
                                    </Button>
                                    <div className="block">
                                        <Button variant={sortBy.type==="best" ? "secondary" : "outline"} className="px-2 border-0 font-semibold" onClick={()=>{setSortToggle(c=>!c)}}>
                                            <ArrowBigUp className="mr-1" strokeWidth={1.5} size={25}/>
                                            Best
                                        </Button>
                                        <div className={"absolute bg-white shadow-md "+ (sortToggle ? "block" : "hidden")}>
                                            <Button variant={sortBy.timeFrame==="day" ? "secondary" : "outline"} className="block w-full border-0 text-left" onClick={()=>{setSortBy({type: "best", timeFrame: "day"}); setSortToggle(c=>!c)}} >Today</Button>
                                            <Button variant={sortBy.timeFrame==="week" ? "secondary" : "outline"}  className="block w-full border-0 text-left" onClick={()=>{setSortBy({type: "best", timeFrame: "week"}); setSortToggle(c=>!c)}} >This Week</Button>
                                            <Button variant={sortBy.timeFrame==="month" ? "secondary" : "outline"}  className="block w-full border-0 text-left" onClick={()=>{setSortBy({type: "best", timeFrame: "month"}); setSortToggle(c=>!c)}}>This Month</Button>
                                            <Button variant={sortBy.timeFrame==="year" ? "secondary" : "outline"}  className="block w-full border-0 text-left" onClick={()=>{setSortBy({type: "best", timeFrame: "year"}); setSortToggle(c=>!c)}}>This Year</Button>
                                            <Button variant={sortBy.timeFrame==="alltime" ? "secondary" : "outline"}  className="block w-full border-0 text-left" onClick={()=>{setSortBy({type: "best", timeFrame: "alltime"}); setSortToggle(c=>!c)}}>All Time</Button>
                                        </div>
                                    </div>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button
                                            variant="round_outline"
                                            role="combobox"
                                            className="max-w-[250px] justify-between font-semibold"
                                            >
                                            {tag
                                                ? //communities.find((communities) => communities.value === field.value)?.label
                                                <>
                                                <Badge className={"h-5 ml-1 text-center text-white"} style={{backgroundColor: communityInfo.tags.find(x=>x.name===tag)?.color, color: contrastingColor(communityInfo.tags.find(x=>x.name===tag)?.color ?? "")}} variant={"secondary"}>{tag} <X className="rounded-full ml-2 bg-primary-foreground/50 w-4 h-4 hover:bg-primary-foreground/20" onClick={()=>{setTag("");navigate("/community/"+community_name)}}/></Badge>
                                                </>
                                                : <span className="mr-auto"><Tag strokeWidth={1.8} className="inline w-5 h-5"></Tag> Tag</span>}
                                            <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="max-w-[250px] p-0">
                                        <Command className="max-w-[250px]">
                                            <CommandInput className="max-w-[310px]" placeholder="Search tags..."/>
                                            <CommandEmpty>No tags found.</CommandEmpty>
                                            { <CommandGroup>
                                            { communityInfo.tags &&
                                            communityInfo.tags.map((_tag) => (
                                                <CommandItem
                                                value={_tag.name}
                                                key={_tag.name}
                                                onSelect={() => {
                                                    if(_tag.name === tag) {navigate("/community/"+community_name);setTag("")}
                                                    else {
                                                        setTag(_tag.name)
                                                        navigate("/community/"+community_name+"?tag="+_tag.name)
                                                    }
                                                }}
                                                >
                                                <Badge className={"h-5 ml-1 text-center text-white"} style={{backgroundColor: _tag.color, color: contrastingColor(_tag.color)}} variant={"secondary"}>{_tag.name}</Badge>
                                                <Check className={cn("ml-auto h-4 w-4", _tag.name === tag ? "opacity-100" : "opacity-0")}/>
                                                </CommandItem>
                                            ))
                                                    }
                                            </CommandGroup> }
                                        </Command>
                                        </PopoverContent>
                                    </Popover>

                                </div>
                                </CardContent>
                            </Card>
                            {posts.length === 0 && error!=="community does not exist" && <NoPosts/>}
                            {error==="community does not exist" && <p>Community does not exist</p>}

                            {posts.length > 0 &&  error!=="community does not exist" && posts.map((_post)=>{
                                return <Post key={_post._id} props={_post} showLinkToPost={true} showCommunity={false} width="w-full"/>
                            })}
                        </div>
                        <div className="w-[300px] hidden sm:hidden md:hidden lg:block ml-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>About community</CardTitle>
                                <CardDescription>
                                    {communityInfo.description} 
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="align-center flex">
                                    <Users className="inline-block pr-1"/>{communityInfo.members} member{communityInfo.members!==1 && "s"}
                                </div>
                            </CardContent>
                        </Card>
                        <Card className="my-2">
                            <CardHeader>
                                <CardTitle>Tags</CardTitle>
                                <CardDescription>
                                    These are the tags used for filtering posts
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                {communityInfo.tags.map((tag)=>{
                                    return <Badge className={"h-5 ml-1 text-center shadow-sm cursor-pointer"} onClick={()=>{setTag(tag.name); navigate("/community/"+community_name+"?tag="+tag.name)}} style={{backgroundColor: tag.color, color: contrastingColor(tag.color)}} variant={"secondary"} key={tag.name}>{tag.name}</Badge>
                                })}
                                {communityInfo.tags.length === 0 && <p className="text-sm">There are no tags for this community. Ask the moderators of this community to add them</p>}
                            </CardContent>
                            { communityInfo.isModerator &&<CardFooter>
                                    <Dialog>
                                        <DialogTrigger asChild>
                                            <Button className="flex justify-start" variant={"round_outline"}><PlusCircle strokeWidth={1.5} className="mr-2"></PlusCircle> Add Tag</Button>
                                        </DialogTrigger>
                                        <DialogContent className="sm:max-w-[425px]">
                                            <DialogHeader>
                                                <CreateTagForm isLoading={tagLoading} handleSubmit={(e)=>{createTag(e.name, e.color)}}/>
                                            </DialogHeader>
                                        </DialogContent>
                                    </Dialog>
                            </CardFooter>}
                        </Card>
                        <Card className="my-2">
                            <CardHeader>
                                <CardTitle>Moderators <Shield className="inline w-6 h-6"/></CardTitle>
                                <CardDescription>
                                    These are the people that enforce the rules of this community
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                {communityInfo.moderators.map((mod)=>{
                                    return <div className="flex items-center cursor-pointer hover:underline text-sm" onClick={()=>navigate("/user/"+mod.uid)} key={mod.uid}>
                                            <Avatar className="shadow-md inline-block h-7 w-7 mr-1 mt-1">
                                                <AvatarImage src={GetAvatar({user: mod, provider: mod.provider})} />
                                                <AvatarFallback>MOD</AvatarFallback>
                                            </Avatar>
                                            <span>{mod.displayName}</span>
                                        </div>
                                })}
                            </CardContent>
                            { communityInfo.isModerator &&<CardFooter>
                                    <Dialog>
                                        <DialogTrigger asChild>
                                            <Button className="flex justify-start" variant={"round_outline"}><PlusCircle strokeWidth={1.5} className="mr-2"></PlusCircle> Add Moderator</Button>
                                        </DialogTrigger>
                                        <DialogContent className="sm:max-w-[425px]">
                                            <DialogHeader>
                                                <AddModeratorForm isLoading={moderatorLoading} handleSubmit={(values)=>addModerator(values.id, values.displayName)}/>
                                            </DialogHeader>
                                        </DialogContent>
                                    </Dialog>
                            </CardFooter>}
                        </Card>
                        </div>
                        
                    </> : <div  className="flex flex-col w-full px-6">
                        
                        <Card>
                            <CardHeader>
                                <CardTitle>About community</CardTitle>
                                <CardDescription>
                                    {communityInfo.description} 
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="align-center flex">
                                    <Users className="inline-block pr-1"/>{communityInfo.members} member{communityInfo.members!==1 && "s"}
                                </div>
                            </CardContent>
                        </Card>
                        <Card className="my-2">
                            <CardHeader>
                                <CardTitle>Tags</CardTitle>
                                <CardDescription>
                                    These are the tags used for filtering posts
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                {communityInfo.tags.map((tag)=>{
                                    return <Badge className={"h-5 ml-1 text-center shadow-sm cursor-pointer"} onClick={()=>{setTag(tag.name); navigate("/community/"+community_name+"?tag="+tag.name)}} style={{backgroundColor: tag.color, color: contrastingColor(tag.color)}} variant={"secondary"} key={tag.name}>{tag.name}</Badge>
                                })}
                                {communityInfo.tags.length === 0 && <p className="text-sm">There are no tags for this community. Ask the moderators of this community to add them</p>}
                            </CardContent>
                            { communityInfo.isModerator &&<CardFooter>
                                    <Dialog>
                                        <DialogTrigger asChild>
                                            <Button className="flex justify-start" variant={"round_outline"}><PlusCircle strokeWidth={1.5} className="mr-2"></PlusCircle> Add Tag</Button>
                                        </DialogTrigger>
                                        <DialogContent className="sm:max-w-[425px]">
                                            <DialogHeader>
                                                <CreateTagForm isLoading={tagLoading} handleSubmit={(e)=>{createTag(e.name, e.color)}}/>
                                            </DialogHeader>
                                        </DialogContent>
                                    </Dialog>
                            </CardFooter>}
                        </Card>
                        <Card className="my-2">
                            <CardHeader>
                                <CardTitle>Moderators <Shield className="inline w-6 h-6"/></CardTitle>
                                <CardDescription>
                                    These are the people that enforce the rules of this community
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                {communityInfo.moderators.map((mod)=>{
                                    return <div className="flex items-center cursor-pointer hover:underline text-sm" onClick={()=>navigate("/user/"+mod.uid)} key={mod.uid}>
                                            <Avatar className="shadow-md inline-block h-7 w-7 mr-1 mt-1">
                                                <AvatarImage src={GetAvatar({user: mod, provider: mod.provider})} />
                                                <AvatarFallback>MOD</AvatarFallback>
                                            </Avatar>
                                            <span>{mod.displayName}</span>
                                        </div>
                                })}
                            </CardContent>
                            { communityInfo.isModerator &&<CardFooter>
                                    <Dialog>
                                        <DialogTrigger asChild>
                                            <Button className="flex justify-start" variant={"round_outline"}><PlusCircle strokeWidth={1.5} className="mr-2"></PlusCircle> Add Moderator</Button>
                                        </DialogTrigger>
                                        <DialogContent className="sm:max-w-[425px]">
                                            <DialogHeader>
                                                <AddModeratorForm isLoading={moderatorLoading} handleSubmit={(values)=>addModerator(values.id, values.displayName)}/>
                                            </DialogHeader>
                                        </DialogContent>
                                    </Dialog>
                            </CardFooter>}
                        </Card>
                    </div>
                    }
                </div>
            </div>
            </>
        : <HomeSkeleton></HomeSkeleton>);
    
}

export default Community