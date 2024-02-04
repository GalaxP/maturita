import { SK, US } from "country-flag-icons/react/1x1"
import { supportsFlagEmoji } from "./emojiSupport";

export type languageKey = keyof typeof table;
export type textKey = keyof typeof table[languageKey];


export const table = {
    sk: {
        LOGIN: "Prihlásiť",
        COMMENT_COUNT_S: "Komentár",
        COMMENT_COUNT_P: "Komentárov"
    },
    en: {
        LOGIN: "Login",
        COMMENT_COUNT_S: "Comment",
        COMMENT_COUNT_P: "Comments"
    }
}
const supports_flag = supportsFlagEmoji();
type locales_type = {
    name: "sk" | "en",
    text: string,
    Flag: JSX.Element
}[]
export const locales:locales_type = [
    { name: "sk", text: "Slovak", Flag: supports_flag ? <>🇸🇰 </> : <SK className="h-4 aspect-video inline mr-1"/>},
    { name: "en",text: "English", Flag: supports_flag ? <>🇺🇸 </> : <US className="h-4 aspect-video inline mr-1"/>}
]

//[{f:""}, {f: ""}]