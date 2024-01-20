import { Button } from "../components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import AuthContext from "contexts/AuthContext";
import { post_data } from "helpers/api";
import { useContext, useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { PostSchema } from "schemas/postSchema";
import { Post } from "components/post";
import GetAvatar, { GetCommunityAvatar } from "helpers/getAvatar";
import { Tabs, TabsContent, TabsTrigger, TabsList } from "../components/ui/tabs";
import { NoResult } from "components/noResult";
import { Skeleton } from "components/ui/skeleton";
import SearchSkeleton from "components/skeleton/search";

declare var grecaptcha:any

export const Search = () => {
    const [searchParams] = useSearchParams();
    const auth = useContext(AuthContext)
    const [loaded, setLoaded] = useState(false)
    const [communities, setCommunities] = useState<[{name: string, description: string, members: number, isMember?:boolean, avatar: string}]>()
    const [posts, setPosts] = useState<[PostSchema]>()
    const [users, setUsers] = useState<[{uid: string, displayName: string, avatar: string, provider: string, posts: number}]>()
    const navigate = useNavigate()

    useEffect(()=>{
        const searchQuery = searchParams.get("q")
        const type = searchParams.get('t')

        setLoaded(false)
        setCommunities(undefined)
        setPosts(undefined)
        
        grecaptcha.ready(function() {
                grecaptcha.execute(process.env.REACT_APP_RECAPTCHA_SITE_KEY, {action: 'search'}).then(function(token:string) {
                post_data("/search", {query: searchQuery, type: type, token: token}, {}, auth?.isAuthenticated)
                    .then((res)=>{
                        if(type==="community") setCommunities(res.data)
                        if(type==="post") setPosts(res.data)
                        if(type==="user") setUsers(res.data)
                        setLoaded(true)
                })
                .catch(()=>{setLoaded(true)})
            }); 
        });
    }, [searchParams])

    return <>
        {loaded ? <>
            <div className="w-11/12 lg:w-[800px] sm:w-11/12 mx-auto mt-6">
                <Tabs defaultValue={searchParams.get('t') || "community"} className="mx-auto items-center flex flex-col" activationMode="manual">
                    <TabsList>
                        <TabsTrigger onClick={()=>navigate("/search?q="+searchParams.get("q")+"&t="+"community")} value="community" >Communities</TabsTrigger>
                        <TabsTrigger onClick={()=>navigate("/search?q="+searchParams.get("q")+"&t="+"post")} value="post">Posts</TabsTrigger>
                        <TabsTrigger onClick={()=>navigate("/search?q="+searchParams.get("q")+"&t="+"user")} value="user">Users</TabsTrigger>
                    </TabsList>
                    <TabsContent value="community" className="w-full">
                        {communities?.length && communities.length > 0 ? communities.map((community, i)=> {
                        return <>
                            <div key={community.name} className={"bg-[10] border-gray-800 border-[1px] p-3 flex flex-row cursor-pointer "+(i !== 0 && "border-t-0")} onClick={()=>{navigate('/community/'+community.name)}}>
                                <Avatar className="shadow-md inline-block my-auto" key={"avatar "+community.name}>
                                    <AvatarImage src={GetCommunityAvatar(community.avatar)} />
                                    <AvatarFallback>{community.name}</AvatarFallback>
                                </Avatar>
                                <div className="ml-2 w-full" key={community.name+"f"}>
                                    <div className="flex flex-row">
                                        <div className="flex-grow">
                                            {community.name}<span className="dot-separator mx-1"></span><span className="text-sm text-muted-foreground">{community.members} Members</span>
                                            <p className="text-sm text-muted-foreground">{community.description}</p>

                                        </div>
                                        <div>
                                            <Button variant={"outline"} className="justify-end" key={"button "+community.name} onClick={()=>alert("je")}>{community.isMember ? "Leave" : "Join"}</Button>
                                        </div>
                                    </div>
                                    
                                </div>
                            </div>
                        </>
                    }): searchParams.get("t")==="community" ? loaded ? <NoResult query={searchParams.get("q")}/> : <SearchSkeleton></SearchSkeleton> : <SearchSkeleton></SearchSkeleton>}
                    </TabsContent>

                    <TabsContent value="post" className="w-full">
                        <div className="space-y-2">
                            {posts?.length && posts.length > 0 ? posts.map((post)=> {
                                return <Post key={post._id} props={post} showCommunity showLinkToPost width="w-full"/>
                            }): searchParams.get("t")==="post" ? loaded ? <NoResult query={searchParams.get("q")}/> : <SearchSkeleton></SearchSkeleton> : <SearchSkeleton></SearchSkeleton>}
                        </div>
                    </TabsContent>

                    <TabsContent value="user" className="w-full">
                        {users?.length && users.length > 0 ? users.map((user, i)=> {
                        return <>
                            <div key={user.displayName} className={"bg-[10] border-gray-800 border-[1px] p-3 flex flex-row cursor-pointer "+(i !== 0 && "border-t-0")} onClick={()=>{navigate('/user/'+user.uid)}}>
                                <Avatar className="shadow-md inline-block my-auto" key={"avatar "+user.displayName}>
                                    <AvatarImage src={GetAvatar({user: user, provider: user.provider})} />
                                    <AvatarFallback>{user.displayName}</AvatarFallback>
                                </Avatar>
                                <div className="ml-2 w-full items-center flex" key={user.displayName+"f"}>
                                    {user.displayName}<span className="dot-separator mx-1"></span><span className="text-sm text-muted-foreground">{user.posts} Posts</span>
                                </div>
                            </div>
                        </>
                        }): searchParams.get("t")==="user" ? loaded ? <NoResult query={searchParams.get("q")}/> : <SearchSkeleton></SearchSkeleton> : <SearchSkeleton></SearchSkeleton>}
                </TabsContent>
                </Tabs>
            </div>
        </> : 
        <div className="mt-6">
        <Tabs defaultValue={searchParams.get('t') || "community"} className="mx-auto items-center flex flex-col" activationMode="manual">
            <TabsList>
                <TabsTrigger onClick={()=>navigate("/search?q="+searchParams.get("q")+"&t="+"community")} value="community" >Communities</TabsTrigger>
                <TabsTrigger onClick={()=>navigate("/search?q="+searchParams.get("q")+"&t="+"post")} value="post">Posts</TabsTrigger>
                <TabsTrigger onClick={()=>navigate("/search?q="+searchParams.get("q")+"&t="+"user")} value="user">Users</TabsTrigger>
            </TabsList>
        <SearchSkeleton></SearchSkeleton>
        </Tabs>
        </div> 
        }
    </>
}