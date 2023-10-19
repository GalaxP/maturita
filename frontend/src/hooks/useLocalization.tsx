const table = {
    sk: {
        LOGIN: "Prihlasit"
    },
    en: {
        LOGIN: "Login"
    }
}
type languageKey = keyof typeof table;
type textKey = keyof typeof table[languageKey];

export function useLocalization(lang:languageKey) {
    return (property:textKey)=>{

        return(table[lang][property])
    }
}