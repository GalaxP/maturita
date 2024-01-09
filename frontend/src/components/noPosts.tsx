import { MessageCircle } from "lucide-react"

export const NoPosts = ({query}: any) => {
    return <>
        <div className="flex flex-col items-center mt-3">
        <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" className="lucide lucide-message-circle-more"><path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/><path d="M8 12h.01"/><path d="M12 12h.01"/><path d="M16 12h.01"/></svg>
            <h3 className="scroll-m-20 text-2xl font-semibold tracking-tight mt-3">
                No posts in this community yet
            </h3>
            <p className="leading-7 [&:not(:first-child)]:mt-1">
            Be the first to share something with this community.
            </p>
        </div>
       
        
    </>
}