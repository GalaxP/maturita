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
import InteractiveTextArea from "./interactiveTextArea";
import { PostSkeleton } from "./skeleton/post";

declare var grecaptcha:any

const PostId = () => {
const [post, setPost] = useState<PostSchema>({author:{id:"", displayName:"", isMod: false, avatar:"", provider: ""}, tag:{name:"", color:""}, locked: false, photos: undefined, title:"", createdAt: new Date(), body:"", community: {name: "", avatar: ""}, _id:"", votes_likes:0, votes_dislikes: 0, user_vote: 0, comments: [], comment_length: 0})
    const [documentTitle, setDocumentTitle] = useDocumentTitle("")
    const [isLoading, setIsLoading] = useState(false)
    const id = useParams().postId;
    const authContext = useContext(AuthContext)
    const [comment, setComment] = useState('');
    const { toast } = useToast()
    const comments:any = []
    const [submitted, setSubmitted] = useState(false)
    const localizeContext = useContext(LocalizationContext)
    const [error, setError] = useState(false)

    useEffect(()=> {
        setIsLoading(true)
        setSubmitted(false)
        get_data("/post/"+id, {}, authContext?.isAuthenticated)
        .then((res)=> {
            setPost(res.data)
            setDocumentTitle(res.data.title)
            
            setIsLoading(false)
            setError(false)
        })
        .catch((err)=> {
            if(err.name !== "CanceledError") {
                //if(err.response.status === 429)
                setIsLoading(false)
                setError(true)
            }
        })
        
        return () => {
            setIsLoading(false)
            //setError(false)
        }
    },[id, submitted])
    const submitComment = () => {
        grecaptcha.ready(function() {
            grecaptcha.execute(process.env.REACT_APP_RECAPTCHA_SITE_KEY, {action: 'comment'}).then(function(token:string) {
                post_data("/post/"+post._id+"/comment", {body: comment, token:token}, {}, true)
                .then((res)=> {
                    toast({
                        description: localizeContext.localize("COMMENT_SUCCES"),
                    })
                    //setSubmitted(true)
                    setComment('');
                    post.comments?.unshift({author: {avatar:authContext?.getUser().user.avatar, displayName: authContext?.getUser().user.displayName, id:authContext?.getUser().user.uid}, body:comment, comments: [], createdAt: new Date(), id: res.data, votes_dislikes:0, votes_likes: 0, disabled: false, isOp: false, offset:0, showLine: false})
                    setPost(post);
                })
                .catch((err)=> {
                    toast({
                        variant: "destructive",
                        title: localizeContext.localize("ERROR_GENERIC"),
                        description: localizeContext.localize("ERROR_GENERIC_DESCRIPTION"),
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
                        title: localizeContext.localize("ERROR_GENERIC"),
                        description: localizeContext.localize("ERROR_GENERIC_DESCRIPTION"),
                    })
                })
            })
        })
    }
    const generateLines = (depth: number) => {
        let lines:any = [depth]
        for(let i =0; i < depth; i++) {
            if(i===0) lines[i] = <div className="w-[2px] flex-shrink-0 bg-gray-200" style={{marginLeft: /*40*/18+"px"}} key={i}></div>;
            else lines[i] = <div className="w-[2px] flex-shrink-0 bg-gray-200" style={{marginLeft: /*40*/26+"px"}} key={i}></div>;
        }
        return lines
    }

    const recursiveComment = (_comment: IComment[], depth: number) => {
        _comment.map((comm: IComment) => {
            if(depth > 1 && window.visualViewport?.width && window.visualViewport?.width <= 320 ) {comments.push(<a className="cursor-pointer" style={{paddingLeft: depth*20+"px"}} key={"show_more_replies"+comm.id}>Show more replies</a>); return; }
            /*if(depth > 0) comments.push(<div className="w-2 h-32 bg-primary"></div>)*/
            let comment = <div className="flex flex-row space-x-2 flex-shrink" key={"wrapper "+comm.id}>
                {generateLines(depth)}
                <Comment disabled={post.locked} isOp={comm.author.id === post.author.id} showLine={comm.comments !== undefined} onReply={(id, body)=>reply(comm.id, body)} _id={comm.id} author={comm.author} body={comm.body} createdAt={comm.createdAt} offset={depth} votes_dislikes={comm.votes_dislikes} votes_likes={comm.votes_likes} user_vote={comm.user_vote} key={comm.id} />
            </div>
            comments.push(comment)
            if(comm.comments && comm.comments.length > 0) recursiveComment(comm.comments, depth+1);
        })
    }

    if(post.comments && post.comments.length>0) {
        post.comments.map((comm:IComment)=>{
            comments.push(<Comment disabled={post.locked} isOp={comm.author.id === post.author.id} showLine={comm.comments !== undefined} onReply={(id, body)=>reply(comm.id, body)} _id={comm.id} author={comm.author} body={comm.body} createdAt={comm.createdAt} offset={0} votes_dislikes={comm.votes_dislikes} votes_likes={comm.votes_likes} user_vote={comm.user_vote} key={comm.id}/>)
            if(comm.comments && comm.comments.length > 0) recursiveComment(comm.comments, 1);
        })
    }
    
    return <>
    {isLoading ? <PostSkeleton/> : error===false ?
    <div className="mt-6">
        <Post props={post} showLinkToPost={false}/>
        <div className="w-11/12 lg:w-[700px] sm:w-11/12 mx-auto mt-5" >
            <InteractiveTextArea disabled={post.locked} buttonText={localizeContext.localize("COMMENT_VERB")} comment={comment} isAuthenticated={authContext?.isAuthenticated} setComment={(e)=>setComment(e)} submitComment={submitComment} placeholder={localizeContext.localize("COMMENT_PLACEHOLDER")} id={id ? "textarea"+ id : ""} key={post._id ? "textarea"+ post._id : ""}/>
            <div className="text-lg font-semibold my-2">{post.comment_length} {post.comment_length !== 1 ? localizeContext.localize("COMMENT_COUNT_P") : localizeContext.localize("COMMENT_COUNT_S")}</div>
            {comments}
        </div>
    </div>
    : <p>404</p>
    
    }
    </>
    ;
}

export {
    PostId,
}