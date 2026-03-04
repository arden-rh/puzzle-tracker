/* eslint-disable react-refresh/only-export-components */
import React, { useState, useEffect, createContext } from "react";
import Client from "../api/Client";
import type { UserProfile } from "../types/dto/user-profile.types";

interface UserContextValues {
    user: UserProfile | null;
    loading: boolean;
    login: (email: string, password: string) => Promise<void>;
    logout: () => void;
    refreshUserProfile: () => Promise<void>;
}

interface UserContextProps {
    children: React.ReactNode;
}

export const UserContext = createContext<UserContextValues | undefined>(undefined);

export const UserProvider: React.FC<UserContextProps> = ({ children }) => {

    const [user, setUser] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);

    const refreshUserProfile = async () => {
        try {
            const profile = await Client.Account.currentUserProfile();
            setUser(profile);
        } catch (error) {
            console.error("Error fetching user profile:", error);
            setUser(null);
        }
    };

    const login = async (email: string, password: string) => {
        await Client.Account.login(email, password);
        await refreshUserProfile();
    };

    const logout = async () => {
        await Client.Account.logout();
        setUser(null);
        window.location.href = "/";
    };

    useEffect(() => {
        // Get the user information from the server/cookie on mount
        const fetchUser = async () => {
            try {
                console.log("Fetching user profile...");
                const profile = await Client.Account.currentUserProfile();
                console.log("Profile fetched successfully:", profile);
                setUser(profile);
            } catch (error: any) {
                console.error("Error fetching user profile:", error);
                console.error("Error response:", error.response);
                console.error("Error status:", error.response?.status);
                setUser(null);
            } finally {
                console.log("Setting loading to false");
                setLoading(false);
            }
        };

        fetchUser();
    }, []);

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <UserContext.Provider value={{ user, loading, logout, refreshUserProfile, login }}>
            {children}
        </UserContext.Provider>
    );
}


