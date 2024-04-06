import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
 
import { Button } from "../ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form"
import { Input } from "../ui/input"
import { useForm } from "react-hook-form"
import { Check, Loader2, X } from "lucide-react"
import { get_data } from "helpers/api"
import { useContext, useState } from "react"
import LocalizationContext from "contexts/LocalizationContext"

type FuncType = (...args: any) => Promise<any>;
function debouncePromise<T>(
  func: (...args: any[]) => Promise<T>,
  wait: number
): (...args: any[]) => Promise<T> {
  let timeoutId: NodeJS.Timeout;

  return (...args: any[]): Promise<T> => {
    return new Promise((resolve, reject) => {
      const later = () => {
        clearTimeout(timeoutId);
        func(...args)
          .then((result: T) => {
            resolve(result);
          })
          .catch((error) => {
            reject(error);
          });
      };

      clearTimeout(timeoutId);
      timeoutId = setTimeout(later, wait);
    });
  };
}

const checkAvailability = (communityName: string) => {
  return new Promise((resolve, reject) => {
    get_data("/community/"+communityName)
    .then(()=>{
      reject(false);
    })
    .catch(()=>{
      resolve(true);
    })
  })
}

const checkAvailabilityDebounced = debouncePromise(checkAvailability, 500);
const formSchema = z.object({
  name: z.string().nonempty().max(40),
  description: z.string().nonempty()
})

interface props {
    handleSubmit: (values: z.infer<typeof formSchema>) => void,
    isLoading : boolean
}

export function CreateCommunityForm({handleSubmit, isLoading}: props) {
  const [community_name, setCommunity_name] = useState("")
  const [checking, setChecking] = useState(false)
  const [error, setError] = useState(false)

  const localeContext = useContext(LocalizationContext)

  const _formSchema = z.object({
    name: z.string().nonempty({message: localeContext.localize("FIELD_REQUIRED")}).max(40),
    description: z.string().nonempty({message: localeContext.localize("FIELD_REQUIRED")})
  })

  const form = useForm<z.infer<typeof _formSchema>>({
    resolver: zodResolver(_formSchema)
  })
  function onSubmit(values: z.infer<typeof _formSchema>) {
    if(error) return
    handleSubmit(values)
  }
  let regex = /^(?!_)[A-Za-z0-9_]+$/
  return (

    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3 w-full">
        <div className="space-y-2">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{localeContext.localize("COMMUNITY_NAME")}</FormLabel>
                <FormControl>
                  <div className="flex flex-row justify-end items-center">
                    <Input disabled={isLoading} {...field} value={community_name} onChange={(i)=>{
                      setChecking(true);
                      form.setValue("name",i.target.value); 
                      setCommunity_name(i.target.value);
                      regex.test(i.target.value) 
                      ? 
                      checkAvailabilityDebounced(i.target.value).then(()=>{
                        if(!regex.test(i.target.value)){
                          setChecking(false); 
                          form.setError("name", {message:localeContext.localize("COMMUNITY_ERROR_FORMAT")});
                          setError(true);
                          return} 
                          else { 
                            setChecking(false);
                            setError(false);
                            form.clearErrors("name")
                          }})
                          .catch(()=>{
                            setError(true);
                            setChecking(false);
                            form.setError("name", { message: localeContext.localize("COMMUNITY_ERROR_EXISTS")})
                            } ) 
                      : setChecking(false); form.setError("name", {message:localeContext.localize("COMMUNITY_ERROR_FORMAT")});setError(true)}}/>
                    { checking && <Loader2 className="mr-2 h-5 w-5 animate-spin absolute" />}
                    { !checking && ! error && community_name!== "" && <Check className="absolute mr-2 h-5 w-5" color="green"/> }
                    { !checking && error && <X className="absolute w-5 h-5 mr-2" color="red"/> }
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
          control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{localeContext.localize("COMMUNITY_DESCRIPTION")}</FormLabel>
                <FormControl>
                  <Input disabled={isLoading} placeholder={localeContext.localize("COMMUNITY_DESCRIPTION_PLACEHOLDER")}{...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <Button type="submit" disabled={isLoading} className="w-full mt-6">
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" /> }
            {localeContext.localize("CREATE")}
        </Button>       
      </form>
    </Form>
  )
}