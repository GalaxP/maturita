import { useEffect, useState } from "react"

type props = {
    progress : number
}
const CircularProgress = (props:props) => {
    const [degrees, setDegrees] = useState(0)

    useEffect(()=>{
        if(props.progress > 100)  {setDegrees(360); return;}

        setDegrees(props.progress/100*360)
    }, [props.progress])
    return <div className="rounded-full w-7 h-7 transition-all flex justify-center items-center" style={{background: `conic-gradient(hsl(var(--primary)) ${degrees}deg, lightgrey 0deg)`}}>
        <div className="w-4 h-4 bg-secondary rounded-full"></div>
    </div>
}

export default CircularProgress