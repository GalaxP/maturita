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
import { FieldErrors, useForm } from "react-hook-form"
import { AuthContextType } from "schemas/authSchema"
import { Loader2 } from "lucide-react"
import { AiOutlineGoogle } from "react-icons/ai"
import { useEffect } from "react"
 
const formSchema = z.object({
  avatar: z.custom<File>((v) => v instanceof File, {
    message: 'Image is required',
  }),
})
interface props {
    handleSubmit: (values: z.infer<typeof formSchema>) => void,
    setError: {field: any, message: string} | null
    isLoading : boolean
}
export function AccountForm({handleSubmit, isLoading, setError}: props) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema)
  })
  function onSubmit(values: z.infer<typeof formSchema>) {
    //if(formSchema.safeParse(values).success && !form.formState.errors)
    handleSubmit(values)
  }
  
  useEffect(()=>{
    if(setError) form.setError(setError.field, {message: setError.message})
  }, [setError])

  return (

    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3 w-full">
        <div className="space-y-2">
          <FormField
            control={form.control}
            name="avatar"
            render={({ field: {onChange} }) => (
              <FormItem>
                <FormLabel>Avatar</FormLabel>
                <FormControl>
                  <input disabled={isLoading} type="file" onChange={(e) => onChange(e.target.files?.[0])}/>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <Button type="submit" disabled={isLoading} className="w-full mt-6">
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" /> }
            Submit
        </Button>
      </form>
    </Form>
  )
}