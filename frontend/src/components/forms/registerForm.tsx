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
import { useEffect } from "react"
 
const formSchema = z.object({
    firstName: z.string(),
    lastName: z.string(),
    email: z.string().email(),
    displayName: z.string().min(3, "Your username has to be at least 3 characters long"),
    password: z.string().min(6, "Password must be at least 6 characters long"),
    confirmPassword: z.string(),
    tos: z.boolean().default(false).refine((value) => value === true, {
        message: "You must agree to the terms and conditions",
    }),
})
.refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
})

interface auth {
    handleSubmit: (values: z.infer<typeof formSchema>) => void,
    setError: {field: any, message: string} | null
    isLoading : boolean
}
export function RegisterForm({handleSubmit, isLoading, setError}: auth) {
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
                    <FormLabel>First Name</FormLabel>
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
                    <FormLabel>Last Name</FormLabel>
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
                    <FormLabel>User Name</FormLabel>
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
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                    <Input disabled={isLoading} type="password" placeholder="Password"{...field} />
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
                    <FormLabel>Confirm Password</FormLabel>
                    <FormControl>
                    <Input disabled={isLoading} type="password" placeholder="Password"{...field} />
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
                                Accept <a className="text-primary" href="/terms-of-service"> terms and conditions </a>
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