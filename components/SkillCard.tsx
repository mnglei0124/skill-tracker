import { Skill } from "@/types/skill";
import ProgressBar from "./ProgressBar";

interface SkillCardProps {
  skill: Skill;
  onEdit: () => void;
  onDelete: () => void;
}

// Helper function to calculate progress
const calculateProgress = (skill: Skill): number => {
  if (!skill.milestones || skill.milestones.length === 0) {
    return 0;
  }
  const completedMilestones = skill.milestones.filter(
    (m) => m.isCompleted
  ).length;
  return Math.round((completedMilestones / skill.milestones.length) * 100);
};

export default function SkillCard({ skill, onEdit, onDelete }: SkillCardProps) {
  const progress = calculateProgress(skill);

  return (
    <div className="bg-white shadow-lg rounded-xl p-6 flex flex-col justify-between hover:shadow-2xl transition-all duration-300 ease-in-out h-full border border-gray-200">
      <div>
        <div className="flex justify-between items-start mb-3">
          <h3
            className="text-xl font-semibold text-gray-800 truncate"
            title={skill.name}
          >
            {skill.name}
          </h3>
          {skill.category && (
            <span className="text-xs font-medium bg-indigo-100 text-indigo-700 px-2.5 py-1 rounded-full whitespace-nowrap">
              {skill.category}
            </span>
          )}
        </div>

        <div className="mb-3">
          <div className="flex justify-between text-sm text-gray-600 mb-1">
            <span>Progress</span>
            <span>{progress}%</span>
          </div>
          <ProgressBar progress={progress} />
        </div>

        {skill.milestones && skill.milestones.length > 0 && (
          <div className="mb-3">
            <p className="text-xs text-gray-500">
              {skill.milestones.filter((m) => m.isCompleted).length} of{" "}
              {skill.milestones.length} milestones completed.
            </p>
          </div>
        )}

        {skill.notes && (
          <p className="text-gray-600 text-sm mt-2 p-3 bg-gray-50 rounded-md border border-gray-200 whitespace-pre-wrap break-words">
            <span className="font-semibold text-gray-700 block mb-1">
              Notes:
            </span>
            {skill.notes}
          </p>
        )}
      </div>

      <div className="mt-6 flex justify-end space-x-3 pt-4 border-t border-gray-100">
        <button
          onClick={onEdit}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200 shadow-sm hover:shadow-md"
        >
          Manage Skill
        </button>
        <button
          onClick={onDelete}
          className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors duration-200 shadow-sm hover:shadow-md"
        >
          Delete
        </button>
      </div>
    </div>
  );
}
