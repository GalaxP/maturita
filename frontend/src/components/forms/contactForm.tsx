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
import { AuthContextType } from "schemas/authSchema"
import { Loader2 } from "lucide-react"
import { AiOutlineGoogle } from "react-icons/ai"
import { Textarea } from "../../components/ui/textarea"
 
const formSchema = z.object({
    firstName: z.string().nonempty(),
    lastName: z.string().nonempty(),
    title: z.string().nonempty(),
    body: z.string().nonempty(),
    email: z.string().email().nonempty()
})
interface props {
    handleSubmit: (values: z.infer<typeof formSchema>) => void,
    isLoading : boolean
}
export function ContactForm({handleSubmit, isLoading}: props) {

    const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema)
  })
  function onSubmit(values: z.infer<typeof formSchema>) {
    handleSubmit(values)
  }

  return (

    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3 w-full">
        <div className="space-y-2">
            <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                <FormItem>
                    <FormLabel>First Name</FormLabel>
                    <FormControl>
                    <Input disabled={isLoading} {...field} />
                    </FormControl>
                    <FormMessage />
                </FormItem>
                )}
            />
            
            <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                <FormItem>
                    <FormLabel>Last Name</FormLabel>
                    <FormControl>
                    <Input disabled={isLoading} {...field} />
                    </FormControl>
                    <FormMessage />
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
                    <Input disabled={isLoading} {...field} />
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
                    <Textarea disabled={isLoading} {...field}/>
                    </FormControl>
                    <FormMessage />
                </FormItem>
                )}
            />
            <FormField
            control={form.control}
                name="email"
                render={({ field }) => (
                <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                    <Input disabled={isLoading} type="email" {...field}/>
                    </FormControl>
                    <FormMessage />
                </FormItem>
                )}
            />

        </div>
        <Button type="submit" disabled={isLoading} variant={"default"} className="mt-6 d:w-28 sm:w-full ">
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" /> }
            Contact Us
        </Button>
      </form>
    </Form>
  )
}