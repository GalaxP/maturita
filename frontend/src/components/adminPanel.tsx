import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import AuthContext from "contexts/AuthContext"
import { useContext, useEffect, useState } from "react"
import { useNavigate } from "react-router-dom";
import { NoResult } from "./noResult";
import GetAvatar from "helpers/getAvatar";
import { Input } from "components/ui/input";
import { get_data, post_data } from "helpers/api";
import { useDocumentTitle } from "hooks/setDocuemntTitle";
import { Button } from "./ui/button";
import { DataTable } from "./ui/dataTable";
import { columns } from "schemas/contactSchema";
import { DataTablePagination } from "./ui/dataTablePagination";
import LocalizationContext from "contexts/LocalizationContext";
import { NewsLetterForm } from "./forms/newsLetterForm";
import { toast, useToast } from "./ui/use-toast";
declare var grecaptcha:any

interface IMessage {
    _id: string
    firstName: string,
    lastName: string,
    title: string,
    body: string,
    email: string,
    userAgent: string,
    remoteIP: string,
    createdAt: number,
}

const AdminPanel = () => {
    const auth = useContext(AuthContext);
    const navigate = useNavigate();
    const [users, setUsers] = useState<[{uid: string, displayName: string, avatar: string, provider: string, posts: number}]>()
    const [searchQuery, setSearchQuery] = useState("")
    const documentTitle = useDocumentTitle("Admin Panel")
    const localeContext = useContext(LocalizationContext)
    const [newsletterLoading, setNewsletterLoading] = useState(false)
    const { toast } = useToast()

    const [messages, setMessages] = useState<IMessage[]>([])

    useEffect(()=>{
        if(!auth?.isAuthenticated) navigate("/")

        

        get_data("/messages", {}, true)
        .then((res)=>{
            if(res.status === 200) {
                setMessages(res.data)
            }
        }).catch(()=>{})
    }, [])
    const search = () => {
        grecaptcha.ready(function() {
            grecaptcha.execute(process.env.REACT_APP_RECAPTCHA_SITE_KEY, {action: 'search'}).then(function(token:string) {
                if(!searchQuery) return 
                post_data("/search", {query: searchQuery, type: "user", token: token}, {}, auth?.isAuthenticated)
                .then((res)=>{
                    setUsers(res.data)
                })
                .catch((err)=>{
                    
                })
            });
        });
    }
    const ban_user = (uid: string) => {

    }

    const sendNewsletter = (data: { message: string; title: string; }) => {
        setNewsletterLoading(true)

        post_data("/sendNewsletter", {message: data.message, title: data.title}, {}, true)
        .then((res)=>{
            if(res.status===200) {
                toast({
                    variant: "default",
                    description: localeContext.localize("NEWSLETTER_SEND_SUCCES")
                })
                setNewsletterLoading(false)

            }
            setNewsletterLoading(false)
        })
        .catch(()=> {
            toast({
                variant: "destructive",
                description: localeContext.localize("ERROR_GENERIC")
            })
            setNewsletterLoading(false)
        })
    }

    return  <div className="w-11/12 flex flex-col justify-center mx-auto mt-6"> 
    
    <div className="w-full">
        <Input onChange={(t)=>setSearchQuery(t.target.value)} value={searchQuery}></Input>
        <Button onClick={search}>Search</Button>
    </div>
    {users?.length && users.length > 0 ? users.map((user, i)=> {
        return <>
            <div key={user.displayName} className={"bg-[10] border-gray-800 border-[1px] p-3 flex flex-row cursor-pointer w-full "+(i !== 0 && "border-t-0")} onClick={(e:any)=>{ if(e.target.tagName==="BUTTON") ban_user(user.uid); else navigate('/user/'+user.uid) }}>
                <Avatar className="shadow-md inline-block my-auto" key={"avatar "+user.displayName}>
                    <AvatarImage src={GetAvatar({user: user, provider: user.provider})} />
                    <AvatarFallback>{user.displayName}</AvatarFallback>
                </Avatar>
                <div className="ml-2 w-full items-center flex" key={user.displayName+"f"}>
                    {user.displayName}<span className="dot-separator mx-1"></span><span className="text-sm text-muted-foreground">{user.posts} Posts</span>
                </div>
                <Button>Ban</Button>
            </div>
        </>
        }): <h2>no results</h2>}

        <DataTable columns={columns} data={messages} usePagination></DataTable>
        <div className="w-3/4 mx-auto">
            <NewsLetterForm handleSubmit={(e)=>sendNewsletter(e)} isLoading={newsletterLoading}></NewsLetterForm>
        </div>
    </div>
}

export default AdminPanel