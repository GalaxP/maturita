import { Textarea } from "./ui/textarea"
import { Button } from "./ui/button"
import CharacterCounter from "./characterCounter"

const InteractiveTextArea = ({isAuthenticated, comment, setComment, submitComment, placeholder, buttonText,disabled}: {isAuthenticated: boolean | undefined, comment: string, setComment: (arg0: string)=>void, submitComment: ()=>void, placeholder: string, buttonText:string, disabled: boolean}) => {
    return <div className="focus-within:ring-2 shadow-sm focus-within:outline-none ring-offset-background rounded-md focus-within:ring-ring focus-within:ring-offset-2">
    <Textarea className="focus-visible:ring-0 w-full inline max-w-full border-b-0 rounded-md-b-0" value={comment} onChange={e => setComment(e.target.value)} placeholder={isAuthenticated ? placeholder : "You need to log in to comment."} disabled={!isAuthenticated || disabled}/>
    <div className="flex border border-input bg-secondary p-2 items-center justify-end border-t-0 rounded-md-t-0">
        <CharacterCounter currentLength={comment.length} characterLimit={500} showAt={10}/>
        <Button disabled={!isAuthenticated || comment.length === 0 || comment.length > 500} className="w-24 h-8 ml-2" onClick={submitComment} variant={"round"}>{buttonText}</Button>

    </div>
    </div>
}

export default InteractiveTextArea