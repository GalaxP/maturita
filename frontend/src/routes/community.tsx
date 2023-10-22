import { Post } from "components/post";
import AuthContext from "contexts/AuthContext";
import { get_data } from "helpers/api";
import { useDocumentTitle } from "hooks/setDocuemntTitle";
import { useContext, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { PostSchema } from "schemas/postSchema";
import { Button } from "../components/ui/button"
import { Bell } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import CreatePost from "components/createPost";

const Community = () => {
    const community_name = useParams().community;
    const [loaded, setLoaded] = useState(false);
    const [posts, setPosts] = useState<PostSchema[]>([{author:{id:"",displayName:"", avatar:""}, title:"", createdAt: new Date(), body:"", _id:"", community: "", votes_likes:0, votes_dislikes:0, user_vote:0, comments:[], comment_length :0}]);
    const [error, setError] = useState("");
    const [communityInfo, setCommunityInfo] = useState({description: ""})
    const [documentTitle, setDocumentTitle] = useDocumentTitle("")
    
    const auth = useContext(AuthContext)
    useEffect(()=>{
        if(community_name) setDocumentTitle(community_name)
        setLoaded(false)
        get_data("/community/"+community_name+"/posts", {}, auth?.isAuthenticated).then((res)=>{
            setPosts(res.data.post);
            setCommunityInfo(res.data.community)
            setLoaded(true)
          }).catch((err)=>{
            if(err.response.data.error.message==="community does not exist") {setError(err.response.data.error.message)}
            else setError(err)
            setLoaded(true);
        })
    }, [])
    return ( loaded ? <> 
            <div className="w-full bg-slate-50 p-4" >
                

                <div className="lg:w-3/5 sm:w-3/4 w-[90%] mx-auto">
                    <div className="flex text-center">
                        <Avatar className="shadow-md">
                            <AvatarImage src={"data:image/jpeg;base64,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"} />
                            <AvatarFallback>CN</AvatarFallback>
                        </Avatar>
                        <h2 className="mb-0 scroll-m-20 text-3xl font-semibold tracking-tight first:mt-0 inline-block ml-2">{community_name}</h2>
                        <Button variant={"outline"} className="rounded-full w-20 ml-2 my-auto">
                            Join
                        </Button>
                        <Button variant={"outline"} className="rounded-full ml-2 p-2">
                            <Bell size={22} strokeWidth={1.5}></Bell>
                        </Button>
                    </div>
                    <p>{communityInfo && communityInfo.description}</p>
                </div>
            </div>
            <div className="flex flex-col space-y-3 mt-6">
                {auth?.isAuthenticated && <div className="lg:w-3/5 sm:w-3/4 w-[90%] mx-auto"><CreatePost/></div>}
                {posts.length > 0 &&  error!=="community does not exist" && posts.map((_post)=>{
                    return <Post key={_post._id} props={_post} showLinkToPost={true} showCommunity={false}/>
                })}
            </div>
            {posts.length === 0 && error!=="community does not exist" && "there are no posts yet"}
            {error==="community does not exist" && <p>Community does not exist</p>}
            </>
        : <div><p>loading...</p></div>);
    
}

export default Community