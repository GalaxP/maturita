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
import { post_data } from "helpers/api"
import { waitFor } from "@testing-library/react"

const formSchema = z.object({
  community: z.string(),
  title: z.string().min(6, "Title must contain at least 6 characters"),
  body: z.string()
})
interface props {
    handleSubmit: (values: z.infer<typeof formSchema>) => void,
    isLoading : boolean
}


var throttled = false;
export function SubmitForm({handleSubmit, isLoading}: props) {
  const [open, setOpen] = useState(false)
  const [communities, setCommunities] = useState({communities: [{
    value: "general",
    label: "General",
  },
  {
    value: "sveltekit",
    label: "SvelteKit",
  },
  {
    value: "nuxt.js",
    label: "Nuxt.js",
  },
  {
    value: "remix",
    label: "Remix",
  },
  {
    value: "astro",
    label: "Astro",
  },], isEmpty : false})

  function throttle(cb:any, delay:number) {
    let wait = false;
  
    return (...args: any) => {
      if (wait) {
          return;
      }
  
      cb(...args);
      wait = true;
      setTimeout(() => {
        wait = false;
      }, delay);
    }
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
 
  
  const searchCommunities = (query: string) => {
    //while(throttled) {;}
    //waitFor(() => throttled === false).then(()=>{console.log(throttled)})

    if(!query) return setCommunities({communities: [{value: "", label: ""}], isEmpty: true})
    post_data("/community/search", {query: query})
    .then((res)=> {
      //console.log(res.data.length)
      //throttled = true
      //setTimeout(()=>{console.log("who let the dogs out");throttled = false}, 5000)
      if(res.data.length === undefined || res.data.length === 0) return setCommunities({communities: [{value: "", label: ""}], isEmpty: true})
      setCommunities({communities: [{value: "", label: ""}], isEmpty: true})
      var communities_temp = [{value:"", label:""}]
      res.data.map((community:any, index:number)=> {
        communities_temp[index] = {value: community.name, label: community.name}
      })
      setCommunities({communities: communities_temp, isEmpty: false})
      //console.log(communities)
      
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
                      <CommandGroup>
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
                    </Command>
                  </PopoverContent>
                </Popover>

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