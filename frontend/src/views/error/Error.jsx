import React from 'react'
import { useLocation } from "react-router-dom";


const Error = ({err}) => {
    console.error(err)

    const location = useLocation();

    return (
    <div>{location.pathname} -&gt; Rendering Error </div>
    )
}

export default Error