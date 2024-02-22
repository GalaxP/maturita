function prettyDate(date: number, shortForm: boolean = false) {

    var seconds = Math.floor((new Date().getTime() - date) / 1000);
  
    var interval = seconds / 31536000;
  
    if (interval > 1) {
      return shortForm ? Math.floor(interval) + " yrs." : Math.floor(interval) + " years";
    }
    interval = seconds / 2592000;
    if (interval > 1) {
      return shortForm ? Math.floor(interval) + " mo." : Math.floor(interval) + " months";
    }
    interval = seconds / 86400;
    if (interval > 1) {
      return shortForm ? Math.floor(interval) + " d." : Math.floor(interval) + " days";
    }
    interval = seconds / 3600;
    if (interval > 1) {
      return shortForm ? Math.floor(interval) + " hrs." : Math.floor(interval) + " hours";
    }
    interval = seconds / 60;
    if (interval > 1) {
      return shortForm ? Math.floor(interval) + " min." : Math.floor(interval) + " minutes";
    }
    return shortForm ? Math.floor(interval) + " s." : Math.floor(seconds) + " seconds";
}
export default prettyDate