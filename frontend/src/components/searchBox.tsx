import {
    Calculator,
    Calendar,
    ChevronsUpDown,
    CreditCard,
    Pencil,
    Search,
    Settings,
    Smile,
    User,
    Users,
  } from "lucide-react"
  
  import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
    CommandSeparator,
    CommandShortcut,
  } from "./ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover"
import { Button } from "./ui/button"
import { useContext, useEffect, useState } from "react"
import { Input } from "./ui/input"
import { useNavigate, useParams, useSearchParams } from "react-router-dom"
import { HiOutlineUserGroup } from "react-icons/hi";
import LocalizationContext from "contexts/LocalizationContext"

  
  export function SearchBox() {
    const [open, setOpen] = useState(false)
    const [searchQuery, setSearchQuery] = useState("")
    const navigate = useNavigate()
    const [searchParams] = useSearchParams();
    const localeContext = useContext(LocalizationContext)

    useEffect(()=>{
      setSearchQuery("")
      const urlParams = new URLSearchParams(window.location.search);
      const query = urlParams.get("q")
      if(query) setSearchQuery(query)
    }, [window.location.href ])
    return (
      <Popover open={open}>
      <PopoverTrigger asChild>
        {/* <Button
          variant="outline"
          role="combobox"
          className="w-[200px] justify-start" onClick={()=>setOpen(!open)}>
            <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
            Search
        </Button> */}
        <div className="">
            <Search className="absolute top-[18px] ml-3 h-5 w-5" strokeWidth={1.3}></Search>
            <Input placeholder={localeContext.localize("SEARCH")} className="w-full pl-9" onBlur={()=>setOpen(false)} onMouseDown={()=>setOpen(true)} value={searchQuery} onChange={(e)=>{setSearchQuery(e.target.value)}}/>
        </div>

      </PopoverTrigger>
      <PopoverContent className="w-[250px] p-0">
        <Command>
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
              <CommandItem onSelect={()=>{searchQuery.length > 0 && navigate('/search?q='+searchQuery+"&t=community")}}>
                <HiOutlineUserGroup className="mr-2 h-4 w-4" />
                <span>{localeContext.localize("SEARCH")} '{searchQuery}' {localeContext.localize("COMMUNITIES")}</span>
              </CommandItem>
              <CommandItem onSelect={()=>{searchQuery.length > 0 && navigate('/search?q='+searchQuery+"&t=post")}}>
                <Pencil className="mr-2 h-4 w-4" />
                <span>{localeContext.localize("SEARCH")} '{searchQuery}' {localeContext.localize("POSTS")}</span>
              </CommandItem>
              <CommandItem onSelect={()=>{searchQuery.length > 0 && navigate('/search?q='+searchQuery+"&t=user")}}>
                <Users className="mr-2 h-4 w-4" />
                <span>{localeContext.localize("SEARCH")} '{searchQuery}' {localeContext.localize("USERS")}</span>
              </CommandItem>
          </CommandList>
        </Command>
      </PopoverContent>
      </Popover>
    )
  }
  