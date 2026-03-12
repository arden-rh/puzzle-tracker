import Button from "../Button";
import ButtonLink from "../ButtonLink";

interface CustomActionsProps {
    puzzleId: number;
    actionLoading: boolean;
    deleteCustomPuzzle: (puzzleId: number) => void;
}

const CustomActions: React.FC<CustomActionsProps> = ({ puzzleId, actionLoading, deleteCustomPuzzle }) => {
    return (
        <div>
            <span className="text-[0.95rem] col-span-2">Custom Puzzle:</span>
            <span className="col-span-2 flex gap-2">
                <ButtonLink
                    className="justify-self-start"
                    route={`/profile/custom-puzzles/${puzzleId}/edit`}
                    theme="secondary"
                >
                    Edit
                </ButtonLink>
                <Button
                    className="justify-self-start"
                    onClick={() => deleteCustomPuzzle(puzzleId)}
                    theme="secondary"
                    disabled={actionLoading}
                >
                    Delete
                </Button>
            </span>
        </div>
    );
}

export default CustomActions;