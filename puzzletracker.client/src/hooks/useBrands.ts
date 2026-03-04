import { useState } from "react";
import Client from "../api/Client";
import type { Brand } from "../types/dto/brand.types";

const useBrands = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [brands, setBrands] = useState<Brand[]>([]);

    const getAllBrands = async () => {
        setLoading(true);
        setError(null);

        try {
            const fetchedBrands = await Client.Brands.getAll();
            setBrands(fetchedBrands);
            return fetchedBrands;
        } catch (err: any) {
            const errorMsg = err.response?.data?.message || err.message || "Error fetching brands";
            setError(errorMsg);
            console.error("Error fetching brands:", err);
            return [];
        } finally {
            setLoading(false);
        }
    };

    return {
        // State
        brands,
        loading,
        error,
        // Functions
        getAllBrands,
    };
};

export default useBrands;