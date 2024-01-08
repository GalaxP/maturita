import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import AuthContext from "contexts/AuthContext"
import { useContext, useEffect, useState } from "react"
import { useNavigate } from "react-router-dom";
import { NoResult } from "./noResult";
import GetAvatar from "helpers/getAvatar";
import { Input } from "components/ui/input";
import { post_data } from "helpers/api";

const AdminPanel = () => {
    const auth = useContext(AuthContext);
    const navigate = useNavigate();
    const [users, setUsers] = useState<[{uid: string, displayName: string, avatar: string, provider: string, posts: number}]>()
    const [searchQuery, setSearchQuery] = useState("")

    useEffect(()=>{
        if(!auth?.isAuthenticated) navigate("/")

        if(!searchQuery) return 
        post_data("/search", {query: searchQuery, type: "user"}, {}, auth?.isAuthenticated)
        .then((res)=>{
            setUsers(res.data)
            console.log(users?.length)
        })
        .catch((err)=>{

        })
    }, [searchQuery])
    return  <> 
    
    <div>
        <Input onChange={(t)=>setSearchQuery(t.target.value)} value={searchQuery}></Input>
    </div>
    {users?.length && users.length > 0 ? users.map((user, i)=> {
        return <>
            <div key={user.displayName} className={"bg-[10] border-gray-800 border-[1px] p-3 flex flex-row cursor-pointer "+(i !== 0 && "border-t-0")} onClick={()=>{navigate('/user/'+user.displayName)}}>
                <Avatar className="shadow-md inline-block my-auto" key={"avatar "+user.displayName}>
                    <AvatarImage src={GetAvatar({user: user, provider: user.provider})} />
                    <AvatarFallback>{user.displayName}</AvatarFallback>
                </Avatar>
                <div className="ml-2 w-full items-center flex" key={user.displayName+"f"}>
                    {user.displayName}<span className="dot-separator mx-1"></span><span className="text-sm text-muted-foreground">{user.posts} Posts</span>
                </div>
            </div>
        </>
        }): <h2>no results</h2>}
    </>
}

export default AdminPanel