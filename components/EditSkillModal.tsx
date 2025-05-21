import { useState, useEffect } from "react";
import { Skill } from "@/types/skill";

interface EditSkillModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEditSkillDetails: (
    skillData: Omit<
      Skill,
      "id" | "createdAt" | "updatedAt" | "milestones" | "userId"
    >
  ) => void;
  skillToEdit: Skill | null;
}

export default function EditSkillModal({
  isOpen,
  onClose,
  onEditSkillDetails,
  skillToEdit,
}: EditSkillModalProps) {
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (skillToEdit) {
      setName(skillToEdit.name);
      setCategory(skillToEdit.category || "");
      setNotes(skillToEdit.notes || "");
    } else {
      // Reset form if no skill is being edited (e.g. modal closed and reopened without a skill)
      setName("");
      setCategory("");
      setNotes("");
    }
  }, [skillToEdit, isOpen]); // Rerun effect if skillToEdit or isOpen changes

  if (!isOpen || !skillToEdit) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert("Skill name is required.");
      return;
    }

    onEditSkillDetails({ name, category, notes });
    onClose(); // Close modal after submission
  };

  return (
    <div className="fixed inset-0 bg-gray-800 bg-opacity-75 transition-opacity overflow-y-auto h-full w-full flex justify-center items-center z-50 px-4">
      <div className="bg-white p-6 sm:p-8 rounded-xl shadow-2xl w-full max-w-lg transform transition-all">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold text-gray-800">
            Edit Skill Details
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="editSkillName"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Skill Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="editSkillName"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 block w-full px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-shadow"
              required
            />
          </div>

          <div>
            <label
              htmlFor="editSkillCategory"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Category
            </label>
            <input
              type="text"
              id="editSkillCategory"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="e.g., Frontend, Cloud, Design"
              className="mt-1 block w-full px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-shadow"
            />
          </div>

          <div>
            <label
              htmlFor="editSkillNotes"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Notes
            </label>
            <textarea
              id="editSkillNotes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
              placeholder="Any additional details, resources, or context..."
              className="mt-1 block w-full px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-shadow"
            />
          </div>

          <div className="flex justify-end space-x-4 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400 transition-colors shadow-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors shadow-md hover:shadow-lg"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
