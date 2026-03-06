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
            themeClass = "bg-indigo-600 text-white";
            break;
        case "secondary":
            themeClass = "bg-indigo-700/60 text-white";
            break;
    }

    return (
        <a
            className={`px-2 py-1 rounded text-sm shadow ${themeClass} ${className}`}
            href={route}
        >
            {children}
        </a>
    );
};

export default ButtonLink;