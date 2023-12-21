import { Textarea } from "./ui/textarea"
import { Button } from "./ui/button"

const InteractiveTextArea = ({isAuthenticated, comment, setComment, submitComment, placeholder, buttonText}: {isAuthenticated: boolean | undefined, comment: string, setComment: (arg0: string)=>void, submitComment: ()=>void, placeholder: string, buttonText:string}) => {
    return <div className="focus-within:ring-2 focus-within:outline-none ring-offset-background rounded-md focus-within:ring-ring focus-within:ring-offset-2">
    <Textarea className="focus-visible:ring-0 w-full inline max-w-full border-b-0 rounded-md-b-0" value={comment} onChange={e => setComment(e.target.value)} placeholder={isAuthenticated ? placeholder : "You need to log in to comment."} disabled={!isAuthenticated}/>
    <div className="flex align-middle border border-input bg-secondary p-2 items-center justify-center border-t-0 rounded-md-t-0">
            <Button disabled={!isAuthenticated || comment.length === 0} className="w-24 h-8 ml-auto" onClick={submitComment} variant={"round"}>{buttonText}</Button> 
    </div>
    </div>
}

export default InteractiveTextArea