import { Navigate, useLocation, Outlet } from "react-router-dom";
import useUser from "../hooks/useUser";


const ProtectedRoute = () => {
    const { user, loading } = useUser();
    const location = useLocation();

    if (loading) return <div className="w-full flex items-center justify-center text-center"><span>Loading...</span></div>;

    if (!user) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    return <Outlet />;
};

export default ProtectedRoute;