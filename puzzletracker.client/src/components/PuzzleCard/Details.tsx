import type { Puzzle, UserPuzzle } from "../../types/dto/puzzle.types";
import ButtonLink from "../ButtonLink";

interface DetailsProps {
    puzzle: Puzzle | UserPuzzle;
}

const Details: React.FC<DetailsProps> = ({ puzzle }) => {

    const isUserPuzzle = (puzzle: Puzzle | UserPuzzle): puzzle is UserPuzzle => {
        return (puzzle as UserPuzzle).userPuzzleId !== undefined;
    }


    return (
        <>
            <div className="flex flex-col gap-0.5">
                <h3 className="text-indigo-50 font-medium max-w-[65%]">{puzzle.nameEnglish}</h3>
                {puzzle.puzzleType == "JVH" && <p className="text-sm text-indigo-400">{puzzle.nameLocal}</p>}
            </div>
            <div className="flex flex-col gap-0.5">
                <p className="text-[0.95rem] text-indigo-50 font-medium">{puzzle.brandName}</p>
                {puzzle.releaseDate && <p className="text-sm text-indigo-400"><span className="text-indigo-50">Release date:</span> {puzzle.releaseDate}</p>}
                {puzzle.seriesName && <p className="text-sm text-indigo-400"><span className="text-indigo-50">Series:</span> {puzzle.seriesName}</p>}
                {puzzle.illustratorName && <p className="text-sm text-indigo-400"><span className="text-indigo-50">Illustrator:</span> {puzzle.illustratorName}</p>}
                {puzzle.productNumber && <p className="text-sm text-indigo-400"><span className="text-indigo-50">Product number:</span> {puzzle.productNumber}</p>}
            </div>
            {isUserPuzzle(puzzle) && (
                <div className="flex flex-col gap-0.5">
                    <h4>Collection details</h4>
                    {puzzle.timesCompleted > 0 ? (
                        <p className="text-sm text-indigo-400"><span className="text-indigo-50">Times completed:</span> {puzzle.timesCompleted}</p>
                    ) : (
                        <p className="text-sm text-indigo-400"><span className="text-indigo-50">No details yet</span></p>
                    )}
                    {puzzle.lastCompletedDate && <p className="text-sm text-indigo-400"><span className="text-indigo-50">Last completed:</span> {new Date(puzzle.lastCompletedDate).toLocaleDateString("sv-SE")}</p>}

                    <ButtonLink
                        className="mt-2"
                        route={`/profile/collection/${puzzle.puzzleId}/update`}
                        theme="secondary"
                    >
                        Update information
                    </ButtonLink>

                </div>
            )}
        </>
    );
}

export default Details;