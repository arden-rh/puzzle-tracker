import { useState } from "react";
import Client from "../api/Client";
import type { Illustrator } from "../types/dto.types";

const useIllustrators = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [illustrators, setIllustrators] = useState<Illustrator[]>([]);

    const getAllIllustrators = async () => {
        setLoading(true);
        setError(null);

        try {
            const fetchedIllustrators = await Client.Illustrators.getAll();
            setIllustrators(fetchedIllustrators);
            return fetchedIllustrators;
        } catch (err: any) {
            const errorMsg = err.response?.data?.message || err.message || "Error fetching illustrators";
            setError(errorMsg);
            console.error("Error fetching illustrators:", err);
            return [];
        } finally {
            setLoading(false);
        }
    };

    return {
        // State
        illustrators,
        loading,
        error,
        // Functions
        getAllIllustrators,
    };
};

export default useIllustrators;