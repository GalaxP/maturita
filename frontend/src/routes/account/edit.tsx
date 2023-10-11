import { post_data } from "helpers/api";
import { useEffect } from "react"

const Edit = () => {
    useEffect(()=>{
        /*const script = document.createElement('script');
        script.src
        document.body.appendChild(script);

        return () => {
        document.body.removeChild(script);
        }*/
    }, [])

    const onSubmit = (e:any) => {
        e.preventDefault();
        // @ts-ignore
        grecaptcha.ready(function() {
            // @ts-ignore
          grecaptcha.execute(process.env.REACT_APP_RECAPTCHA_SITE_KEY, {action: 'submit'}).then(function(token) {
              // Add your logic to submit to your backend server here.
          });
        });
    }
   
    
    return <>
     <form>
        <label htmlFor="fname">First name:</label><br/>
        <input type="text" id="fname" name="fname"/><br/>
        <label htmlFor="lname">Last name:</label><br/>
        <input type="text" id="lname" name="lname"/>
        <button type="submit" onClick={onSubmit}>Submit</button>

    </form>

    </>
}
export default Edit