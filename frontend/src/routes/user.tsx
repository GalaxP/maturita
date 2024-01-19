import { Post } from "components/post"
import HomeSkeleton from "components/skeleton/home"
import { Avatar, AvatarFallback, AvatarImage } from "components/ui/avatar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "components/ui/card"
import AuthContext from "contexts/AuthContext"
import { get_data } from "helpers/api"
import prettyDate from "helpers/dateFormat"
import GetAvatar, { getStringAvatar } from "helpers/getAvatar"
import { CakeSlice, Calendar } from "lucide-react"
import { useContext, useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import { PostSchema } from "schemas/postSchema"

const User = () => {
    const [user, setUser] = useState<{id: string, displayName:string, provider: string, createdAt:number, avatar:string, posts_length:number, posts: PostSchema[]}>({avatar:"",displayName:"", id:"", createdAt:0, provider:"", posts_length:0, posts: [{author:{id:"",displayName:"", avatar:""}, title:"", createdAt: new Date(), body:"", _id:"", community: {name: "", avatar:""}, votes_likes:0, votes_dislikes:0, user_vote:0, comments:[], comment_length :0}]})
    const { userId } = useParams()
    const [error, setError] = useState("")
    const auth = useContext(AuthContext)
    const [loaded, setLoaded] = useState(false)

    useEffect(()=>{
        if(!userId) return setError("404")
        setLoaded(false)
        get_data("/user/"+userId, {}, true).then((res)=>{
            if(res.status === 404) return setError("404")
            setUser(res.data)
            setLoaded(true)
        })
        .catch((err)=>{setError(err)})
    },[])

    const posts_obj = [];
    for (let i = 0; i < user?.posts?.length; i++) {
      posts_obj.push(<li key={user.posts[i]._id} className="w-full mt-0"><Post key={user.posts[i]._id} showLinkToPost={true} width="w-full" props={user.posts[i]}/> </li>);
    }

    return <>
        {error ? <h1>User not found</h1> : loaded ? <>
        <div className="mt-6">
            <div className="flex flex-row w-full justify-center"> 
                <ul className="w-11/12 lg:w-[650px] sm:w-11/12 space-y-2">
                    <li className="block lg:hidden"><div className="w-full lg:block ">
                    <Card>
                        <CardHeader>
                            <CardTitle>
                                
                                <div className="flex flex-row">
                                    <Avatar className="shadow-md cursor-pointer w-20 h-20 inline-block mr-1">
                                        <AvatarImage src={getStringAvatar(user.avatar, user.provider)}/>
                                        <AvatarFallback>{user.displayName}</AvatarFallback>
                                    </Avatar>
                                    <div className="flex flex-col ml-2">
                                        <p>{user.displayName}</p>
                                        <div className="flex flex-row mt-2 space-x-1">
                                            <CakeSlice size={20} strokeWidth={1.5}></CakeSlice>
                                            <p className="text-sm font-normal">{prettyDate(new Date(user.createdAt).getTime())}</p>
                                        </div>
                                        
                                    </div>
                                </div>
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div>
                                {user.posts_length} posts
                                {}
                            </div>
                        </CardContent>
                    </Card>
                </div></li>
                    {posts_obj}
                </ul>
                <div className="w-[300px] hidden sm:hidden md:hidden lg:block ml-6 space-y-2 mt-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>
                                
                                <div className="flex flex-row">
                                    <Avatar className="shadow-md cursor-pointer w-20 h-20 inline-block mr-1">
                                        <AvatarImage src={getStringAvatar(user.avatar, user.provider)}/>
                                        <AvatarFallback>{user.displayName}</AvatarFallback>
                                    </Avatar>
                                    <div className="flex flex-col ml-2">
                                        <p>{user.displayName}</p>
                                        <div className="flex flex-row mt-2 space-x-1">
                                            <CakeSlice size={20} strokeWidth={1.5}></CakeSlice>
                                            <p className="text-sm font-normal">{prettyDate(new Date(user.createdAt).getTime())}</p>
                                        </div>
                                        
                                    </div>
                                </div>
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div>
                                {user.posts_length} posts
                                {}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
        </>
     
     : <HomeSkeleton></HomeSkeleton>}</>
}
export default User