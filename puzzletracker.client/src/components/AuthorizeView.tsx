import React, { useState, useEffect, createContext } from "react";
import { Navigate } from "react-router-dom";

const UserContext = createContext({});

interface User {
    email: string;
}

interface AuthorizeViewProps {
    children: React.ReactNode;
}

const AuthorizeView = ({ children }: AuthorizeViewProps) => {

    const [authorized, setAuthorized] = useState(false);
    const [loading, setLoading] = useState(true);
    const emptyUser: User = { email: "" };

    const [user, setUser] = useState(emptyUser);

    useEffect(() => {
        // Get the user information from the server/cookie
        let retryCount = 0;
        const maxRetries = 10;
        const delay = 1000; // Initial delay of 1 second

        const wait = (delay: number) => new Promise(resolve => setTimeout(resolve, delay));

        const fetchUserWithRetry = async (url: string, options: RequestInit) => {
            try {
                const response = await fetch(url, options);

                if (response.ok) {
                    console.log("User information retrieved successfully.");
                    const userData = await response.json();
                    setUser(userData);
                    setAuthorized(true);
                    return response;
                } else if (response.status === 401) {
                    console.warn("Unauthorized access. User is not logged in.");
                    return response;
                } else {
                    throw new Error(`Request failed with status ${response.status}`);
                }
            } catch (error) {

                console.error("Error fetching user information:", error);
                retryCount++;

                if (retryCount > maxRetries) {
                    throw new Error("Max retries reached. Unable to fetch user information.");
                } else {
                    await wait(delay);
                    return fetchUserWithRetry(url, options);
                }
            }
        };

        fetchUserWithRetry("/pingauth", { method: "GET" })
            .catch(error => {
                console.error("Error fetching user information:", error);
            })
            .finally(() => {
                setLoading(false);
            });
    }, []);

    if (loading) {
        return <div>Loading...</div>;
    }
    else {
        if (authorized && !loading) {

            return (
                <>
                    <UserContext.Provider value={user}>{children}</UserContext.Provider>
                </>
            );
        } else {
            return <Navigate to="/" />;
        }
    }
}

export { AuthorizeView, UserContext };
