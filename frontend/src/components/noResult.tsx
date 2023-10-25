import { Search } from "lucide-react"

export const NoResult = ({query}: any) => {
    return <>
        <div className="flex flex-col items-center mt-3">
            <Search/>
            <h3 className="scroll-m-20 text-2xl font-semibold tracking-tight mt-3">
                No Search Results for '{query}'
            </h3>
            <p className="leading-7 [&:not(:first-child)]:mt-1">
            Try adjusting your keywords or filter to find what you're looking for.
            </p>
        </div>
       
        
    </>
}