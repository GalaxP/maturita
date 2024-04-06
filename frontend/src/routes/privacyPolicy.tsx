import LocalizationContext from "contexts/LocalizationContext"
import { useDocumentTitle } from "hooks/setDocuemntTitle"
import { useContext } from "react"

const PrivacyPolicy = () => {
    const localeContext = useContext(LocalizationContext)
    const [documentTitle, setDocumentTitle] = useDocumentTitle(localeContext.localize("PRIVACY_POLICY"))
    return <h1>lol we don't care about your privacy</h1>
}

export default PrivacyPolicy