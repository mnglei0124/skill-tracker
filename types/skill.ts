// types/skill.ts
import { Timestamp } from "firebase/firestore";
import { Milestone } from "./milestone"; // Import Milestone type

export interface Skill {
  id: string;
  userId: string; // Added to associate skill with a user
  name: string;
  // level: number; // Replaced by milestone-based progress, or could be target level
  category?: string; // Optional: e.g., Frontend, Backend, Soft Skill
  notes?: string; // Optional: Any additional notes
  milestones: Milestone[]; // Array of milestones
  // resources?: string[]; // You had this before, uncomment if needed
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
