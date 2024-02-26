import { Textarea } from "./ui/textarea"
import { Button } from "./ui/button"
import CharacterCounter from "./characterCounter"
import { useEffect } from "react"

const InteractiveTextArea = ({isAuthenticated, comment, setComment, submitComment, placeholder, buttonText,disabled, id}: {isAuthenticated: boolean | undefined, comment: string, setComment: (arg0: string)=>void, submitComment: ()=>void, placeholder: string, buttonText:string, disabled: boolean, id: string}) => {
    
    /*useEffect(()=>{
        console.log(id)
        var target = document.querySelector('#'+id);
        if(!target) return
        /*console.log("running")
    // create an observer instance
        var observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                console.log(mutation.type);
            });
        });
        // configuration of the observer:
        var config = { attributes: true, childList: true, characterData: true }
        // pass in the target node, as well as the observer options
        observer.observe(target, config);
        // later, you can stop observing
        
        //observer.disconnect();
        return ()=>{
            observer.disconnect()
        }
        target.addEventListener("input", (e:any)=>{
            setComment(e.target?.innerHTML)
        })
    },[])
    */

    return <div className="focus-within:ring-2 shadow-sm focus-within:outline-none ring-offset-background rounded-md focus-within:ring-ring focus-within:ring-offset-2"> 
    { <Textarea className="focus-visible:ring-0 w-full inline max-w-full border-b-0 rounded-md-b-0" value={comment} onChange={e => setComment(e.target.value)} placeholder={isAuthenticated ? placeholder : "You need to log in to comment."} disabled={!isAuthenticated || disabled}/>}
    {/* <div id={id} placeholder={isAuthenticated ? placeholder : "You need to log in to comment."} contentEditable= {!(!isAuthenticated || disabled)} className={"overflow-y-scroll focus-visible:outline-none text-sm py-2 px-3 border-b-0 rounded-md-b-0 border focus-visible:border min-h-[80px] focus-visible:ring-0 focus-visible:ring-ring focus-visible:ring-offset-2"+(!isAuthenticated || disabled ? " cursor-not-allowed": "")}>
    </div> */}
    <div role="textbox" className="flex border border-input bg-secondary p-2 items-center justify-end border-t-0 rounded-md-t-0">
        <CharacterCounter currentLength={comment.length} characterLimit={500} showAt={10}/>
        <Button disabled={!isAuthenticated || comment.length === 0 || comment.length > 500} className="w-24 h-8 ml-2" onClick={submitComment} variant={"round"}>{buttonText}</Button>

    </div>
    </div>

    
}

export default InteractiveTextArea