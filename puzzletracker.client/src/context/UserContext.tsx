/* eslint-disable react-refresh/only-export-components */
import React, { useState, useEffect, createContext } from "react";
import Client from "../api/Client";
import { getErrorMessage } from "../api/errors";
import type { UserProfile, UpdateUserProfile } from "../types/dto/user-profile.types";

interface UserContextValues {
    user: UserProfile | null;
    loading: boolean;
    login: (email: string, password: string) => Promise<void>;
    logout: () => void;
    refreshUserProfile: () => Promise<void>;
    register: (email: string, password: string, confirmPassword: string, displayName?: string) => Promise<void>;
    updateUserProfile: (profileData: UpdateUserProfile) => Promise<void>;
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
        } catch (error: unknown) {
            console.error("Error fetching user profile:", getErrorMessage(error, "Unknown error"));
            setUser(null);
        }
    };

        const updateUserProfile = async (profileData: UpdateUserProfile) => {
        const updatedProfile = await Client.Account.updateUserProfile(profileData);
        if (updatedProfile) {
            setUser(updatedProfile);
        } else {
            await refreshUserProfile();
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

    const register = async (email: string, password: string, confirmPassword: string, displayName?: string) => {
        if (password !== confirmPassword) {
            throw new Error("Passwords do not match");
        }
        await Client.Account.register(email, password, confirmPassword, displayName);
        await refreshUserProfile();
    };

    useEffect(() => {
        // Get the user information from the server/cookie on mount
        const fetchUser = async () => {
            try {
                const profile = await Client.Account.currentUserProfile();
                setUser(profile);
            } catch (error: unknown) {
                console.error("Error fetching user profile:", getErrorMessage(error, "Unknown error"));
                setUser(null);
            } finally {
                setLoading(false);
            }
        };

        fetchUser();
    }, []);

    if (loading) {
        return <div className="w-full flex items-center justify-center text-center"><span>Loading...</span></div>;
    }

    return (
        <UserContext.Provider value={{ user, loading, logout, refreshUserProfile, login, register, updateUserProfile }}>
            {children}
        </UserContext.Provider>
    );
}


