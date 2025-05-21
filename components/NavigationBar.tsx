"use client";

import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { GoogleIcon } from "@/components/icons/GoogleIcon"; // Assuming you'll create/have this icon

export default function NavigationBar() {
  const { currentUser, signInWithGoogle, signOut, isLoading } = useAuth();

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link
              href="/"
              className="text-xl font-bold text-gray-800 hover:text-indigo-600 transition-colors"
            >
              SkillTrackr
            </Link>
          </div>
          <div className="flex items-center space-x-4">
            <Link
              href="/skills"
              className="text-gray-600 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
            >
              All Skills
            </Link>

            {isLoading ? (
              <div className="h-8 w-32 bg-gray-200 animate-pulse rounded-md"></div>
            ) : currentUser ? (
              <div className="flex items-center space-x-3">
                {currentUser.photoURL && (
                  <img
                    src={currentUser.photoURL}
                    alt={currentUser.displayName || "User avatar"}
                    className="h-8 w-8 rounded-full"
                  />
                )}
                {currentUser.displayName && (
                  <span className="text-gray-700 text-sm hidden sm:block">
                    Hi, {currentUser.displayName.split(" ")[0]}
                  </span>
                )}
                <button
                  onClick={signOut}
                  className="px-3 py-2 text-sm font-medium text-white bg-red-500 rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <button
                onClick={signInWithGoogle}
                className="flex items-center justify-center space-x-2 px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors shadow-sm hover:shadow-md"
              >
                <GoogleIcon className="w-5 h-5" />
                <span>Sign in with Google</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
