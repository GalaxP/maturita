import { useParams } from "react-router-dom";
import { PostSchema } from "../schemas/postSchema";
import { useEffect, useState } from "react";
import { get_data } from "../helpers/api";
import { Post } from "./post";

const PostId = () => {
    const [post, setPost] = useState<PostSchema>({author:"", title:"", createdAt: new Date(), body:"", _id:""})
    const id = useParams().postId;

    useEffect(()=> {
        const controller = new AbortController();
        get_data("/post/"+id, {signal: controller.signal})
        .then((res)=> {
            setPost(res.data)
        })
        .catch((err)=> {
            if(err.name !== "CanceledError")
                console.log(err)
        })

        return () => {
            controller.abort()
        }
    },[id])

    return <>
    {<Post author={post.author} body={post.body} createdAt={post.createdAt} title={post.title} />}
    
    </>
    ;
}

export {
    PostId,
}