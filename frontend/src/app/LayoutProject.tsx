import { Outlet } from "react-router-dom"
//import Header from "./Components/header/Header"
import Protected from "./ProtectedRoute" 
export default function LayoutProject(){
    return(
        <>     
       <Protected><Outlet/></Protected> 
        </>
    )
}