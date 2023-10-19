import { Post } from "components/post";
import AuthContext from "contexts/AuthContext";
import { get_data } from "helpers/api";
import { useDocumentTitle } from "hooks/setDocuemntTitle";
import { useContext, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { PostSchema } from "schemas/postSchema";

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
    return ( loaded ? <> <h1>{community_name}</h1>
            <p>{communityInfo && communityInfo.description}</p>
            <div className="flex flex-col space-y-3">
                {posts.length > 0 &&  error!=="community does not exist" && posts.map((_post)=>{
                    return <Post key={_post._id} props={_post} showLinkToPost={true}/>
                })}
            </div>
            {posts.length === 0 && error!=="community does not exist" && "there are no posts yet"}
            {error==="community does not exist" && <p>Community does not exist</p>}
            </>
        : <div><p>loading...</p></div>);
    
}

export default Community