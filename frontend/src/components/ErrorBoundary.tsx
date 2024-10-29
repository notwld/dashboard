import { useState } from "react";
import { isRouteErrorResponse, useRouteError } from "react-router-dom";

function RootBoundary() {
    const error = useRouteError();
    function toggleError(statusCode,error: any) {
        return <div
            className="text-red-500 bg-black h-screen w-screen  flex flex-col justify-center items-center"
        >
            <h1 className="text-7xl">
                {statusCode}
            </h1>
            <div className="h-2 w-40 bg-red-600 my-5"/>
            <h1 className="text-4xl">
                {error}
            </h1>
        </div>
    }
    if (isRouteErrorResponse(error)) {
        if (error.status === 404) {
            return toggleError(error.status,"Page not found");
        }

        if (error.status === 401) {
            return toggleError(error.status,"Unauthorized");
        }

        if (error.status === 503) {
            return toggleError(error.status,"Service unavailable");
        }

        if (error.status === 418) {
            return toggleError(error.status,"I'm a teapot");
        }
    }

    return <div>Something went wrong</div>;
}

export default RootBoundary;