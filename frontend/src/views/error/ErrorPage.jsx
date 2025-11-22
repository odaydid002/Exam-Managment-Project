import React from 'react'

import { useRouteError, isRouteErrorResponse } from "react-router-dom";
import Error from './Error';
import Error404 from './Error404';
import Error403 from './Error403';
import ServerError from './ServerError';
import NetworkError from './NetworkError';

export default function ErrorPage() {
  const error = useRouteError();

  if (error instanceof TypeError && error.message.includes("Failed to fetch")) {
    return <NetworkError />;
  }

  if (isRouteErrorResponse(error)) {
    switch (error.status) {
      case 404: return <Error404 />  
      case 403: return <Error403 />  
      case 500: return <ServerError />
      default: return <Error err={error} />
    }
  }

  return <Error err={error} />
}
