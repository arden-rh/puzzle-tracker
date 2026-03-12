import { Link } from "react-router";

interface ButtonLinkProps {
    children: React.ReactNode;
    className?: string;
    theme?: "primary" | "secondary";
    route: string;
}

const ButtonLink: React.FC<ButtonLinkProps> = ({ children, className = "", theme = "primary", route }) => {
    let themeClass = "";
    switch (theme) {
        case "primary":
            themeClass = "bg-indigo-600 text-white hover:bg-indigo-700";
            break;
        case "secondary":
            themeClass = "bg-indigo-700/60 text-white hover:bg-indigo-900";
            break;
    }

    return (
        <Link
            to={route}
            className={`flex items-center justify-center px-2 py-1 rounded text-sm text-center shadow cursor-pointer font-poppins ${themeClass} ${className}`}
        >
            {children}
        </Link>
    );
};

export default ButtonLink;