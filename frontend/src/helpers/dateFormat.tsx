import { LocalizationContextType } from "contexts/LocalizationContext";

function prettyDate(date: number, localeContext: LocalizationContextType, shortForm: boolean = false) {

    var seconds = Math.floor((new Date().getTime() - date) / 1000);
  
    var interval = seconds / 31536000;
  
    if (interval > 1) {
      return shortForm ? Math.floor(interval) + localeContext.localize("YEARS_S") : Math.floor(interval) + " "+ localeContext.localize("YEARS_L");
    }
    interval = seconds / 2592000;
    if (interval > 1) {
      return shortForm ? Math.floor(interval) + localeContext.localize("MONTHS_S") : Math.floor(interval) + " "+ localeContext.localize("MONTHS_L");
    }
    interval = seconds / 86400;
    if (interval > 1) {
      return shortForm ? Math.floor(interval) + localeContext.localize("DAYS_S") : Math.floor(interval) + " "+ localeContext.localize("DAYS_L");
    }
    interval = seconds / 3600;
    if (interval > 1) {
      return shortForm ? Math.floor(interval) + localeContext.localize("HOURS_S") : Math.floor(interval) + " "+ localeContext.localize("HOURS_L");
    }
    interval = seconds / 60;
    if (interval > 1) {
      return shortForm ? Math.floor(interval) + localeContext.localize("MINUTES_S") : Math.floor(interval) + " "+ localeContext.localize("MINUTES_L");
    }
    return shortForm ? Math.floor(interval) + localeContext.localize("SECONDS_S") : Math.floor(seconds) + " "+ localeContext.localize("SECONDS_L");
}
export default prettyDate