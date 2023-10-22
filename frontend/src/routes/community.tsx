import { Post } from "components/post";
import AuthContext from "contexts/AuthContext";
import { get_data, post_data } from "helpers/api";
import { useDocumentTitle } from "hooks/setDocuemntTitle";
import { useContext, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { PostSchema } from "schemas/postSchema";
import { Button } from "../components/ui/button"
import {  ArrowBigUp, ArrowDownWideNarrowIcon, BadgePlus, Bell, Users } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import CreatePost from "components/createPost";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { useToast } from "../components/ui/use-toast"
import GetAvatar, { GetCommunityAvatar } from "helpers/getAvatar";

const Community = () => {
    const community_name = useParams().community;
    const [loaded, setLoaded] = useState(false);
    const [posts, setPosts] = useState<PostSchema[]>([{author:{id:"",displayName:"", avatar:""}, title:"", createdAt: new Date(), body:"", _id:"", community: {name:"", avatar:""}, votes_likes:0, votes_dislikes:0, user_vote:0, comments:[], comment_length :0}]);
    const [error, setError] = useState("");
    const [communityInfo, setCommunityInfo] = useState({description: "", members: 0, isMember: false, avatar: ""})
    const [documentTitle, setDocumentTitle] = useDocumentTitle("")
    const [sortBy, setSortBy] = useState<{type:"newest" | "best", timeFrame: "alltime" | "day" | "week" | "month" | "year"}>({type: "newest", timeFrame: "day"})
    const navigate = useNavigate();
    const { toast } = useToast()
    const [sortToggle, setSortToggle] = useState(false)

    const auth = useContext(AuthContext)
    useEffect(()=>{
        setSortToggle(false)
        if(community_name) setDocumentTitle(community_name)
        setLoaded(false)
        get_data("/community/"+community_name+"/posts?sort="+sortBy.type+"&t="+sortBy.timeFrame, {}, auth?.isAuthenticated).then((res)=>{
            setPosts(res.data.post);
            setCommunityInfo(res.data.community)
            setLoaded(true)
          }).catch((err)=>{
            if(err.response.data.error.message==="community does not exist") {setError(err.response.data.error.message)}
            else setError(err)
            setLoaded(true);
        })
    }, [sortBy])

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
    const handleNotiButton = () => {
        alert('notied')
        console.log(GetCommunityAvatar(communityInfo.avatar))
    }
    return ( loaded ? <> 
            <div className="px-0 w-full bg-slate-50 p-4" > 
                <div className="w-11/12 lg:max-w-[975px] m:w-11/12 sm:w-11/12 mx-auto">
                    <div className="flex text-center">
                        <Avatar className="shadow-md">
                            <AvatarImage src={GetCommunityAvatar(communityInfo.avatar)} />
                            <AvatarFallback>CN</AvatarFallback>
                        </Avatar>
                        <h2 className="mb-0 scroll-m-20 text-3xl font-semibold tracking-tight first:mt-0 inline-block ml-2">{community_name}</h2>
                        <Button variant={"outline"} className="rounded-full w-20 ml-2 my-auto" onClick={handleJoinButton}>
                            {communityInfo.isMember ? "Leave" : "Join"}
                        </Button>
                        <Button variant={"outline"} className="rounded-full ml-2 p-2" onClick={handleNotiButton}>
                            <Bell size={22} strokeWidth={1.5}></Bell>
                        </Button>
                    </div>
                    <p>{communityInfo && communityInfo.description}</p>
                </div>
            </div>
            <div className="mt-6">
                <div className="flex flex-row w-full justify-center">
                    
                    <div className="w-11/12 lg:w-[650px] sm:w-11/12 space-y-2">

                        {auth?.isAuthenticated && <div className="w-full"><CreatePost/></div>}
                        <Card className={"mx-auto pt-6"}>
                        <CardContent>
                            <div className="flex flex-row items-center space-x-2">
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

                            </div>
                            </CardContent>
                        </Card>

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

                    </div>
                </div>
            </div>
            {posts.length === 0 && error!=="community does not exist" && "there are no posts yet"}
            {error==="community does not exist" && <p>Community does not exist</p>}
            </>
        : <div><p>loading...</p></div>);
    
}

export default Community