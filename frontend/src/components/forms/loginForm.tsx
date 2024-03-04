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
import { useContext } from "react"
import LocalizationContext from "contexts/LocalizationContext"
 
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
  const localeContext = useContext(LocalizationContext)
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema)
  })
  function onSubmit(values: z.infer<typeof formSchema>) {
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
                <FormLabel>{localeContext.localize("PASSWORD")}</FormLabel>
                <FormControl>
                  <Input disabled={isLoading} type="password" placeholder={localeContext.localize("PASSWORD_PLACEHOLDER")}{...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <p className="text-destructive w-full text-center" hidden={!incorrectCredentials}>{localeContext.localize("INCORRECT_CREDENTIALS")}</p>
        <Button type="submit" disabled={isLoading} className="w-full mt-6">
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" /> }
            {localeContext.localize("LOGIN_BUTTON")}
        </Button>
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t">
              </span>
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">{localeContext.localize("ADDITIONAL_LOGIN_OPTIONS")}</span>
          </div>
        </div>
      </form>
    </Form>
  )
}