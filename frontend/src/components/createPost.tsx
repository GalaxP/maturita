import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar"
import { Input } from "../components/ui/input"
import { useNavigate } from "react-router-dom";
import GetAvatar from "helpers/getAvatar";
import AuthContext from "contexts/AuthContext";
import { useContext, useState } from "react";
import LocalizationContext from "contexts/LocalizationContext";


const CreatePost = ({defaultCommunity}: {defaultCommunity?: string}) => {
    const navigate = useNavigate()
    const auth = useContext(AuthContext)
    const localeContext = useContext(LocalizationContext)

    return <>
        <Card className={"mx-auto cursor-pointer pt-6"}>
            <CardContent>
                <div className="flex flex-row items-center space-x-2">
                    <Avatar className="shadow-md cursor-pointer ">
                        <AvatarImage src={GetAvatar(auth?.getUser())} alt="@shadcn" />
                        <AvatarFallback>CN</AvatarFallback>
                    </Avatar>
                    <Input readOnly placeholder={localeContext.localize("CREATE_POST")} onClick={()=>{ defaultCommunity ? navigate("/submit?comm="+defaultCommunity) : navigate("/submit")}}/>
                </div>
            </CardContent>
        </Card>
    </>
}
export default CreatePost