import { useSelector } from "react-redux"
import VisitNotesPanel from "./VisitNotesPanel";

const Notes = () => {
  const { firstQ } = useSelector((state) => state.notes);
  const bottom_button = useSelector((state) => state.buttonNames.value);

  return (
    <div className="h-full min-h-0">
      {bottom_button !== 'create-visit-notes' && !firstQ && (
        <p className="text-gray-500 text-xl text-center font-bold flex items-center justify-center h-full">
          <span className="hidden sm:block">
            Please click on-Create visit Notes
          </span>
          <span className="sm:hidden text-xs">
            Please click on-Create visit Notes from the Menu above
          </span>
        </p>
      )}

      {bottom_button === 'create-visit-notes' && <VisitNotesPanel />}
    </div>
  )
}

export default Notes
