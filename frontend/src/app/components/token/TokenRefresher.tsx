import { useEffect } from 'react';
import useUser from '..//..//../hooks/useUser';
import { API_BASE_URL } from '..//..//..//config';
export default function TokenRefresher() {
    const {setCurrentLoggedInUserData}=useUser();
// atob(...)
// atob decodes a base64 string to a normal string:
    function getTokenIssueTime(token: string) { 
        try { const payload = JSON.parse(atob(token.split(".")[1])); 
            return payload.iat * 1000; // convert to ms 
            } catch (err) { 
                return Date.now(); } }
    useEffect(() => {
        let timeout: ReturnType<typeof setTimeout>;
        async function checkAuth() {
          try {
            const res = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
              method: "POST",
              credentials: "include",
            });
    
            if (!res.ok) {
              console.log("No refresh token / Not logged in");
              setCurrentLoggedInUserData(null);
              return;
            }
    
            const data = await res.json();
    
            console.log("REFRESH RESPONSE:", data);
    
            // Store user + access token
            setCurrentLoggedInUserData({
              user: data.user,
              accessToken: data.accessToken,
            });
            scheduleTokenRefresh(data.accessToken);
          } catch (err) {
            console.log("Refresh failed:", err);
          }
    
         
        }
    
        function scheduleTokenRefresh(token:any){
            const issuedAt=getTokenIssueTime(token);
            const now=Date.now();
            const msUntilRefresh=issuedAt+55*60*1000-now;
            timeout=setTimeout(async()=>{
                checkAuth()

            },msUntilRefresh)

        }
        checkAuth();
        return()=>clearTimeout(timeout)
      }, []); 
  return null;
}
