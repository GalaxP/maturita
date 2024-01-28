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
import { ChevronDown, ChevronsDown, Loader2 } from "lucide-react"
import { Textarea } from "../ui/textarea"

import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "../ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../ui/popover"
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "../ui/lib/utils";
import { useEffect, useState } from "react"
import { get_data, post_data } from "helpers/api"
import { waitFor } from "@testing-library/react"
import { PlusCircledIcon } from "@radix-ui/react-icons"
import { DialogTrigger, Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "../../components/ui/dialog"
import { Label } from "../../components/ui/label"
import { useNavigate } from "react-router-dom"
import { Avatar, AvatarFallback, AvatarImage } from "../../components/ui/avatar"
import GetAvatar, { GetCommunityAvatar } from "helpers/getAvatar"

const formSchema = z.object({
  community: z.string(),
  title: z.string().min(6, "Title must contain at least 6 characters").max(70, "Title must not exceed 70 characters."),
  body: z.string().max(700, "Body must not exceed 700 characters.")
})
interface props {
    handleSubmit: (values: z.infer<typeof formSchema>) => void,
    isLoading : boolean,
    defaultCommunity?: string,
    showMyCommunities?: boolean
}



export function SubmitForm({handleSubmit, isLoading, defaultCommunity, showMyCommunities}: props) {
  const navigate = useNavigate()
  const [openDialog, setOpenDialog] = useState(false)
  const [open, setOpen] = useState(false)
  const [showNewTeamDialog, setShowNewTeamDialog] = useState(false)
  const [communityName, setCommunityName] = useState("")
  const [communityDescription, setCommunityDescription] = useState("")
  const [selectedCommunityAvatar, setSelectedCommunityAvatar] = useState("")
  const [isAvailable, setIsAvailable] = useState(false)
  const [query, setQuery] = useState("")
  const [communities, setCommunities] = useState({communities: [{
    value: "general",
    label: "General",
    avatar: "/avatars/community/general.jpg",
    members: 0
  },], isEmpty : false})
  const [mycommunities, setMyCommunities] = useState({communities: [{
    value: "",
    label: "",
    avatar: "",
    members: 0
  },], isEmpty : false})


  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema)
  })

  useEffect(()=>{
    if(true) {
      get_data('/account/communities', {}, true).then((res)=>{
        if(res.status === 200) {
          let _community = []
          for (let i = 0; i < res.data.length; i++) {
            _community[i] = {value: res.data[i].name, avatar: res.data[i].avatar, label: res.data[i].name, members:  res.data[i].members}
          }
          setMyCommunities({communities: _community, isEmpty: res.data.length > 0 ? false : true})
        }
      }).catch((err)=>{console.log(err)})
      //return
    }
    if(defaultCommunity) {
      post_data("/community/search", {query: defaultCommunity}, {}, true)
      .then((res)=> {
        if(res.data.length > 0 && res.data[0].name === defaultCommunity) {
          setCommunities({communities: [{value: defaultCommunity, label: res.data[0].name, avatar: res.data[0].avatar, members: res.data[0].members}], isEmpty: false})
          setSelectedCommunityAvatar(res.data[0].avatar)
          form.setValue("community", defaultCommunity);
        }
      })
      .catch(()=>{})
      
    }
  }, [])
  const createCommunity = () => {
    post_data("/community/create", {name: communityName, description: communityDescription}, {}, true)
    .then(()=>{
      navigate("/community/" + communityName)
    })
    .catch((err)=>{
      alert('something went wrong')
    })
  }
  
  type FuncType = (...args: any) => any;
  function debounce(func: FuncType, delay: number) {
    let timeoutId: NodeJS.Timeout;

    return function debounced(...args: any) {
      const later = () => {
        func(args);
      };

      clearTimeout(timeoutId);
      timeoutId = setTimeout(later, delay);
    };
  }

  const checkAvailability = (communityName: string) => {
    get_data("/community/"+communityName)
    .then(()=>{
      setIsAvailable(false)
    })
    .catch(()=>{
      setIsAvailable(true)
    })
  }
  const debouncedCA = debounce(checkAvailability, 500);

  const searchCommunities = (query: string) => {
    query = query[0]
    if(!query) return setCommunities({communities: [{value: "", label: "", avatar: "", members:0}], isEmpty: true})
    
    post_data("/community/search", {query: query}, {}, true)
    .then((res)=> {
      if(res.data.length === undefined || res.data.length === 0) return setCommunities({communities: [{value: "", label: "", avatar: "", members:0}], isEmpty: true})
      setCommunities({communities: [{value: "", label: "", avatar: "", members:0}], isEmpty: true})
      var communities_temp = [{value:"", label:"", avatar: "", members:0}]
      res.data.map((community:any, index:number)=> {
        communities_temp[index] = {value: community.name, label: community.name, avatar: community.avatar, members: community.members}
      })
      setCommunities({communities: communities_temp, isEmpty: false})      
    })
  }
  const debounced = debounce(searchCommunities, 500);

 
  function onSubmit(values: z.infer<typeof formSchema>) {
    handleSubmit(values)
  }

  useEffect(()=>{
  }, [communities])

  return (

    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3 w-full">
        <div className="space-y-2">
          <FormField
            control={form.control}
            name="community"
            render={({field})=> (
              <FormItem className="flex flex-col">
                <FormLabel className="mb-1">Community</FormLabel>
                <Dialog open={showNewTeamDialog} onOpenChange={setShowNewTeamDialog}>
                  <Popover open={open} onOpenChange={(e)=>{setOpen(e); setCommunityDescription(""); setQuery(""); setCommunities({communities:[],isEmpty:true}) }}>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          role="combobox"
                          className="max-w-[300px] justify-normal"
                          >
                          {field.value
                            ? //communities.find((communities) => communities.value === field.value)?.label
                            <>
                            <Avatar className="h-6 w-6 mr-1">
                            <AvatarImage src={GetCommunityAvatar(selectedCommunityAvatar)} alt="@shadcn" />
                            <AvatarFallback>NA</AvatarFallback>
                          </Avatar>

                            <span className="mr-auto">{field.value}</span></>
                            : <span className="mr-auto">Select communities</span>}
                          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="max-w-[310px] p-0">
                      <Command className="max-w-[310px]">
                        <CommandInput className="max-w-[310px]" placeholder="Search communities..." onValueChange={(e)=>{setQuery(e);debounced(e)}}/>
                        <CommandEmpty>No communities found.</CommandEmpty>
                        { !communities.isEmpty && <CommandGroup heading="Others">
                          {!communities.isEmpty &&
                          communities.communities.map((community) => (
                            <CommandItem
                              value={community.value}
                              key={community.value}
                              onSelect={() => {
                                form.setValue("community", community.value)
                                setSelectedCommunityAvatar(community.avatar)
                                setOpen(false)
                              }}
                            >
                              <Avatar className="h-6 w-6 mr-1">
                                <AvatarImage src={GetCommunityAvatar(community.avatar)} alt="@shadcn" />
                                <AvatarFallback>NA</AvatarFallback>
                              </Avatar>
                              <span className="text-black font-semibold">{community.label}</span>
                              <span className="dot-separator mx-1"></span>
                              {community.members} members
                              <Check className={cn("ml-auto h-4 w-4", community.value === field.value ? "opacity-100" : "opacity-0")}/>
                            </CommandItem>
                          ))
                                }
                        </CommandGroup> }

                        <CommandGroup heading="My Communities">
                          {!mycommunities.isEmpty && query === "" &&
                          mycommunities.communities.map((community) => (
                            <CommandItem
                              value={community.value}
                              key={community.value}
                              onSelect={() => {
                                form.setValue("community", community.value)
                                setSelectedCommunityAvatar(community.avatar)
                                setOpen(false)
                              }}
                            >
                              <Avatar className="h-6 w-6 mr-1">
                                <AvatarImage src={GetCommunityAvatar(community.avatar)} alt="@shadcn" />
                                <AvatarFallback>NA</AvatarFallback>
                              </Avatar>
                              <span className="text-black font-semibold">{community.label}</span>
                              <span className="dot-separator mx-1"></span>
                              {community.members} members
                              <Check className={cn("ml-auto h-4 w-4", community.value === field.value ? "opacity-100" : "opacity-0")}/>
                            </CommandItem>
                          ))
                                }
                        </CommandGroup>

                        <CommandSeparator />
                        <CommandGroup>
                          <DialogTrigger asChild>
                            <CommandItem onSelect={() => {setOpenDialog(false);setShowNewTeamDialog(true)}}>

                              <PlusCircledIcon className="mr-2 h-5 w-5" />
                              Create A Community
                            </CommandItem>
                          </DialogTrigger>
                        </CommandGroup>
                      </Command>
                    </PopoverContent>
                  </Popover>
                  
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Create a new community</DialogTitle>
                      <DialogDescription>
                        Create a new comunity.
                      </DialogDescription>
                    </DialogHeader>
                      <div className="space-y-4 py-2 pb-4">
                        <div className="space-y-2">
                          <Label htmlFor="name">Community name</Label>
                          <Input id="name" onChange={(e)=>{debouncedCA(e.target.value); setCommunityName(e.target.value)}} value={communityName}/>
                          <p className="text-sm font-medium text-destructive">{!isAvailable && "Unavailable"}</p>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="plan">Community Description</Label>
                          <Input id="description" placeholder="description" onChange={(e)=>{setCommunityDescription(e.target.value)}} value={communityDescription}/>
                          <p className={"text-sm font-medium text-destructive "+ (communityDescription==="" ? "block" : "hidden")}>Required</p>
                        </div>
                      </div>
                    <DialogFooter>
                      <Button type="submit" onClick={()=>{if(communityDescription !== "" && isAvailable){createCommunity()} }}>Confirm</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>

                <FormMessage/>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Title</FormLabel>
                <FormControl>
                  <Input disabled={isLoading} placeholder="Title" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
          control={form.control}
            name="body"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Body</FormLabel>
                <FormControl>
                  <Textarea disabled={isLoading} placeholder="Type your message here." {...field}/>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <Button type="submit" disabled={isLoading} className="w-full mt-6">
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" /> }
            Post
        </Button>
      </form>
    </Form>
  )
}