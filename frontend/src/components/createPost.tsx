import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar"
import { Input } from "../components/ui/input"
import { useNavigate } from "react-router-dom";

const CreatePost = () => {
    const navigate = useNavigate()

    return <>
        <Card className={"mx-auto cursor-pointer pt-6"}>
            <CardContent>
                <div className="flex flex-row items-center space-x-2">
                    <Avatar className="shadow-md cursor-pointer ">
                        <AvatarImage src="data:image/jpeg;base64,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" alt="@shadcn" />
                        <AvatarFallback>CN</AvatarFallback>
                    </Avatar>
                    <Input readOnly placeholder="Create A Post" onClick={()=>navigate("/submit")}/>
                </div>
            </CardContent>
        </Card>
    </>
}
export default CreatePost