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
            themeClass = "bg-indigo-600 text-white";
            break;
        case "secondary":
            themeClass = "bg-indigo-700/60 text-white";
            break;
    }

    return (
        <button
            type={type}
            onClick={onClick}
            disabled={disabled}
            className={`px-2 py-1 rounded text-sm shadow cursor-pointer ${themeClass} ${className}`}
        >
            {children}
        </button>
    );
};

export default Button;