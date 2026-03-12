import Button from "../Button";
import ButtonLink from "../ButtonLink";

interface StatusSectionProps {
    puzzleId: number;
    isCustom: boolean;
    isCompleted: boolean;
    isOwned: boolean;
    isInCollection: boolean;
    actionLoading: boolean;
    onMarkCompleted: (puzzleId: number) => void;
    onMarkIncomplete: (puzzleId: number) => void;
    onToggleOwned: (puzzleId: number) => void;
    onAddToCollection?: (puzzleId: number) => void;
    onRemoveFromCollection?: (puzzleId: number) => void;
}

const StatusSection: React.FC<StatusSectionProps> = ({
    puzzleId,
    isCustom,
    isCompleted,
    isOwned,
    isInCollection,
    actionLoading,
    onMarkCompleted,
    onMarkIncomplete,
    onToggleOwned,
    onAddToCollection,
    onRemoveFromCollection
}) => {

    const collectionAction = isInCollection ? onRemoveFromCollection : onAddToCollection;

    return (
        <div className="flex flex-col gap-0.5">
            <h4 className="font-medium">Status</h4>
            <div className="status grid grid-cols-[max-content_auto] gap-x-3 gap-y-2 items-center">
                <span className="text-[0.95rem]">Completion:</span>
                {isCompleted ? (
                    <Button
                        onClick={() => onMarkIncomplete(puzzleId)}
                        disabled={actionLoading}
                        theme="primary"
                        className="justify-self-start"
                    >
                        Completed
                    </Button>
                ) : (
                    <Button
                        onClick={() => onMarkCompleted(puzzleId)}
                        disabled={actionLoading}
                        theme="secondary"
                        className="justify-self-start"
                    >
                        Not Completed
                    </Button>
                )}
                {!isCustom && (
                    <>
                        <span className="text-[0.95rem]">Ownership:</span>
                        {isOwned ? (
                            <Button
                                className="justify-self-start"
                                onClick={() => onToggleOwned(puzzleId)}
                                theme="primary"
                                disabled={actionLoading}
                            >
                                Owned
                            </Button>
                        ) : (
                            <Button
                                className="justify-self-start"
                                onClick={() => onToggleOwned(puzzleId)}
                                theme="secondary"
                                disabled={actionLoading}
                            >
                                Not Owned
                            </Button>
                        )}
                    </>
                )}
                {isCustom && (
                    <>
                        <span className="text-[0.95rem]">Owned:</span> Yes
                    </>
                )}
                {!isCustom && collectionAction && (
                    <>
                        <span className="text-[0.95rem]">Collection:</span>
                        {isInCollection ? (
                            <Button
                                className="justify-self-start"
                                onClick={() => collectionAction(puzzleId)}
                                theme="primary"
                                disabled={actionLoading}
                            >
                                Remove
                            </Button>
                        ) : (
                            <Button
                                className="justify-self-start"
                                onClick={() => collectionAction(puzzleId)}
                                theme="secondary"
                                disabled={actionLoading}
                            >
                                Add
                            </Button>
                        )}
                    </>
                )}
                {isCustom && (
                    <>
                        <span className="text-[0.95rem]">In Collection:</span> Yes
                    </>
                )}
            </div>
        </div>
    )

}

export default StatusSection;