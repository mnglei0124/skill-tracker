"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { Skill } from "@/types/skill";
import { Milestone } from "@/types/milestone";
import {
  getSkillById,
  updateSkillDetails,
  addMilestoneToSkill,
  toggleMilestoneCompletion,
  deleteMilestoneFromSkill,
  updateMilestoneInSkill, // Added for editing milestone descriptions
} from "@/lib/firestore";
import ProgressBar from "@/components/ProgressBar";
import { Toaster, toast } from "react-hot-toast";
import { useAuth } from "@/contexts/AuthContext"; // Import useAuth

// Helper to calculate progress (can be moved to a utils file later)
const calculateSkillProgress = (skill: Skill | null): number => {
  if (!skill || !skill.milestones || skill.milestones.length === 0) {
    return 0;
  }
  const completedMilestones = skill.milestones.filter(
    (m) => m.isCompleted
  ).length;
  return Math.round((completedMilestones / skill.milestones.length) * 100);
};

export default function SkillDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { currentUser, isLoading: authIsLoading, signInWithGoogle } = useAuth(); // Use auth state
  const skillId = typeof params.id === "string" ? params.id : "";

  const [skill, setSkill] = useState<Skill | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // States for inline editing skill details
  const [isEditingDetails, setIsEditingDetails] = useState(false);
  const [editableName, setEditableName] = useState("");
  const [editableCategory, setEditableCategory] = useState("");
  const [editableNotes, setEditableNotes] = useState("");

  // States for adding a new milestone
  const [newMilestoneDescription, setNewMilestoneDescription] = useState("");
  const [isAddingMilestone, setIsAddingMilestone] = useState(false);

  // States for editing a milestone description
  const [editingMilestoneId, setEditingMilestoneId] = useState<string | null>(
    null
  );
  const [editingMilestoneText, setEditingMilestoneText] = useState("");

  const fetchSkillData = useCallback(async () => {
    if (!currentUser || !skillId) {
      // Check for currentUser as well
      setIsLoading(false);
      if (!currentUser) setError("Please sign in to view skill details.");
      else setError("Skill ID is missing.");
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const fetchedSkill = await getSkillById(skillId);
      if (fetchedSkill) {
        setSkill(fetchedSkill);
        setEditableName(fetchedSkill.name);
        setEditableCategory(fetchedSkill.category || "");
        setEditableNotes(fetchedSkill.notes || "");
      } else {
        setError("Skill not found.");
        setSkill(null);
      }
    } catch (err) {
      console.error("Error fetching skill details: ", err);
      setError("Failed to load skill details.");
      setSkill(null);
    }
    setIsLoading(false);
  }, [skillId, currentUser]);

  useEffect(() => {
    if (currentUser) {
      // Fetch skill data only if user is logged in
      fetchSkillData();
    }
    // If auth is done loading and there's no user, set error and stop skill loading
    if (!authIsLoading && !currentUser) {
      setError("Please sign in to view skill details.");
      setIsLoading(false);
      setSkill(null); // Clear any stale skill data
    }
  }, [fetchSkillData, currentUser, authIsLoading]); // Add dependencies

  const handleUpdateSkillDetails = async () => {
    if (!skill) return;
    try {
      await updateSkillDetails(skill.id, {
        name: editableName,
        category: editableCategory,
        notes: editableNotes,
      });
      await fetchSkillData(); // Re-fetch to get updated data
      setIsEditingDetails(false);
      toast.success("Skill details updated successfully!");
    } catch (err) {
      console.error("Error updating skill details: ", err);
      toast.error("Failed to update skill details.");
    }
  };

  const handleAddMilestone = async () => {
    if (!skill || !newMilestoneDescription.trim()) return;
    setIsAddingMilestone(true);
    try {
      await addMilestoneToSkill(skill.id, newMilestoneDescription.trim());
      setNewMilestoneDescription("");
      await fetchSkillData();
      toast.success("Milestone added!");
    } catch (err) {
      console.error("Error adding milestone: ", err);
      toast.error("Failed to add milestone.");
    }
    setIsAddingMilestone(false);
  };

  const handleToggleMilestone = async (milestoneId: string) => {
    if (!skill) return;
    try {
      await toggleMilestoneCompletion(skill.id, milestoneId);
      await fetchSkillData();
      toast.success("Milestone updated!");
    } catch (err) {
      console.error("Error toggling milestone: ", err);
      toast.error("Failed to update milestone.");
    }
  };

  const handleDeleteMilestone = async (milestoneId: string) => {
    if (!skill) return;
    if (window.confirm("Are you sure you want to delete this milestone?")) {
      try {
        await deleteMilestoneFromSkill(skill.id, milestoneId);
        await fetchSkillData();
        toast.success("Milestone deleted.");
      } catch (err) {
        console.error("Error deleting milestone: ", err);
        toast.error("Failed to delete milestone.");
      }
    }
  };

  const handleStartEditMilestone = (milestone: Milestone) => {
    setEditingMilestoneId(milestone.id);
    setEditingMilestoneText(milestone.description);
  };

  const handleCancelEditMilestone = () => {
    setEditingMilestoneId(null);
    setEditingMilestoneText("");
  };

  const handleSaveMilestoneEdit = async () => {
    if (!skill || !editingMilestoneId || !editingMilestoneText.trim()) return;
    try {
      await updateMilestoneInSkill(skill.id, editingMilestoneId, {
        description: editingMilestoneText.trim(),
      });
      await fetchSkillData();
      handleCancelEditMilestone();
      toast.success("Milestone description updated!");
    } catch (err) {
      console.error("Error updating milestone description: ", err);
      toast.error("Failed to update milestone description.");
    }
  };

  const overallProgress = calculateSkillProgress(skill);

  // If auth is loading, show a generic loading screen
  if (authIsLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-indigo-600"></div>
        <p className="text-xl text-gray-600 ml-4">Loading Application...</p>
      </div>
    );
  }

  // Skill data is loading (and user is authenticated implicitly by this point if isLoading is true for skills)
  if (isLoading && currentUser) {
    // isLoading here refers to skill data loading
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-indigo-600"></div>
        <p className="text-xl text-gray-600 ml-4">Loading Skill Details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen bg-gray-100 text-center p-4">
        <h2 className="text-2xl mb-4 font-semibold text-red-600">Error</h2>
        <p className="text-gray-700 mb-6">{error}</p>
        {!currentUser && !authIsLoading && (
          <button
            onClick={signInWithGoogle}
            className="px-6 py-3 font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors duration-300 shadow-md hover:shadow-lg flex items-center space-x-2 mb-4"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 48 48"
              width="24px"
              height="24px"
              fillRule="evenodd"
              clipRule="evenodd"
              strokeLinejoin="round"
              strokeMiterlimit="2"
            >
              <path
                fill="#FFC107"
                d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24s8.955,20,20,20s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"
              />
              <path
                fill="#FF3D00"
                d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"
              />
              <path
                fill="#4CAF50"
                d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"
              />
              <path
                fill="#1976D2"
                d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.089,5.571l0.001-0.001l6.19,5.238C39.705,35.596,44,30.251,44,24C44,22.659,43.862,21.35,43.611,20.083z"
              />
            </svg>
            <span>Sign in with Google</span>
          </button>
        )}
        <button
          onClick={() => router.push("/")}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  if (!skill && !isLoading && !error && currentUser) {
    // Check for currentUser here
    // This case means skill ID was valid, user is logged in, but skill wasn't found for this user (or general not found)
    // Error state from fetchSkillData should ideally cover "Skill not found."
    return (
      <div className="text-center py-10">
        <p>Skill not found, or you may not have access.</p>
        <button
          onClick={() => router.push("/")}
          className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  // If skill is null (and not loading, no error) and no user, this path shouldn't ideally be hit due to earlier checks.
  // But as a fallback for the component to render something if `skill` is null when it expects it.
  if (!skill) {
    return null; // Or a more graceful empty state if this condition is legitimately reachable
  }

  // UI for Skill Detail Page (JSX will go here in the next step)
  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      <Toaster position="top-center" />
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="mb-6 inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          <svg
            className="-ml-1 mr-2 h-5 w-5 text-gray-400"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
              clipRule="evenodd"
            />
          </svg>
          Back
        </button>

        {/* Skill Header & Overall Progress */}
        <div className="bg-white shadow-xl rounded-lg p-6 mb-8">
          <div className="flex justify-between items-start mb-4">
            {isEditingDetails ? (
              <input
                type="text"
                value={editableName}
                onChange={(e) => setEditableName(e.target.value)}
                className="text-3xl font-bold text-gray-800 border-b-2 border-indigo-500 focus:outline-none py-1 flex-grow"
              />
            ) : (
              <h1 className="text-3xl font-bold text-gray-800 flex-grow break-words">
                {skill.name}
              </h1>
            )}
            {!isEditingDetails && (
              <button
                onClick={() => setIsEditingDetails(true)}
                className="ml-4 p-2 text-sm text-indigo-600 hover:text-indigo-800"
              >
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828zM5 12V7.172l7.586-7.586a2 2 0 012.828 0L17.414 2a2 2 0 010 2.828L9.828 12H7zM5 13a1 1 0 00-1 1v2a1 1 0 001 1h10a1 1 0 001-1v-2a1 1 0 00-1-1H5z"></path>
                </svg>
              </button>
            )}
          </div>

          {isEditingDetails ? (
            <input
              type="text"
              value={editableCategory}
              placeholder="Category (e.g., Frontend)"
              onChange={(e) => setEditableCategory(e.target.value)}
              className="text-sm text-gray-500 mb-3 border-b focus:outline-none focus:border-indigo-500 w-full py-1"
            />
          ) : (
            skill.category && (
              <p className="text-sm text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full inline-block mb-3">
                {skill.category}
              </p>
            )
          )}

          <div className="mb-3">
            <div className="flex justify-between text-sm text-gray-600 mb-1">
              <span>Overall Progress</span>
              <span>{overallProgress}%</span>
            </div>
            <ProgressBar progress={overallProgress} />
          </div>

          {isEditingDetails && (
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notes
              </label>
              <textarea
                value={editableNotes}
                onChange={(e) => setEditableNotes(e.target.value)}
                rows={3}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Add notes about this skill..."
              />
            </div>
          )}

          {isEditingDetails && (
            <div className="mt-4 flex justify-end space-x-3">
              <button
                onClick={() => {
                  setIsEditingDetails(false);
                  fetchSkillData(); /* Reset changes */
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateSkillDetails}
                className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
              >
                Save Details
              </button>
            </div>
          )}
        </div>

        {/* Milestones Section */}
        <div className="bg-white shadow-xl rounded-lg p-6 mb-8">
          <h2 className="text-2xl font-semibold text-gray-700 mb-6">
            Milestones
          </h2>

          {/* Add Milestone Form */}
          <div className="mb-6 p-4 border border-gray-200 rounded-lg bg-gray-50">
            <h3 className="text-lg font-medium text-gray-700 mb-2">
              Add New Milestone
            </h3>
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                value={newMilestoneDescription}
                onChange={(e) => setNewMilestoneDescription(e.target.value)}
                placeholder="Describe the milestone..."
                className="flex-grow p-2.5 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
              <button
                onClick={handleAddMilestone}
                disabled={isAddingMilestone || !newMilestoneDescription.trim()}
                className="w-full sm:w-auto px-5 py-2.5 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 transition-colors shadow"
              >
                {isAddingMilestone ? "Adding..." : "Add Milestone"}
              </button>
            </div>
          </div>

          {/* Milestones List */}
          {skill.milestones.length === 0 ? (
            <p className="text-center text-gray-500 py-4">
              No milestones added yet for this skill.
            </p>
          ) : (
            <ul className="space-y-4">
              {skill.milestones
                .slice()
                .sort((a, b) => a.createdAt.toMillis() - b.createdAt.toMillis())
                .map((milestone) => (
                  <li
                    key={milestone.id}
                    className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow bg-white flex items-center justify-between gap-4"
                  >
                    <div className="flex items-center flex-grow">
                      <input
                        type="checkbox"
                        checked={milestone.isCompleted}
                        onChange={() => handleToggleMilestone(milestone.id)}
                        className="h-5 w-5 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500 cursor-pointer mr-4"
                      />
                      {editingMilestoneId === milestone.id ? (
                        <input
                          type="text"
                          value={editingMilestoneText}
                          onChange={(e) =>
                            setEditingMilestoneText(e.target.value)
                          }
                          onBlur={handleSaveMilestoneEdit} // Save on blur
                          onKeyDown={(e) =>
                            e.key === "Enter" && handleSaveMilestoneEdit()
                          } // Save on Enter
                          autoFocus
                          className="flex-grow text-sm text-gray-700 border-b border-gray-300 focus:border-indigo-500 outline-none py-1"
                        />
                      ) : (
                        <span
                          onClick={() => handleStartEditMilestone(milestone)}
                          className={`flex-grow text-sm cursor-pointer ${
                            milestone.isCompleted
                              ? "line-through text-gray-500"
                              : "text-gray-700"
                          }`}
                        >
                          {milestone.description}
                        </span>
                      )}
                    </div>
                    <div className="flex-shrink-0 flex items-center space-x-2">
                      {editingMilestoneId === milestone.id && (
                        <button
                          onClick={handleCancelEditMilestone}
                          className="text-xs text-gray-500 hover:text-gray-700"
                        >
                          Cancel
                        </button>
                      )}
                      <button
                        onClick={() => handleDeleteMilestone(milestone.id)}
                        className="text-red-500 hover:text-red-700 p-1 rounded hover:bg-red-100"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                            clipRule="evenodd"
                          ></path>
                        </svg>
                      </button>
                    </div>
                  </li>
                ))}
            </ul>
          )}
        </div>

        {/* Notes section if not editing details inline */}
        {!isEditingDetails && skill.notes && (
          <div className="bg-white shadow-xl rounded-lg p-6">
            <h2 className="text-2xl font-semibold text-gray-700 mb-4">Notes</h2>
            <p className="text-gray-600 whitespace-pre-wrap break-words">
              {skill.notes}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
