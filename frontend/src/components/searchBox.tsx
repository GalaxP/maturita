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
import { useEffect, useState } from "react"
import { Input } from "./ui/input"
import { useNavigate } from "react-router-dom"
  
  export function SearchBox() {
    const [open, setOpen] = useState(false)
    const [searchQuery, setSearchQuery] = useState("")
    const navigate = useNavigate()

    useEffect(()=>{
      setSearchQuery("")
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
            <Search className="absolute top-[10px] ml-3 h-5 w-5" strokeWidth={1.3}></Search>
            <Input placeholder="Search" className="w-full pl-9" onBlur={()=>setOpen(false)} onMouseDown={()=>setOpen(true)} value={searchQuery} onChange={(e)=>{setSearchQuery(e.target.value)}}/>
        </div>

      </PopoverTrigger>
      <PopoverContent className="w-[250px] p-0">
        <Command className="rounded-lg border shadow-md">
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
              <CommandItem onSelect={()=>{navigate('/search?q='+searchQuery+"&t=community")}}>
                <Calendar className="mr-2 h-4 w-4" />
                <span>Search {searchQuery} in Communities</span>
              </CommandItem>
              <CommandItem onSelect={()=>{navigate('/search?q='+searchQuery+"&t=post")}}>
                <Pencil className="mr-2 h-4 w-4" />
                <span>Search {searchQuery} in Posts</span>
              </CommandItem>
              <CommandItem onSelect={()=>{navigate('/search?q='+searchQuery+"&t=user")}}>
                <Users className="mr-2 h-4 w-4" />
                <span>Search {searchQuery} in Users</span>
              </CommandItem>
          </CommandList>
        </Command>
      </PopoverContent>
      </Popover>
    )
  }
  