import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
 
import { Button } from "../../components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../../components/ui/form"
import { Input } from "../../components/ui/input"
import { useForm } from "react-hook-form"
import { Check, ChevronsUpDown, Loader2 } from "lucide-react"


import { useState } from "react"
import { post_data } from "helpers/api"
import { Avatar, AvatarFallback, AvatarImage } from "components/ui/avatar"
import GetAvatar from "helpers/getAvatar"
declare var grecaptcha:any
 
const formSchema = z.object({
    moderator: z.string()
})
interface props {
    handleSubmit: ({id, displayName}: {id: string, displayName: string}) => void,
    isLoading : boolean
}
export function AddModeratorForm({handleSubmit, isLoading}: props) {
    const [query, setQuery] = useState("")
    const [users, setUsers] = useState<[{uid: string, displayName: string, avatar: string, provider: string, posts: number}]>()
    const [selectedUserIndex, setSelectedUserIndex] = useState<number>()
    const [fetching, setFetching] = useState(false)

    const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema)
  })
  function onSubmit(values: z.infer<typeof formSchema>) {
    if(!users || !selectedUserIndex) return
    handleSubmit({id: values.moderator, displayName: users[selectedUserIndex].displayName})
  }

  const search = (_query:string) => {
    setFetching(true)
    grecaptcha.ready(function() {
        grecaptcha.execute(process.env.REACT_APP_RECAPTCHA_SITE_KEY, {action: 'search'}).then(function(token:string) {
        post_data("/search", {query: _query, type: "user", token: token}, {}, true)
            .then((res)=>{
              setFetching(false)
              setUsers(res.data)
        })
        .catch(()=>{setFetching(false);setUsers(undefined)})}); 
    });
  }

  return (

    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3 w-full">
        <div className="space-y-2">
            <FormField
                control={form.control}
                name="moderator"
                render={({ field }) => (
                    <FormItem className="flex flex-col">
                        <>
                            <Input className="mt-3" value={query} onChange={(e:any)=>{search(e.target.value);setQuery(e.target.value)}}/>
                            {users?.map((user, i)=>{
                                return <div onClick={()=>{setSelectedUserIndex(i); form.setValue("moderator", users[i].uid)}} key={user.displayName} className={"bg-[10] mt-2 flex flex-row cursor-pointer hover:bg-accent-foreground/5 "+(i !== 0 && "border-t-0")}>
                                    <Avatar className="shadow-md inline-block my-auto" key={"avatar "+user.displayName}>
                                        <AvatarImage src={GetAvatar({user: user, provider: user.provider})} />
                                        <AvatarFallback>{user.displayName}</AvatarFallback>
                                    </Avatar>
                                    <div className="ml-2 w-full items-center flex" key={user.displayName+"f"}>
                                        {user.displayName}<span className="dot-separator mx-1"></span><span className="text-sm text-muted-foreground">{user.posts} Posts</span>
                                    </div>
                                    { selectedUserIndex === i && <Check className="my-auto mr-2" /> }
                                </div>
                            })}
                            {!fetching && !users && <p className="mx-auto mt-2">no users found</p>}
                            {fetching && <Loader2 className="mr-2 mt-2 w-full mx-auto animate-spin" />}
                        </>
                    <FormMessage />
                  </FormItem>
                )}
            />

        </div>
        <Button disabled={isLoading || selectedUserIndex===undefined} variant={"default"} className="mt-6 d:w-28 sm:w-full ">
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" /> }
        Add Moderator
        </Button>
      
        
      </form>
    </Form>
  )
}