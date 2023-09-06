import { useParams } from "react-router-dom";
import { PostSchema } from "../schemas/postSchema";
import { useContext, useEffect, useState } from "react";
import { get_data } from "../helpers/api";
import { Post } from "./post";
import AuthContext from "../contexts/AuthContext";

const PostId = () => {
    const [post, setPost] = useState<PostSchema>({author:"", title:"", createdAt: new Date(), body:"", _id:"", votes_likes:0, votes_dislikes: 0, user_vote: 0})
    const [isLoading, setIsLoading] = useState(false)
    const id = useParams().postId;
    const authContext = useContext(AuthContext)

    useEffect(()=> {
        //console.log("interesting")
        setIsLoading(true)
        //const controller = new AbortController();
        get_data("/post/"+id, {/*signal: controller.signal*/}, authContext?.isAuthenticated)
        .then((res)=> {
            
            setTimeout(()=>{
                setPost(res.data)
                setIsLoading(false)
            }, 100)
            
        })
        .catch((err)=> {
            if(err.name !== "CanceledError") {
                if(err.response.status === 429)
                //console.log(err)
                setIsLoading(false)
            }
        })
        
        return () => {
            setIsLoading(false)
            //controller.abort()
        }
    },[id])

    return <>
    {isLoading ? "" : <Post _id={post._id} author={post.author} body={post.body} createdAt={post.createdAt} title={post.title} votes_likes={post.votes_likes} votes_dislikes={post.votes_dislikes} user_vote={post.user_vote}/>} 
    </>
    ;
}

export {
    PostId,
}