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
import { ChevronDown, ChevronsDown, FileImage, Loader2, Tag, Upload, X } from "lucide-react"
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
import { useContext, useEffect, useState } from "react"
import { get_data, post_data } from "helpers/api"
import { waitFor } from "@testing-library/react"
import { PlusCircledIcon } from "@radix-ui/react-icons"
import { DialogTrigger, Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "../../components/ui/dialog"
import { Label } from "../../components/ui/label"
import { useNavigate } from "react-router-dom"
import { Avatar, AvatarFallback, AvatarImage } from "../../components/ui/avatar"
import GetAvatar, { GetCommunityAvatar } from "helpers/getAvatar"
import { Badge } from "components/ui/badge"
import InteractiveTextArea from "components/interactiveTextArea"
import { AddButton } from "components/ui/add-button"
import { Progress } from "components/ui/progress"
import LocalizationContext from "contexts/LocalizationContext"
import { ThemeContext } from "contexts/ThemeContext"
declare var grecaptcha:any

const _formSchema = z.object({
  community: z.string(),
  title: z.string().min(6, "Title must contain at least 6 characters").max(100, "Title must not exceed 100 characters."),
  body: z.string().max(700, "Body must not exceed 700 characters."),
  tag: z.string().optional(),
  photos: z.string().array().optional()
})
interface props {
    handleSubmit: (values: z.infer<typeof _formSchema>) => void,
    isLoading : boolean,
    defaultCommunity?: string,
    showMyCommunities?: boolean
}



export function SubmitForm({handleSubmit, isLoading, defaultCommunity, showMyCommunities}: props) {
  const localeContext = useContext(LocalizationContext)

  const formSchema = z.object({
    community: z.string({required_error:localeContext.localize("FIELD_REQUIRED")}),
    title: z.string({required_error:localeContext.localize("FIELD_REQUIRED")}).min(6, {message:localeContext.localize("TITLE_SHORT")}).max(100, {message:localeContext.localize("TITLE_LONG")}),
    body: z.string({required_error:localeContext.localize("FIELD_REQUIRED")}).max(700, {message:localeContext.localize("BODY_LONG")}),
    tag: z.string().optional(),
    photos: z.string().array().optional()
  })


  const navigate = useNavigate()
  const [openDialog, setOpenDialog] = useState(false)
  const [open, setOpen] = useState(false)
  const [showNewTeamDialog, setShowNewTeamDialog] = useState(false)
  const [communityName, setCommunityName] = useState("")
  const [communityDescription, setCommunityDescription] = useState("")
  const [selectedCommunityAvatar, setSelectedCommunityAvatar] = useState("")
  const [selectedTag, setSelectedTag] = useState<{name: string, color: string}>({name:"", color:""})
  const [isAvailable, setIsAvailable] = useState(false)
  const [selectedCommunity, setSelectedCommunity] = useState({
    value: "",
    label: "",
    avatar: "",
    tags: [{name: "", color: ""}],
    members: 0
  })
  const [query, setQuery] = useState("")
  const [communities, setCommunities] = useState({communities: [{
    value: "general",
    label: "General",
    avatar: "/avatars/community/general.jpg",
    tags: [{name: "", color: ""}],
    members: 0
  },], isEmpty : false})
  const [mycommunities, setMyCommunities] = useState({communities: [{
    value: "",
    label: "",
    avatar: "",
    tags: [{name: "", color: ""}],
    members: 0
  },], isEmpty : false})
  const [image, setImage] = useState<File>()
  const themeProvider = useContext(ThemeContext)
  const [uploadProgress, setUploadProgress] = useState(0)
  const handleImageUpload = (file: File) => {
    setUploadProgress(0)
    form.clearErrors("photos")
    if(file.type.split("/")[0] !== "image") { setUploadProgress(0);setImage(undefined); return form.setError("body",{message:"File must be an image"}) }
    if(file.size > (process.env.REACT_APP_PHOTOS_UPLOAD_LIMIT_BYTES as unknown as number)){setUploadProgress(0);setImage(undefined);return form.setError("body",{message:"File must be smaller than "+process.env.REACT_APP_PHOTOS_UPLOAD_LIMIT_STRING})}

    let data = new FormData()
    data.append("file", file)

    //clear to upload
    grecaptcha.ready(function() {
      grecaptcha.execute(process.env.REACT_APP_RECAPTCHA_SITE_KEY, {action: 'uploadCDN'}).then(function(token:string) {
          data.append("token", token)
          setUploadProgress(20)
          post_data("/cdn/upload", data, {}, true).then((res)=>{
            if(res.status === 200) {
              let photos = [process.env.REACT_APP_API_URL+"/cdn/"+res.data]
              form.setValue("photos", photos)
              setUploadProgress(100)
            }
          })
          .catch(()=>{
            setUploadProgress(0)
            form.setError("body", {message:"something went wrong"})
            form.setValue("photos", undefined)
            setImage(undefined)
          })
        }
      )
    })
  }

  

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema)
  })

  useEffect(()=>{
    if(true) {
      get_data('/account/communities', {}, true).then((res)=>{
        if(res.status === 200) {
          let _community = []
          for (let i = 0; i < res.data.length; i++) {
            _community[i] = {value: res.data[i].name, tags:res.data[i].tags, avatar: res.data[i].avatar, label: res.data[i].name, members:  res.data[i].members}
          }
          setMyCommunities({communities: _community, isEmpty: res.data.length > 0 ? false : true})
          form.setValue("tag", "")
        }
      }).catch((err)=>{console.log(err)})
      //return
    }
    if(defaultCommunity) {
      post_data("/community/search", {query: defaultCommunity}, {}, true)
      .then((res)=> {
        if(res.data.length > 0 && res.data[0].name === defaultCommunity) {
          setCommunities({communities: [{value: defaultCommunity, tags:res.data[0].tags, label: res.data[0].name, avatar: res.data[0].avatar, members: res.data[0].members}], isEmpty: false})
          setSelectedCommunityAvatar(res.data[0].avatar)
          setSelectedCommunity(res.data[0])
          form.setValue("community", defaultCommunity);
        }
      })
      .catch(()=>{})
      
    }
    for(let i = 0; i < 370; i++) {
      setUploadProgress(v => v + 1)
      //if(uploadProgress>100) setUploadProgress(0)
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
    if(!query) return setCommunities({communities: [{value: "", tags: [{name: "", color: ""}], label: "", avatar: "", members:0}], isEmpty: true})
    
    post_data("/community/search", {query: query}, {}, true)
    .then((res)=> {
      if(res.data.length === undefined || res.data.length === 0) return setCommunities({communities: [{value: "", tags: [{name: "", color: ""}], label: "", avatar: "", members:0}], isEmpty: true})
      setCommunities({communities: [{value: "", label: "", tags: [{name: "", color: ""}], avatar: "", members:0}], isEmpty: true})
      var communities_temp = [{value:"", label:"", tags: [{name: "", color: ""}], avatar: "", members:0}]
      res.data.map((community:any, index:number)=> {
        communities_temp[index] = {value: community.name, label: community.name, tags:community.tags, avatar: community.avatar, members: community.members}
      })
      setCommunities({communities: communities_temp, isEmpty: false})      
    })
  }
  const debounced = debounce(e=>searchCommunities(e), 500);

 
  function onSubmit(values: z.infer<typeof formSchema>) {
    if(values.tag === "") values.tag = undefined
    handleSubmit(values)
  }

  const contrastingColor = (hex: string, dark?: boolean) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    if ((r*0.299 + g*0.587 + b*0.114) > 186 ) {
        return dark ? "white" : "black"
    }
    return dark ? "black" : "white"
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
                <FormLabel className="mb-1">{localeContext.localize("COMMUNITY")}</FormLabel>
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
                            : <span className="mr-auto">{localeContext.localize("SELECT_COMMUNITIES")}</span>}
                          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="max-w-[310px] p-0">
                      <Command className="max-w-[310px]">
                        <CommandInput className="max-w-[310px]" placeholder={localeContext.localize("SEARCH_COMMUNITIES")} onValueChange={(e)=>{debounced(e);setQuery(e);}}/>
                        <CommandEmpty>{localeContext.localize("NO_COMMUNITIES")}</CommandEmpty>
                        { !communities.isEmpty && <CommandGroup heading={localeContext.localize("OTHERS")}>
                          {!communities.isEmpty &&
                          communities.communities.map((community) => (
                            <CommandItem
                              value={community.value}
                              key={community.value}
                              onSelect={() => {
                                form.setValue("community", community.value)
                                setSelectedCommunityAvatar(community.avatar)
                                setSelectedCommunity(community)
                                setSelectedTag({color: "", name:""})
                                form.setValue("tag", "")
                                setOpen(false)
                              }}
                            >
                              <Avatar className="h-6 w-6 mr-1">
                                <AvatarImage src={GetCommunityAvatar(community.avatar)} />
                                <AvatarFallback>NA</AvatarFallback>
                              </Avatar>
                              <span className="text-accent-foreground font-semibold max-w-[125px] overflow-clip">{community.label}</span>
                              <span className="dot-separator mx-1"></span>
                              {community.members} {localeContext.localize("MEMBERS")}
                              <Check className={cn("ml-auto h-4 w-4", community.value === field.value ? "opacity-100" : "opacity-0")}/>
                            </CommandItem>
                          ))
                                }
                        </CommandGroup> }

                        <CommandGroup heading={localeContext.localize("MY_COMMUNITIES")}>
                          {!mycommunities.isEmpty && query === "" &&
                          mycommunities.communities.map((community) => (
                            <CommandItem
                              value={community.value}
                              key={community.value}
                              onSelect={() => {
                                form.setValue("community", community.value)
                                setSelectedCommunityAvatar(community.avatar)
                                setSelectedCommunity(community)
                                setSelectedTag({color:"", name: ""})
                                form.setValue("tag", "")
                                setOpen(false)
                              }}
                            >
                              <Avatar className="h-6 w-6 mr-1">
                                <AvatarImage src={GetCommunityAvatar(community.avatar)} alt="@shadcn" />
                                <AvatarFallback>NA</AvatarFallback>
                              </Avatar>
                              <span className="text-accent-foreground font-semibold max-w-[125px] overflow-clip">{community.label}</span>
                              <span className="dot-separator mx-1"></span>
                              {community.members} {localeContext.localize("MEMBERS")}
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
                              {localeContext.localize("CREATE_COMMUNITY")}
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
            name="tag"
            render={({field})=> (
              <FormItem>
                <Dialog>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>        
                        <Button role="combobox" disabled={form.getValues("community") ? false : true} style={{backgroundColor: selectedTag.color, color: field.value ? contrastingColor(selectedTag.color) : "auto"}} variant={"round_outline"} className={"font-semibold text-accent-foreground"}>
                              <Tag strokeWidth={1.8} size={20} className="mr-2"></Tag>
                            {field.value ? field.value : localeContext.localize("TAG")}
                            <ChevronDown strokeWidth={1.3} className="ml-auto"></ChevronDown>
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="max-w-[250px] p-0">
                      <Command className="max-w-[250px]">
                        <CommandInput className="max-w-[310px]" placeholder={localeContext.localize("SEARCH_TAGS")}/>
                        <CommandEmpty>{localeContext.localize("NO_TAGS")}</CommandEmpty>
                        { selectedCommunity && selectedCommunity.tags.length>0 && <CommandGroup>
                          { selectedCommunity.value !== "" && selectedCommunity.tags &&
                          selectedCommunity.tags.map((tag) => (
                            <CommandItem
                              value={tag.name}
                              key={tag.name}
                              onSelect={() => {
                                form.setValue("tag", tag.name)
                                setSelectedTag({color: tag.color, name: tag.name})
                              }}
                            >
                              <Badge className={"h-5 ml-1 text-center text-accent-foreground"} style={{backgroundColor: tag.color, color: contrastingColor(tag.color)}} variant={"secondary"}>{tag.name}</Badge>
                              <Check className={cn("ml-auto h-4 w-4", form.getValues().tag === tag.name ? "opacity-100" : "opacity-0")}/>
                            </CommandItem>
                          ))
                                }
                        </CommandGroup> }
                      </Command>
                    </PopoverContent>
                  </Popover>
                  
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
                <FormLabel>{localeContext.localize("TITLE")}</FormLabel>
                <FormControl>
                  <Input disabled={isLoading} placeholder={localeContext.localize("TITLE")} {...field} />
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
                <FormLabel>{localeContext.localize("BODY")}</FormLabel>
                <FormControl>
                  <InteractiveTextArea customButtonHeight="10" extraButton=
                  {
                    <div className="float-left">
                      <input type="file" id="imageupload" className="hidden" accept="image/*" onChange={(e:any)=>{setImage(e.target.files[0]);handleImageUpload(e.target.files[0])}}/>
                      <Button variant={"round_outline"} className={"font-semibold w-auto flex flex-col"} onClick={(e)=>{e.preventDefault();if(image) return; document.getElementById("imageupload")?.click()}}>
                        <div className="flex flex-row items-center">
                          <Upload size={20} className="mr-1"></Upload>
                          {image ? image.name: localeContext.localize("UPLOAD_IMAGE")}
                          {image && uploadProgress < 100 && <Loader2 className="mx-1 h-4 w-4 animate-spin" />}
                          {image && <X className="p-0 pl-1 h-4" onClick={(e)=>{e.preventDefault();setUploadProgress(0); setImage(undefined);form.setValue("photos", undefined)}} aria-description="prevent" size={15}></X>}
                        </div>
                      </Button>
                      { image && <div className="w-full mt-[-4px] h-1 px-4"> <Progress value={uploadProgress} className=" h-1"></Progress> </div>}
                    </div>
                  }
                  isLoading={isLoading} disabled={isLoading} buttonText={localeContext.localize("SUBMIT")} comment={form.getValues("body") || ""} submitComment={()=>{}} setComment={(e)=>{form.setValue("body", e)}} id="submitTextArea" isAuthenticated placeholder={localeContext.localize("BODY_PLACEHOLDER")} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* <FormField
          control={form.control}
            name="photos"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <div className="float-left">
                    <input type="file" id="imageupload" className="hidden" accept="image/*" onChange={(e:any)=>{setImage(e.target.files[0]);handleImageUpload(e.target.files[0])}}/>
                    <Button variant={"round_outline"} className={"font-semibold w-auto flex flex-col"} onClick={(e)=>{e.preventDefault();if(image) return; document.getElementById("imageupload")?.click()}}>
                      <div className="flex flex-row items-center">
                        <Upload size={20} className="mr-1"></Upload>
                        {image ? image.name: "Upload an image"}
                        {image && <X className="p-0 pl-1 h-4" onClick={(e)=>{e.preventDefault();setImage(undefined);form.setValue("photos", undefined)}} aria-description="prevent" size={15}></X>}
                      </div>
                    </Button>
                      { image && <div className="w-full mt-[-4px] h-1 px-4"> <Progress value={uploadProgress} className=" h-1"></Progress> </div>}

                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          /> */}
        </div>
      </form>
    </Form>
  )
}