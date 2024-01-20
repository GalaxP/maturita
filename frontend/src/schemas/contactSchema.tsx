import { ColumnDef } from "@tanstack/react-table"
import { MoreHorizontal } from "lucide-react"
import { Button } from "../components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu"
import { post_data } from "helpers/api"

export type Message = {
    firstName: string,
    lastName: string,
    title: string,
    body: string,
    email: string,
    userAgent: string,
    remoteIP: string,
    createdAt: number,
    _id: string
}

const banUser = (uid:string) => {
  post_data("/user/"+uid+"/ban", {}, {}, true)
  .then(()=>{
    alert("success")
  }).catch(()=>{alert("something has gone wrong")})
}

const markAsRead = (id: string) => {
  post_data("/message/"+id+"/read", {}, {}, true)
  .then(()=>{
    window.location.reload();
  }).catch(()=>{alert("something has gone wrong")})
}
   
export const columns: ColumnDef<Message>[] = [
    {
        accessorKey: "email",
        header: "Email",
    },
    {
      accessorKey: "firstName",
      header: "First Name",
    },
    {
      accessorKey: "lastName",
      header: "Last Name",
    },
    {
      accessorKey: "title",
      header: "Title",
    },
    {
        accessorKey: "body",
        header: "Body",
    },
    

    {id: "actions",
    cell: ({ row }) => {
      const message = row.original
 
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => markAsRead(message._id)}
            >
              Mark as read
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
    } ,
]