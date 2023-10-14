import { useContext, useEffect, useState } from "react";
import { PostSchema } from "../schemas/postSchema";
import AuthContext from "../contexts/AuthContext";
import { post_data } from "../helpers/api";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../components/ui/card";
import { VoteButton } from "./voteButton";
import { AiOutlineComment, AiOutlineDelete } from "react-icons/ai";
import { Button } from "../components/ui/button";
import { useNavigate } from "react-router-dom";
import { useToast } from "./ui/use-toast";

declare var grecaptcha:any

const Post = ({_id ,title, body, author, createdAt, votes_likes, votes_dislikes, user_vote, comments, comment_length, width, showLinkToPost}: PostSchema) => {
    const auth = useContext(AuthContext)
    //const [likes, setLikes] = useState(0)
    //const [dislikes, setDislikes] = useState(0)
    const [error, setError] = useState()
    const [post, setPost] = useState<PostSchema>({_id: _id, author: author, body: body, createdAt: createdAt, title: title, votes_dislikes: votes_dislikes, votes_likes: votes_likes, user_vote: user_vote, comments: comments, comment_length: comment_length})
    const [votes, setVotes] = useState<any>({votes_likes: votes_likes, votes_dislikes: votes_dislikes, user_vote: user_vote})
    const [isVoting, setIsVoting] = useState(false)
    const navigate = useNavigate()
    const { toast } = useToast()

    const vote = (direction: number) => {
        var grecaptchaToken = ""
        if(isVoting) return
        setIsVoting(true)
        grecaptcha.ready(function() {
            grecaptcha.execute(process.env.REACT_APP_RECAPTCHA_SITE_KEY, {action: 'action'}).then(function(token:string) {
                grecaptchaToken = token
                
                
                auth?.protectedAction(()=> {
                    if(direction === 0 && votes.user_vote !== 0) {
                        post_data("/post/action", {postId: _id, type: "vote", direction: 0, token: grecaptchaToken}, {}, true)
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
                            setIsVoting(false)
                        })
                        .catch((err)=> {
                            setError(err)
                            setIsVoting(false)
                        })
                    }
                    if(direction === -1) {
                        post_data("/post/action", {postId: _id, type: "vote", direction: -1, token: grecaptchaToken}, {}, true)
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
                            setIsVoting(false)
                        })
                        .catch((err)=> {
                            setError(err)
                            setIsVoting(false)
                        })
                    } else if(direction === 1) {
                        post_data("/post/action", {postId: _id, type: "vote", direction: 1, token: grecaptchaToken}, {}, true)
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
                            setIsVoting(false)
                        })
                        .catch((err)=> {
                            setError(err)
                            setIsVoting(false)
                        })
                    }
                }, ()=> {alert("you must be logged in to vote")})
            })
        })
    }

    const redirect = (e:any) => {
        if(e.target.localName!=="path" && e.target.localName!=="svg" && e.target.localName!=="button" && showLinkToPost) navigate("/post/"+_id)
    }

    useEffect(()=>{
        if(error) {
            toast({
                variant: "destructive",
                title: "Uh oh! Something went wrong.",
            })
        }
    }, [error])

    var width_class = `${width ? width : "lg:w-3/5 sm:w-3/4 w-[90%]"} mx-auto`;
    return <>
        <Card className={width_class+" cursor-pointer"} onClick={redirect}>
            <CardHeader className="pb-0">
                <CardTitle>{title}</CardTitle>
                <CardDescription>{author.displayName} 
                <span className="dot-separator mx-1"></span>
                 {new Date(createdAt).toLocaleDateString() + " " + new Date(createdAt).toLocaleTimeString()}
                 </CardDescription>
                 <div className="flex flex-row content-center space-x-1">
                    <VoteButton type="like" votes={votes.votes_likes} current_vote={votes.user_vote} onClick={vote}/>
                    <VoteButton type="dislike" votes={votes.votes_dislikes} current_vote={votes.user_vote} onClick={vote}/>
                    {showLinkToPost && <Button variant="ghost" className="px-2">
                        <AiOutlineComment size={20} className="mr-1"/>
                        {comment_length}
                    </Button>}
                    { auth?.isAuthenticated && auth?.getUser().user.uid === author.id &&
                    <Button variant="ghost" className="px-2">
                        <AiOutlineDelete size={20} className="mr-1"/>
                        Delete
                    </Button>
                    }

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