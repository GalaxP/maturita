import { CreateCommunityForm } from "components/forms/createCommunityForm"
import { SettingsLayout } from "components/shared/settingsLayout"

export const Security = () => {
    return <>
        <SettingsLayout page={"Security"}>
            <CreateCommunityForm handleSubmit={()=>{}} isLoading={false}/>
        </SettingsLayout>
    </>
}