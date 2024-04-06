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
import { useContext } from "react"
import LocalizationContext from "contexts/LocalizationContext"
import { Textarea } from "components/ui/textarea"
 
const formSchema = z.object({
  title: z.string(),
  message: z.string()
})
interface props {
    handleSubmit: (values: z.infer<typeof formSchema>) => void,
    isLoading : boolean,
}
export function NewsLetterForm({handleSubmit, isLoading}: props) {
  const localeContext = useContext(LocalizationContext)

  const formSchema = z.object({
    title: z.string({required_error: localeContext.localize("FIELD_REQUIRED")}),
    message: z.string({required_error: localeContext.localize("FIELD_REQUIRED")})
  })
  
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
            name="message"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{localeContext.localize("BODY")}</FormLabel>
                <FormControl>
                  <Textarea disabled={isLoading} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <Button type="submit" disabled={isLoading} className="w-full mt-6">
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" /> }
            {localeContext.localize("NEWSLETTER_SEND")}
        </Button>
      </form>
    </Form>
  )
}