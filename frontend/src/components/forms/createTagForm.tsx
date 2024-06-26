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
import { SketchPicker, ChromePicker, PhotoshopPicker, HuePicker  } from 'react-color';
import { useContext, useState } from "react"
import CharacterCounter from "components/characterCounter"
import LocalizationContext from "contexts/LocalizationContext"

const _formSchema = z.object({
  name: z.string().max(15, 'name cannot be longer than 15 characters'),
  color: z.string()
})
interface props {
    handleSubmit: (values: z.infer<typeof _formSchema>) => void,
    isLoading : boolean,
}
export function CreateTagForm({handleSubmit, isLoading}: props) {
  const [color, setColor] = useState("")
  const localeContext = useContext(LocalizationContext)

  const formSchema = z.object({
    name: z.string({required_error: localeContext.localize("REQUIRED")}).max(15, localeContext.localize("NAME_LONG")),
    color: z.string({required_error: localeContext.localize("REQUIRED")})
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
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{localeContext.localize("NAME")}</FormLabel>
                <FormControl>
                  <>
                    <Input className="pr-20" disabled={isLoading} {...field} />
                    <CharacterCounter className="absolute top-[55px] right-8" characterLimit={15} currentLength={field.value?.length} showAt={5}></CharacterCounter>
                  </>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
          control={form.control}
            name="color"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{localeContext.localize("COLOR")}</FormLabel>
                <FormControl>
                  {/* <Input disabled={isLoading} {...field} /> */}
                  <ChromePicker className="min-w-full shadow-none" disableAlpha color={color} onChange={(e)=>{setColor(e.hex);form.setValue("color", e.hex)}}/>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <Button type="submit" disabled={isLoading} className="w-full mt-6">
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" /> }
            Create
        </Button>
      </form>
    </Form>
  )
}