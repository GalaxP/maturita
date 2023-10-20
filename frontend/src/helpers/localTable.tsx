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
type locales_type = {
    name: "sk" | "en",
    text: string
}[]
export const locales:locales_type = [
    { name: "sk", text: "🇸🇰 Slovak"},
    { name: "en",text: "🇺🇸 English"}
]

//[{f:""}, {f: ""}]