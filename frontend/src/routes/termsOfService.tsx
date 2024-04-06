import LocalizationContext from "contexts/LocalizationContext"
import { useDocumentTitle } from "hooks/setDocuemntTitle"
import { useContext } from "react"

const TermsOfService = () => {
    const localeContext = useContext(LocalizationContext)
    const documentTitle = useDocumentTitle(localeContext.localize("TERMS_OF_SERVICE"))
    return <h2>tos</h2>
}

export default TermsOfService