import LocalizationContext from "contexts/LocalizationContext"
import { Search } from "lucide-react"
import { useContext } from "react"

export const NoResult = ({query}: any) => {
    const localeContext = useContext(LocalizationContext)

    return <>
        <div className="flex flex-col items-center mt-3">
            <Search/>
            <h3 className="scroll-m-20 text-2xl font-semibold tracking-tight mt-3">
                {localeContext.localize("NO_SEARCH")} '{query}'
            </h3>
            <p className="leading-7 [&:not(:first-child)]:mt-1 text-center">
                {localeContext.localize("NO_SEARCH_TEXT")}
            </p>
        </div>
       
        
    </>
}