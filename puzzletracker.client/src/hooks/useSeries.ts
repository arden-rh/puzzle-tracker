import { useState } from "react";
import Client from "../api/Client";
import type { Series } from "../types/dto.types";

const useSeries = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [series, setSeries] = useState<Series[]>([]);

    const getAllSeries = async () => {
        setLoading(true);
        setError(null);

        try {
            const fetchedSeries = await Client.Series.getAll();
            setSeries(fetchedSeries);
            return fetchedSeries;
        } catch (err: any) {
            const errorMsg = err.response?.data?.message || err.message || "Error fetching series";
            setError(errorMsg);
            console.error("Error fetching series:", err);
            return [];
        } finally {
            setLoading(false);
        }
    };

    return {
        // State
        series,
        loading,
        error,
        // Functions
        getAllSeries,
    };
};

export default useSeries;