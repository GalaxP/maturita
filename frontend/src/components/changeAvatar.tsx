import { Upload } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog"
import { Input } from "./ui/input"
import { EventHandler, useEffect, useState } from "react"
import { Slider } from "./ui/slider"
import { Button } from "./ui/button"
import { post_data } from "helpers/api"
import { useToast } from "./ui/use-toast"


export const ChangeAvatar = ({children, type, community_name, changeAvatar}: {children: React.ReactNode, type:"community" | "user", community_name?: string, changeAvatar: (arg0: string)=>void} ) => {
    const [error, setError] = useState("")
    const [inputFile, setInputFile] = useState<File>();
    const [imageSrc, setImageSrc] = useState<string | ArrayBuffer | null | undefined>('');
    //const [croppedImage, setCroppedImage] = useState<string | ArrayBuffer | null | undefined>('');

    const [size, setSize] = useState(0)

    const [initialWidth, setInitialWidth] = useState(0)
    const [initialHeight, setInitialHeight] = useState(0)

    const [widthDelta, setWidthDelta] = useState(0)
    const [heightDelta, setHeightDelta]  = useState(0)

    const [widthShift, setWidthShift] = useState(0)
    const [heightShift, setHeightShift]  = useState(0)

    const [isDragging, setIsDragging] = useState(false);

    const [open, setOpen] = useState(false)
    const { toast } = useToast()

    useEffect(()=>{

    }, [ widthShift, heightShift, size])

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

        reader.onload = function (readerEvent) {
            var image = new Image();
            image.onload = function (imageEvent) {
                // Resize the image
                var canvas = document.createElement('canvas'),
                    max_size = 458,// TODO : pull max size from a site config
                    width = image.width,
                    height = image.height;
                if (width > height) {
                    if (width > max_size) {
                        height *= max_size / width;
                        width = max_size;
                    }
                } else {
                    if (height > max_size) {
                        width *= max_size / height;
                        height = max_size;
                    }
                }
                canvas.width = width;
                canvas.height = height;

                canvas.getContext('2d')?.drawImage(image, 0, 0, width, height);
                var dataUrl = canvas.toDataURL(inputFile?.type);
                setImageSrc(dataUrl)
            }
            if(typeof(readerEvent.target?.result)==="string") image.src = readerEvent.target?.result;
            
            
        }

        reader.readAsDataURL(avatar);
        
    }

    const cropImage = (sliderValue: number) => {
        const size = sliderValue/100* (initialWidth >= initialHeight ? initialHeight : initialWidth)
        setSize(size)
        setWidthDelta((initialWidth - size)/2)
        setHeightDelta((initialHeight - size)/2)
        const maxX = ((initialWidth-size)/2)
        const maxY = ((initialHeight-size)/2)
        let widthCorrection = ((initialWidth - size)/2) + (widthShift > 0 ? -widthShift : widthShift)
        let heightCorrection = ((initialHeight - size)/2) + (heightShift > 0 ? -heightShift : heightShift)
        if(Math.abs(widthShift) > maxX) if(widthShift > 0) setWidthShift(w=>w+widthCorrection); else setWidthShift(w=>w-widthCorrection);
        if(Math.abs(heightShift) > maxY) if(heightShift > 0) setHeightShift(w=>w+heightCorrection); else setHeightShift(w=>w-heightCorrection);
    }

    const setUp = () => {
        const img = document.getElementById("imagePreview")
        if(!img) return setError("something has gone wrong")
        const size = img.clientWidth >= img.clientHeight ? img.clientHeight : img.clientWidth
        setSize(size)
        setInitialWidth(img.clientWidth)
        setInitialHeight(img.clientHeight)
        setWidthDelta((img.clientWidth - size)/2)
        setHeightDelta((img.clientHeight - size)/2)
        setWidthShift(0)
        setHeightShift(0)

    }
    const handleMouseDown = (e: React.MouseEvent) => {
        setIsDragging(true);
      };
    
      const handleMouseUp = (e: React.MouseEvent) => {
        setIsDragging(false);
      };
    
      const handleMouseMove = (e: React.MouseEvent) => {
        if (isDragging) {
          const newX = widthShift + e.movementX;
          const newY = heightShift + e.movementY;

          const maxX = ((initialWidth-size)/2)
          const maxY = ((initialHeight-size)/2)
          
          setWidthShift(Math.abs(newX) > maxX ? newX > 0 ? maxX : -(maxX) : newX)
          setHeightShift(Math.abs(newY) > maxY ? newY > 0 ? maxY : -(maxY) : newY);
        }
      };


    const reset = () => {
        setError("")
        setInputFile(undefined)
        setImageSrc(null)
        setSize(0)
        setInitialWidth(0)
        setInitialHeight(0)
        setHeightDelta(0)
        setWidthDelta(0)
        setWidthShift(0)
        setHeightShift(0)
    }

    function dataURItoBlob(dataURI: string) {
      // convert base64 to raw binary data held in a string
      // doesn't handle URLEncoded DataURIs - see SO answer #6850276 for code that does this
      var byteString = atob(dataURI.split(',')[1]);
  
      // separate out the mime component
      var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
  
      // write the bytes of the string to an ArrayBuffer
      var ab = new ArrayBuffer(byteString.length);
      var ia = new Uint8Array(ab);
      for (var i = 0; i < byteString.length; i++) {
          ia[i] = byteString.charCodeAt(i);
      }
      return new Blob([ab], {type: mimeString});
  }

  const submit = () => {
    let reader = new FileReader();
    if(!imageSrc || !inputFile) return

    reader.onload = function (readerEvent) {
      var image = new Image();
      image.onload = function (imageEvent) {
        
        // Resize the image
        var canvas = document.createElement('canvas')

        canvas.width = size;
        canvas.height = size;

        canvas.getContext('2d')?.drawImage(image, widthShift+((initialWidth-size)/2), heightShift+((initialHeight-size)/2), size, size, 0, 0, size, size);
        var dataUrl = canvas.toDataURL(inputFile?.type);
        //console.log(dataUrl);
        var avatarBlob = dataURItoBlob(dataUrl);
        var avatar = new File([avatarBlob], inputFile.name, {type: inputFile.type});
        //setCroppedImage(dataUrl);
        //console.log(avatar);
        let data = new FormData()
        data.append("avatar", avatar)

        let url = type === "community" ? "/community/"+community_name+"/change-avatar" : "/account/upload"
        post_data(url, data, {}, true)
        .then((res)=> {
          toast({
            variant: "default",
            title: "Successfully saved changes",
          })
          changeAvatar(res.data.avatar);
          setOpen(false)
          //if(!res.data.avatar) window.location.reload();
        })
        .catch(()=>{
          toast({
            variant: "destructive",
            title: "Uh oh! Something went wrong.",
            description: "There was a problem with your request.",
          })
        })
      }
      if(typeof(readerEvent.target?.result)==="string") image.src = readerEvent.target?.result;
    }
    reader.readAsDataURL(dataURItoBlob(imageSrc as string));
  }

    return <Dialog open={open} onOpenChange={()=>{reset(); setOpen(o=>!o)}}>
    <DialogTrigger asChild>{children}</DialogTrigger>
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Change {type === "community" ? "Community" : "User"} Avatar</DialogTitle>
        <DialogDescription>
          Upload a photo that will be used as the avatar for {type === "community" ? "the community" : "your profile"}
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
      <div className="border-dashed border-2 flex flex-col justify-center items-center cursor-grab" onMouseLeave={handleMouseUp} onMouseDown={handleMouseDown} onMouseUp={handleMouseUp} onMouseMove={handleMouseMove}>
            <div id="darkWrapper" style={{width: initialWidth, height: initialHeight}}>

            <img id="imagePreview" onLoad={setUp} src={imageSrc as string} className="absolute select-none"></img>
            <div className="absolute bg-black opacity-50" style={{width: initialWidth, height: initialHeight}}></div>
            <div className={"absolute rounded-full overflow-hidden select-none touch-none"} style={{width: size, height: size, transform: "translateX("+(widthDelta+widthShift)+"px) translateY("+(heightDelta+heightShift)+"px)"}}>
                <span id="imageWrapper" className="absolute block h-full w-full overflow-hidden" >
                    <img onLoad={setUp} src={imageSrc as string} className="absolute max-w-none select-none" style={{width: initialWidth, height: initialHeight, transform: "translateX("+(-widthDelta-widthShift)+"px) translateY("+(-heightDelta-heightShift)+"px)"}}></img>
                    <div className="absolute w-full h-full" ></div>
                </span>
                <div className="absolute block h-full w-full rounded-full border-4 border-white"></div>
            </div>
            </div>
           
        </div>
        <Slider defaultValue={[100]} max={100} min={30} step={1} onValueChange={(val)=>{cropImage(val[0])}}/>
        <div className="flex flex-row justify-end">
            <Button variant={"secondary"} className="mr-2" onClick={reset}>Cancel</Button>
            <Button variant={"default"} onClick={submit}>Submit</Button>
        </div>
        {/* <img id="test" src={croppedImage as string}/> */}
      </>
      }

      {error && <span className="text-destructive">{error}</span>}
    </DialogContent>
  </Dialog>
}