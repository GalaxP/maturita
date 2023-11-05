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
 
const formSchema = z.object({
  displayName: z.string(),
  email: z.string()
})
interface props {
    handleSubmit: (values: z.infer<typeof formSchema>) => void,
    originalEmail: string,
    originalDisplayName: string
    isLoading : boolean
}
export function ProfileSettingsForm({handleSubmit, isLoading, originalEmail, originalDisplayName}: props) {

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
            name="displayName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Display Name</FormLabel>
                <FormControl>
                  <Input disabled={isLoading} placeholder={originalDisplayName} {...field} />
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
                  <Input disabled={isLoading} type="email" placeholder={originalEmail} { ...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <Button type="submit" disabled={isLoading} variant={"secondary"} className="mt-6">
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" /> }
            Save
        </Button>
      </form>
    </Form>
  )
}