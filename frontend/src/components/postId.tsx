import { useParams } from "react-router-dom";
import { PostSchema, IComment } from "../schemas/postSchema";
import { useContext, useEffect, useState } from "react";
import { get_data, post_data } from "../helpers/api";
import { Post } from "./post";
import AuthContext from "../contexts/AuthContext";
import { Textarea } from "../components/ui/textarea";
import { Button } from "../components/ui/button";
import { useToast } from "../components/ui/use-toast"
import Comment from "../components/comment"
import { Skeleton } from "../components/ui/skeleton";
import { useDocumentTitle } from "../hooks/setDocuemntTitle"
import LocalizationContext from "contexts/LocalizationContext";

declare var grecaptcha:any

const PostId = () => {
    const [post, setPost] = useState<PostSchema>({author:{id:"", displayName:"", avatar:""}, title:"", createdAt: new Date(), body:"", community: "", _id:"", votes_likes:0, votes_dislikes: 0, user_vote: 0, comments: [], comment_length: 0})
    const [documentTitle, setDocumentTitle] = useDocumentTitle("")
    const [isLoading, setIsLoading] = useState(false)
    const id = useParams().postId;
    const authContext = useContext(AuthContext)
    const [comment, setComment] = useState('');
    const { toast } = useToast()
    const comments:any = []
    const [submitted, setSubmitted] = useState(false)
    const localizeContext = useContext(LocalizationContext)

    useEffect(()=> {
        setIsLoading(true)
        setSubmitted(false)
        get_data("/post/"+id, {}, authContext?.isAuthenticated)
        .then((res)=> {
            setPost(res.data)
            setDocumentTitle(res.data.title)
            setIsLoading(false)
        })
        .catch((err)=> {
            if(err.name !== "CanceledError") {
                if(err.response.status === 429)
                setIsLoading(false)
            }
        })
        
        return () => {
            setIsLoading(false)
        }
    },[id, submitted])
    const submitComment = () => {
        grecaptcha.ready(function() {
            grecaptcha.execute(process.env.REACT_APP_RECAPTCHA_SITE_KEY, {action: 'comment'}).then(function(token:string) {
                post_data("/post/"+post._id+"/comment", {body: comment, token:token}, {}, true)
                .then((res)=> {
                    toast({
                        description: "Your comment has been sent.",
                    })
                    setSubmitted(true)
                })
                .catch((err)=> {
                    toast({
                        variant: "destructive",
                        title: "Uh oh! Something went wrong.",
                        description: "There was a problem with your request.",
                    })
                })
            })
        })
    }

    const reply = (commentId: string, replyBody: string) => {
        grecaptcha.ready(function() {
            grecaptcha.execute(process.env.REACT_APP_RECAPTCHA_SITE_KEY, {action: 'reply'}).then(function(token:string) {
                post_data("/post/"+post._id+"/comment/"+commentId, {body: replyBody, token: token}, {}, true)
                .then(()=> {
                    setSubmitted(true)
                })
                .catch(()=>{
                    toast({
                        variant: "destructive",
                        title: "Uh oh! Something went wrong.",
                        description: "There was a problem with your request.",
                    })
                })
            })
        })
    }

    const recursiveComment = (_comment: IComment[], depth: number) => {
        _comment.map((comm: IComment) => {
            comments.push(<Comment onReply={(id, body)=>reply(comm.id, body)} _id={comm.id} author={comm.author} body={comm.body} createdAt={comm.createdAt} offset={depth} votes_dislikes={comm.votes_dislikes} votes_likes={comm.votes_likes} user_vote={comm.user_vote} key={comm.id} />)
            if(comm.comments && comm.comments.length > 0) recursiveComment(comm.comments, depth+1);
        })
    }
    if(post.comments && post.comments.length>0) {
        post.comments.map((comm:IComment)=>{
            comments.push(<Comment onReply={(id, body)=>reply(comm.id, body)} _id={comm.id} author={comm.author} body={comm.body} createdAt={comm.createdAt} offset={0} votes_dislikes={comm.votes_dislikes} votes_likes={comm.votes_likes} user_vote={comm.user_vote} key={comm.id}/>)
            if(comm.comments && comm.comments.length > 0) recursiveComment(comm.comments, 1);
        })
    }
    
    return <>
    {isLoading ? <div className=" mt-12 flex justify-center items-center space-x-4 w-full flex-col space-y-2">
        <Skeleton className="h-40 w-3/5" />
        <Skeleton className="mx-0 h-10 w-3/5 " />
    </div> : <>
    <div className="mt-6">
        <Post props={post}/>
        <div className="w-11/12 lg:w-[700px] sm:w-11/12 mx-auto mt-5" >
            <Textarea className="w-full inline max-w-full" value={comment} onChange={e => setComment(e.target.value)} placeholder={authContext?.isAuthenticated ? "Type your comment here." : "You need to log in to comment."} disabled={!authContext?.isAuthenticated}/>
            {authContext?.isAuthenticated && <Button className="w-20 ml-auto" onClick={submitComment}>Comment</Button> }
            <div className="text-lg font-semibold my-2">{post.comment_length} {post.comment_length !== 1 ? localizeContext.localize("COMMENT_COUNT_P") : localizeContext.localize("COMMENT_COUNT_S")}</div>
            {comments}
        </div>
    </div>
    </>
    
    }
    </>
    ;
}

export {
    PostId,
}