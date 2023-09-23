import { useContext, useState } from "react";
import { PostSchema } from "../schemas/postSchema";
import AuthContext from "../contexts/AuthContext";
import { post_data } from "../helpers/api";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../components/ui/card";
import { VoteButton } from "./voteButton";


const Post = ({_id ,title, body, author, createdAt, votes_likes, votes_dislikes, user_vote, comments, width}: PostSchema) => {
    const auth = useContext(AuthContext)
    //const [likes, setLikes] = useState(0)
    //const [dislikes, setDislikes] = useState(0)
    const [error, setError] = useState()
    const [post, setPost] = useState<PostSchema>({_id: _id, author: author, body: body, createdAt: createdAt, title: title, votes_dislikes: votes_dislikes, votes_likes: votes_likes, user_vote: user_vote, comments: comments})
    const [votes, setVotes] = useState<any>({votes_likes: votes_likes, votes_dislikes: votes_dislikes, user_vote: user_vote})
    
    const vote = (direction: number) => {
        auth?.protectedAction(()=> {
            if(direction === 0 && votes.user_vote !== 0) {
                post_data("/post/action", {postId: _id, type: "vote", direction: 0}, {}, true)
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
                })
                .catch((err)=> {
                    setError(err)
                })
            }
            if(direction === -1) {
                post_data("/post/action", {postId: _id, type: "vote", direction: -1}, {}, true)
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
                })
                .catch((err)=> {
                    setError(err)
                })
            } else if(direction === 1) {
                post_data("/post/action", {postId: _id, type: "vote", direction: 1}, {}, true)
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
                })
                .catch((err)=> {
                    setError(err)
                })
            }
        }, ()=> {alert("you must be logged in to vote")})
    }

    var width_class = `${width ? width : "w-3/5"} mx-auto`;
    return <>
        {/*
        <h1>{title}</h1>
        <div className="container">
            {votes.user_vote === 1 ?  <img onClick={()=>{vote(0)}} width="24" height="24" src="https://img.icons8.com/material/24/thumb-up--v1.png" alt="thumb-up--v1"/> : <img onClick={()=>{vote(1)}} width="24" height="24" src="https://img.icons8.com/material-outlined/24/thumb-up.png" alt="thumb-up"/>}  
            <p>{votes.votes_likes}</p>
            {votes.user_vote === -1 ? <img onClick={()=>{vote(0)}} width="24" height="24" src="https://img.icons8.com/material/24/thumbs-down--v1.png" alt="thumbs-down--v1"/> : <img onClick={()=>{vote(-1)}} width="24" height="24" src="https://img.icons8.com/material-outlined/24/thumbs-down.png" alt="thumbs-down"/>}
            <p>{votes.votes_dislikes}</p>
        </div>
        <p>{new Date(createdAt).toLocaleDateString() + " " + new Date(createdAt).toLocaleTimeString()}</p>
        <p>{body}</p>
        <p>Submitted by: {author}</p>
        <p>Test</p>
        <Button disabled={isLoading} onClick={handleClick}>
            {isLoading &&<Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {!isLoading && <Mail className="mr-2 h-4 w-4" />}
            Login with Email
        </Button>
        */}
        
        <Card className={width_class}>
            <CardHeader className="pb-0">
                <CardTitle>{title}</CardTitle>
                <CardDescription>{author} 
                <span className="dot-separator mx-1"></span>
                 {new Date(createdAt).toLocaleDateString() + " " + new Date(createdAt).toLocaleTimeString()}
                 </CardDescription>
                 <div className="flex flex-row content-center space-x-1">
                    <VoteButton type="like" votes={votes.votes_likes} current_vote={votes.user_vote} onClick={vote}/>
                    <VoteButton type="dislike" votes={votes.votes_dislikes} current_vote={votes.user_vote} onClick={vote}/>
                 </div>
                  
            </CardHeader>
            <CardContent>
                <p>{body}</p>
            </CardContent>
        </Card>
    </>
}

export {
    Post,
}