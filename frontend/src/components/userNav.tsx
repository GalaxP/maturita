import { Link, useNavigate } from "react-router-dom"
import {
    Avatar,
    AvatarFallback,
    AvatarImage,
  } from "./ui/avatar"
  import { Button } from "./ui/button"
  import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuShortcut,
    DropdownMenuTrigger,
  } from "./ui/dropdown-menu"
import { useContext } from "react";
import AuthContext from "contexts/AuthContext";

export function UserNav({avatar, displayName, email}: {avatar: string, displayName: string, email: string}) {
    const navigate = useNavigate();
    const auth = useContext(AuthContext)

    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-8 w-8 rounded-full">
            <Avatar className="h-8 w-8 py-auto">
              <AvatarImage src={avatar} />
              <AvatarFallback>NO AVATAR</AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end" forceMount>
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">{displayName}</p>
              <p className="text-xs leading-none text-muted-foreground">
                {email}
              </p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem>  
              <Link to="/account/edit" className="w-full">
                Profile
              </Link>
            </DropdownMenuItem>
            {
              auth?.getUser()?.user?.roles && auth?.getUser()?.user?.roles?.includes('admin') &&
              <DropdownMenuItem>  
              <Link to="/admin" className="w-full">
                Admin Panel
              </Link>
            </DropdownMenuItem>}
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuItem>
            <Link to="/account/logout" className="w-full">
                Log out
            </Link>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }