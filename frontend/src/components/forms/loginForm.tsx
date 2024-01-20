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
  email: z.string(),
  password: z.string()
})
interface auth {
    handleSubmit: (values: z.infer<typeof formSchema>) => void,
    googleSignIn: () => void,
    isLoading : boolean,
    incorrectCredentials: boolean
}
export function LoginForm({handleSubmit, googleSignIn , isLoading, incorrectCredentials}: auth) {
  // ...
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema)
  })
  function onSubmit(values: z.infer<typeof formSchema>) {
    // Do something with the form values.
    // ✅ This will be type-safe and validated.
    handleSubmit(values)
  }
  function onGoogleSignIn() {
    googleSignIn()
  }
  return (

    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3 w-full">
        <div className="space-y-2">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input disabled={isLoading} placeholder="email@example.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
          control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input disabled={isLoading} type="password" placeholder="Enter your password"{...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <p className="text-destructive w-full text-center" hidden={!incorrectCredentials}>wrong email or password</p>
        <Button type="submit" disabled={isLoading} className="w-full mt-6">
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" /> }
            Log In
        </Button>
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t">
              </span>
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
          </div>
        </div>         
        {/* <Button variant="outline" type='button' className="w-full" onClick={onGoogleSignIn}>
          <AiOutlineGoogle size={25} className="mr-2"/>
          Google
        </Button> */}
      </form>
    </Form>
  )
}