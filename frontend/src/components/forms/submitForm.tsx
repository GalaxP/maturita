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
import { Loader2 } from "lucide-react"
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

const formSchema = z.object({
  community: z.string(),
  title: z.string().min(6, "Title must contain at least 6 characters"),
  body: z.string()
})
interface props {
    handleSubmit: (values: z.infer<typeof formSchema>) => void,
    isLoading : boolean
}



export function SubmitForm({handleSubmit, isLoading}: props) {
  const navigate = useNavigate()
  const [openDialog, setOpenDialog] = useState(false)
  const [open, setOpen] = useState(false)
  const [showNewTeamDialog, setShowNewTeamDialog] = useState(false)
  const [communityName, setCommunityName] = useState("")
  const [communityDescription, setCommunityDescription] = useState("")
  const [isAvailable, setIsAvailable] = useState(false)
  const [communities, setCommunities] = useState({communities: [{
    value: "general",
    label: "General",
  },], isEmpty : false})


  const createCommunity = () => {
    post_data("/community/create", {name: communityName, description: communityDescription}, {}, true)
    .then(()=>{
      navigate("/community/" + communityName)
    })
    .catch((err)=>{
      alert('something went wrong')
    })
  }
  
  type FuncType = (...args: any[]) => any;
  function debounce(func: FuncType, delay: number) {
    let timeoutId: NodeJS.Timeout;

    return function debounced(...args: any[]) {
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
    if(!query) return setCommunities({communities: [{value: "", label: ""}], isEmpty: true})
    post_data("/community/search", {query: query})
    .then((res)=> {
      if(res.data.length === undefined || res.data.length === 0) return setCommunities({communities: [{value: "", label: ""}], isEmpty: true})
      setCommunities({communities: [{value: "", label: ""}], isEmpty: true})
      var communities_temp = [{value:"", label:""}]
      res.data.map((community:any, index:number)=> {
        communities_temp[index] = {value: community.name, label: community.name}
      })
      setCommunities({communities: communities_temp, isEmpty: false})      
    })
  }
  const debounced = debounce(searchCommunities, 500);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema)
  })

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
                <FormLabel>Community</FormLabel>
                <Dialog open={showNewTeamDialog} onOpenChange={setShowNewTeamDialog}>
                  <Popover open={open} onOpenChange={setOpen}>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          role="combobox"
                          className="w-[200px] justify-between"
                          >
                          {field.value
                            ? //communities.find((communities) => communities.value === field.value)?.label
                            field.value
                            : "Select communities"}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-[200px] p-0">
                      <Command>
                        <CommandInput placeholder="Search communities..." onValueChange={(e)=>{debounced(e)}}/>
                        <CommandEmpty>No communities found.</CommandEmpty>
                        <CommandGroup heading="Others">
                          {!communities.isEmpty &&
                          communities.communities.map((community) => (
                            <CommandItem
                              value={community.value}
                              key={community.value}
                              onSelect={() => {
                                form.setValue("community", community.value)
                                setOpen(false)
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  community.value === field.value ? "opacity-100" : "opacity-0"
                                )}
                              />
                              {community.label}
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
                        Create a new comunity on reddit.
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