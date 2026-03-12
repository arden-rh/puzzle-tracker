interface ButtonProps {
    onClick?: () => void;
    disabled?: boolean;
    children: React.ReactNode;
    className?: string;
    theme?: "primary" | "secondary";
    type?: "button" | "submit" | "reset";
}

const Button: React.FC<ButtonProps> = ({ onClick, disabled = false, children, className = "", theme = "primary", type = "button" }) => {
    let themeClass = "";
    switch (theme) {
        case "primary":
            themeClass = "bg-indigo-600 text-white hover:bg-indigo-700 hover:ring hover:ring-indigo-300/50 hover:shadow-md";
            break;
        case "secondary":
            themeClass = "bg-indigo-700/60 text-white hover:bg-indigo-900 hover:ring hover:ring-indigo-300/50 hover:shadow-md";
            break;
    }

    return (
        <button
            type={type}
            onClick={onClick}
            disabled={disabled}
            className={`flex items-center justify-center px-2 py-1 rounded text-sm text-center shadow cursor-pointer font-poppins ${themeClass} ${className}`}
        >
            {children}
        </button>
    );
};

export default Button;