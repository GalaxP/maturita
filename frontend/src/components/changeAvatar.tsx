import { Upload } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog"
import { Input } from "./ui/input"
import { useEffect, useState } from "react"
import { Slider } from "./ui/slider"
import { Button } from "./ui/button"


export const ChangeAvatar = ({children}: {children: React.ReactNode} ) => {
    const [error, setError] = useState("")
    const [inputFile, setInputFile] = useState<File>();
    const [imageSrc, setImageSrc] = useState<string | ArrayBuffer | null | undefined>('');

    const [width, setWidth] = useState(0)
    const [height, setHeight] = useState(0)

    const [initialWidth, setInitialWidth] = useState(0)
    const [initialHeight, setInitialHeight] = useState(0)

    const [widthDelta, setWidthDelta] = useState(0)
    const [heightDelta, setHeightDelta]  = useState(0)

    const [widthShift, setWidthShift] = useState(0)
    const [heightShift, setHeightShift]  = useState(0)

    useEffect(()=>{
        const darkWrapper = document.getElementById("darkWrapper")
        darkWrapper?.addEventListener('mousedown', mouseDown);
        
        darkWrapper?.addEventListener('mousemove', mouseMove);
            
        window.addEventListener('mouseup', mouseUp);
        /*return () => {
            darkWrapper?.removeEventListener("mousedown", mouseDown)
            darkWrapper?.removeEventListener("mousemove", mouseMove)
            darkWrapper?.removeEventListener("mouseup", mouseUp)
        }*/
    }, [initialWidth, widthShift, heightShift, width, height])

    const handleImageSubmit = (file: HTMLInputElement["files"]) => {
        if(!file) return
        setError("")

        const avatar = file[0]
        if(avatar.type !== "image/png" && avatar.type !== "image/jpeg") return setError("File must be an image")
        if(avatar.size > 1024 * 1024) return setError("File must smaller than 1Mb")
        setInputFile(avatar)
        previewImage(avatar)
    }

    const previewImage = (avatar: File) => {
        if(!avatar) return
        let reader = new FileReader();

        reader.onload = (e) => {
            setImageSrc(e.target?.result);
        };

        reader.readAsDataURL(avatar);
        
    }

    const cropImage = (sliderValue: number) => {
        const size = sliderValue/100* (initialWidth >= initialHeight ? initialHeight : initialWidth)
        setWidth(size)
        setHeight(size)
        setWidthDelta((initialWidth - size)/2)
        setHeightDelta((initialHeight - size)/2)
    }

    const setUp = () => {
        const img = document.getElementById("imagePreview")
        if(!img) return setError("something has gone wrong")
        const size = img.clientWidth >= img.clientHeight ? img.clientHeight : img.clientWidth
        setWidth(size)
        setHeight(size)
        setInitialWidth(img.clientWidth)
        setInitialHeight(img.clientHeight)
        setWidthDelta((img.clientWidth - size)/2)
        setHeightDelta((img.clientHeight - size)/2)
        setWidthShift(0)
        setHeightShift(0)

        const delta = 6;
        let startX = 0;
        let startY = 0;
        let isDragging = false;

        

        
        /*const imageWrapper = document.getElementById("imageWrapper")
        imageWrapper?.addEventListener('mousedown', function (event: MouseEvent) {
        startX = event.pageX;
        startY = event.pageY;
        });

        imageWrapper?.addEventListener('mouseup', function (event) {
        const diffX = Math.abs(event.pageX - startX);
        const diffY = Math.abs(event.pageY - startY);

        if (diffX < delta && diffY < delta) {
            // Click!
        }
        else {
            console.log(diffX + " " + diffY)
        }
        });*/

    }
    let startX = 0;
    let startY = 0;
    let isDragging = false;

    const mouseMove = (event: MouseEvent) => {
        const diffX = (event.pageX - startX);
        const diffY = (event.pageY - startY);
        if(isDragging) {
        //console.log(diffX + " " + diffY)
            const maxX = ((initialWidth-width)/2)
            setWidthShift(Math.abs(diffX)>maxX ? diffX>0 ? maxX: -(maxX) : diffX)
            setHeightShift(diffY)
        }
    }
    const mouseDown = (event: MouseEvent) => {
        isDragging = true
            startX = event.pageX;
            startY = event.pageY;
    }
    const mouseUp = (event: MouseEvent) => {
        if(!inputFile) return
            const diffX = (event.pageX - startX);
            const diffY = (event.pageY - startY);
            isDragging = false
    }

    const reset = () => {
        setError("")
        setInputFile(undefined)
        setImageSrc(null)
        setWidth(0)
        setHeight(0)
        setInitialWidth(0)
        setInitialHeight(0)
        setHeightDelta(0)
        setWidthDelta(0)
        setWidthShift(0)
        setHeightShift(0)
    }

    return <Dialog onOpenChange={reset}>
    <DialogTrigger asChild>{children}</DialogTrigger>
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Change Community Avatar</DialogTitle>
        <DialogDescription>
          Upload a photo that will be used as the avatar for the community
        </DialogDescription>
      </DialogHeader>
      <Input id="avatar-input" accept=".png,.jpg,.jpeg" type="file" className="hidden" onChange={(e:any)=>handleImageSubmit(e.currentTarget.files)}></Input>
      {!inputFile ? <>
        <div className="border-dashed border-2 flex flex-col justify-center items-center p-20 cursor-pointer" onClick={()=>{document.getElementById("avatar-input")?.click()}}>
            <div className="p-1">
                <Upload className="inline-block"/>
                <p className="ml-1 inline-block text-lg font-semibold">Drag and drop or click here</p>
            </div>
            <p className="">(Max file size is 1Mb)</p>
        </div>
      </> : <>
      <div className="border-dashed border-2 flex flex-col justify-center items-center cursor-grab">
            <div id="darkWrapper" style={{width: initialWidth, height: initialHeight}}>

            <img id="imagePreview" onLoad={setUp} src={imageSrc as string} className="absolute select-none"></img>
            <div className="absolute bg-black opacity-50" style={{width: initialWidth, height: initialHeight}}></div>
            <div className={"absolute overflow-hidden border-2 border-white select-none touch-none"} style={{width: width, height: height, transform: "translateX("+(widthDelta+widthShift)+"px) translateY("+(heightDelta+heightShift)+"px)"}}>
                <span id="imageWrapper" className="block h-full w-full overflow-hidden" >
                    <img onLoad={setUp} src={imageSrc as string} className="absolute max-w-none select-none" style={{width: initialWidth, height: initialHeight, transform: "translateX("+(-widthDelta-widthShift)+"px) translateY("+(-heightDelta-heightShift)+"px)"}}></img>
                    <div className="absolute w-full h-full" ></div>

                </span>
                
            </div>
            </div>
           
        </div>
        <Slider defaultValue={[100]} max={100} min={30} step={1} onValueChange={(val)=>{cropImage(val[0])}}/>
        <div className="flex flex-row justify-end">
            <Button variant={"secondary"} className="mr-2" onClick={reset}>Cancel</Button>
            <Button variant={"default"} className="">Submit</Button>
        </div>
      </>
      }

      {error && <span className="text-destructive">{error}</span>}
    </DialogContent>
  </Dialog>
}