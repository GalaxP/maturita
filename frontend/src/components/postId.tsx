import { useParams } from "react-router-dom";
import { PostSchema } from "../schemas/postSchema";
import { useContext, useEffect, useState } from "react";
import { get_data, post_data } from "../helpers/api";
import { Post } from "./post";
import AuthContext from "../contexts/AuthContext";
import { Textarea } from "../components/ui/textarea";
import { Button } from "../components/ui/button";
import { useToast } from "../components/ui/use-toast"
import { ToastAction } from "../components/ui/toast";

const PostId = () => {
    const [post, setPost] = useState<PostSchema>({author:"", title:"", createdAt: new Date(), body:"", _id:"", votes_likes:0, votes_dislikes: 0, user_vote: 0, comments: []})
    const [isLoading, setIsLoading] = useState(false)
    const id = useParams().postId;
    const authContext = useContext(AuthContext)
    const [comment, setComment] = useState('');
    const { toast } = useToast()

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
    const submitComment = () => {
        post_data("/post/"+post._id+"/comment", {body: comment}, {withCredentials: true}, true)
        .then((res)=> {
            
            toast({
                description: "Your comment has been sent.",
            })
            
        })
        .catch((err)=> {
                toast({
                    variant: "destructive",
                    title: "Uh oh! Something went wrong.",
                    description: "There was a problem with your request."+err,
                    action: <ToastAction altText="Try again">Try again</ToastAction>,
                  })
        })
    }
    return <>
    {isLoading ? "" : <> 
    <Post _id={post._id} author={post.author} body={post.body} createdAt={post.createdAt} title={post.title} votes_likes={post.votes_likes} votes_dislikes={post.votes_dislikes} user_vote={post.user_vote} comments={post.comments}/>
    <div className="w-3/5 h-10 mx-auto mt-5 grid gap-2" >
        <Textarea value={comment} onChange={e => setComment(e.target.value)} placeholder={authContext?.isAuthenticated ? "Type your comment here." : "You need to log in to comment."} disabled={!authContext?.isAuthenticated}/>
        {authContext?.isAuthenticated && <Button onClick={submitComment}>Comment</Button> }
    </div>
    </>
    
    }
    </>
    ;
}

export {
    PostId,
}