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
import { UseFormReturn, useForm } from "react-hook-form"
import { Loader2 } from "lucide-react"
import { Checkbox } from "../../components/ui/checkbox"
import { useContext, useEffect } from "react"
import LocalizationContext from "contexts/LocalizationContext"
 
const _formSchema = z.object({
    firstName: z.string(),
    lastName: z.string(),
    email: z.string().email(),
    displayName: z.string().min(3, "Your username has to be at least 3 characters long").max(25, "Your username cannot be longer than 25 characters").regex(/^[a-zA-Z0-9_]+$/, "Your username has to contain only letters, numbers or underscores"),
    password: z.string().min(6, "Password must be at least 6 characters long"),
    confirmPassword: z.string(),
    tos: z.boolean().default(false).refine((value) => value === true, {
        message: "You must agree to the terms and conditions",
    }),
})

interface auth {
    handleSubmit: (values: z.infer<typeof _formSchema>) => void,
    setError: {field: any, message: string} | null
    isLoading : boolean
}
export function RegisterForm({handleSubmit, isLoading, setError}: auth) {
    const localeContext = useContext(LocalizationContext)

    const formSchema = z.object({
        firstName: z.string(),
        lastName: z.string(),
        email: z.string().email({message: localeContext.localize("INVALID_EMAIL")}),
        displayName: z.string().min(3, localeContext.localize("USERNAME_SHORT")).max(25, localeContext.localize("USERNAME_LONG")).regex(/^[a-zA-Z0-9_]+$/, localeContext.localize("USERNAME_FORMAT")),
        password: z.string().min(6, localeContext.localize("PASSWORD_SHORT")),
        confirmPassword: z.string(),
        tos: z.boolean().default(false).refine((value) => value === true, {
            message: localeContext.localize("AGREE_ERROR"),
        }),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: localeContext.localize("PASSWORD_MISMATCH"),
        path: ["confirmPassword"],
    })


  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema)
  })
  
  function onSubmit(values: any) {
    const { confirmPassword, tos, ...returnValues } = values;
    
    handleSubmit(returnValues)
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
                name="firstName"
                render={({ field }) => (
                <FormItem>
                    <FormLabel>{localeContext.localize("FIRST_NAME")}</FormLabel>
                    <FormControl>
                    <Input disabled={isLoading} placeholder="" {...field} />
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
                    <FormLabel>{localeContext.localize("LAST_NAME")}</FormLabel>
                    <FormControl>
                    <Input disabled={isLoading} placeholder="" {...field} />
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
                    <Input disabled={isLoading} placeholder="email@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                </FormItem>
                )}
            />

            <FormField
                control={form.control}
                name="displayName"
                render={({ field }) => (
                <FormItem>
                    <FormLabel>{localeContext.localize("USER_NAME")}</FormLabel>
                    <FormControl>
                    <Input disabled={isLoading} placeholder="" {...field} />
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
                    <Input disabled={isLoading} type="password" placeholder={localeContext.localize("PASSWORD")}{...field} />
                    </FormControl>
                    <FormMessage />
                </FormItem>
                )}
            />
            <FormField
            control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                <FormItem>
                    <FormLabel>{localeContext.localize("CONFIRM_PASSWORD")}</FormLabel>
                    <FormControl>
                    <Input disabled={isLoading} type="password" placeholder={localeContext.localize("PASSWORD")}{...field} />
                    </FormControl>
                    <FormMessage />
                </FormItem>
                )}
            />
            <FormField
                control={form.control}
                name="tos"
                render={({ field }) => (
                <FormItem>
                    <FormControl>
                        <div className="flex items-center space-x-2">
                            <Checkbox
                                id="tos"
                                checked={field.value}
                                onCheckedChange={field.onChange}
                            />
                            <label
                                htmlFor="tos"
                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                {localeContext.localize("ACCEPT")} <a className="text-primary" href="/terms-of-service" target="_blank"> {localeContext.localize("TERMS_OF_SERVICE")} </a> {localeContext.localize("AND")} <a className="text-primary" href="/privacy-policy" target="_blank"> {localeContext.localize("PRIVACY_POLICY")} </a>
                            </label>
                        </div>
                    </FormControl>
                    <FormMessage />
                </FormItem>
                )}
            />
           
        </div>
        <Button type="submit" disabled={isLoading} className="w-full mt-6">
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" /> }
            Register
        </Button>
      </form>
    </Form>
  )
}