"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import SkillCard from "@/components/SkillCard";
import { Skill } from "@/types/skill";
import { getSkills, deleteSkill } from "@/lib/firestore";
import { useAuth } from "@/contexts/AuthContext";

export default function AllSkillsPage() {
  const router = useRouter();
  const { currentUser, isLoading: authIsLoading, signInWithGoogle } = useAuth();
  const [skills, setSkills] = useState<Skill[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchSkills = async () => {
    if (!currentUser) return;
    setIsLoading(true);
    try {
      const fetchedSkills = await getSkills();
      setSkills(fetchedSkills);
    } catch (error) {
      console.error("Error fetching skills: ", error);
      // Optionally, set an error state here
    }
    setIsLoading(false);
  };

  useEffect(() => {
    if (currentUser) {
      fetchSkills();
    }
    if (!authIsLoading && !currentUser) {
      setIsLoading(false);
      setSkills([]);
    }
  }, [currentUser, authIsLoading]);

  const handleManageSkill = (skillId: string) => {
    router.push(`/skills/${skillId}`);
  };

  const handleDeleteSkill = async (id: string) => {
    if (
      window.confirm(
        "Are you sure you want to delete this skill and all its milestones?"
      )
    ) {
      try {
        await deleteSkill(id);
        fetchSkills();
      } catch (error) {
        console.error("Error deleting skill: ", error);
        // Add user-facing error handling with toast
      }
    }
  };

  if (authIsLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-indigo-600"></div>
        <p className="text-xl text-gray-600 ml-4">Loading Application...</p>
      </div>
    );
  }

  if (!currentUser && !authIsLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center text-center p-4">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Access Denied</h1>
        <p className="text-xl text-gray-600 mb-8">
          Please sign in with Google to view your skills.
        </p>
        <button
          onClick={signInWithGoogle}
          className="px-6 py-3 font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors duration-300 shadow-md hover:shadow-lg flex items-center space-x-2"
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
      </div>
    );
  }

  if (isLoading && currentUser) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-indigo-500"></div>
        <p className="text-xl text-gray-600 ml-4">Loading skills...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 min-h-[calc(100vh-12rem)]">
      <div className="mb-10">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 text-center">
          All Tracked Skills
        </h1>
        {/* Optional: Add a link/button to navigate to the Add Skill page/modal if desired from here */}
        {/* <div className="mt-4 text-center">
          <button 
            onClick={() => router.push('/')} // Or open an AddSkillModal if preferred
            className="px-6 py-2 font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors duration-300 shadow-md hover:shadow-lg"
          >
            Add New Skill
          </button>
        </div> */}
      </div>

      {skills.length === 0 && !isLoading && (
        <div className="text-center py-16 px-4 bg-white shadow-lg rounded-lg">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              vectorEffect="non-scaling-stroke"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z"
            />
          </svg>
          <h3 className="mt-2 text-xl font-medium text-gray-900">
            No skills found
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            Looks like you haven&apos;t added any skills yet. Go to the
            dashboard to add some!
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-x-6 gap-y-8">
        {skills.map((skill) => (
          <SkillCard
            key={skill.id}
            skill={skill}
            onEdit={() => handleManageSkill(skill.id)}
            onDelete={() => handleDeleteSkill(skill.id)}
          />
        ))}
      </div>
    </div>
  );
}
