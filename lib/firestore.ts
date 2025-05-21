// lib/firestore.ts
import { db, auth } from "./firebase";
import {
  collection,
  addDoc,
  getDocs,
  doc,
  getDoc,
  deleteDoc,
  updateDoc,
  Timestamp,
  arrayUnion,
  query,
  where,
} from "firebase/firestore";
import { Skill } from "@/types/skill";
import { Milestone } from "@/types/milestone";
import { v4 as uuidv4 } from "uuid";

const skillsCollection = collection(db, "skills");

// Add a new skill
export const addSkill = async (
  skillData: Omit<
    Skill,
    "id" | "createdAt" | "updatedAt" | "milestones" | "userId"
  >
) => {
  const currentUser = auth.currentUser;
  if (!currentUser) {
    throw new Error("User not authenticated to add skill.");
  }
  const docRef = await addDoc(skillsCollection, {
    ...skillData,
    userId: currentUser.uid,
    milestones: [],
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  });
  return docRef.id;
};

// Get all skills for the current user
export const getSkills = async (): Promise<Skill[]> => {
  const currentUser = auth.currentUser;
  if (!currentUser) {
    console.warn("No authenticated user found, returning empty skills list.");
    return [];
  }
  const q = query(skillsCollection, where("userId", "==", currentUser.uid));
  const snapshot = await getDocs(q);
  const skills = snapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      userId: data.userId,
      name: data.name,
      category: data.category,
      notes: data.notes,
      milestones: data.milestones || [],
      createdAt: data.createdAt as Timestamp,
      updatedAt: data.updatedAt as Timestamp,
    } as Skill;
  });
  return skills;
};

// Update a skill (general properties, not milestones directly here)
export const updateSkillDetails = async (
  id: string,
  dataToUpdate: Partial<
    Omit<Skill, "id" | "createdAt" | "milestones" | "userId">
  >
) => {
  const docRef = doc(db, "skills", id);
  await updateDoc(docRef, {
    ...dataToUpdate,
    updatedAt: Timestamp.now(),
  });
};

// Delete a skill
export const deleteSkill = async (id: string) => {
  const docRef = doc(db, "skills", id);
  await deleteDoc(docRef);
};

// Get a single skill by ID
export const getSkillById = async (id: string): Promise<Skill | null> => {
  const skillDocRef = doc(db, "skills", id);
  const skillSnap = await getDoc(skillDocRef);

  if (skillSnap.exists()) {
    const data = skillSnap.data();

    return {
      id: skillSnap.id,
      userId: data.userId,
      name: data.name,
      category: data.category,
      notes: data.notes,
      milestones: data.milestones || [],
      createdAt: data.createdAt as Timestamp,
      updatedAt: data.updatedAt as Timestamp,
    } as Skill;
  } else {
    console.warn(`Skill with ID ${id} not found.`);
    return null;
  }
};

// --- Milestone Management Functions ---

// Add a milestone to a skill
export const addMilestoneToSkill = async (
  skillId: string,
  milestoneDescription: string
) => {
  const skillRef = doc(db, "skills", skillId);
  const newMilestone: Milestone = {
    id: uuidv4(),
    description: milestoneDescription,
    isCompleted: false,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  };
  await updateDoc(skillRef, {
    milestones: arrayUnion(newMilestone),
    updatedAt: Timestamp.now(),
  });
  return newMilestone.id;
};

// Update a specific milestone within a skill
export const updateMilestoneInSkill = async (
  skillId: string,
  milestoneId: string,
  milestoneUpdates: Partial<Omit<Milestone, "id" | "createdAt">>
) => {
  const skillRef = doc(db, "skills", skillId);
  const skillSnap = await getDoc(skillRef);

  if (skillSnap.exists()) {
    const skill = skillSnap.data() as Skill;
    const milestoneIndex = skill.milestones.findIndex(
      (m) => m.id === milestoneId
    );

    if (milestoneIndex > -1) {
      const updatedMilestones = [...skill.milestones];
      updatedMilestones[milestoneIndex] = {
        ...updatedMilestones[milestoneIndex],
        ...milestoneUpdates,
        updatedAt: Timestamp.now(),
      };
      await updateDoc(skillRef, {
        milestones: updatedMilestones,
        updatedAt: Timestamp.now(),
      });
    } else {
      throw new Error("Milestone not found");
    }
  } else {
    throw new Error("Skill not found");
  }
};

// Toggle a milestone's completion status
export const toggleMilestoneCompletion = async (
  skillId: string,
  milestoneId: string
) => {
  const skillRef = doc(db, "skills", skillId);
  const skillSnap = await getDoc(skillRef);

  if (skillSnap.exists()) {
    const skill = skillSnap.data() as Skill;
    const updatedMilestones = skill.milestones.map((m) =>
      m.id === milestoneId
        ? { ...m, isCompleted: !m.isCompleted, updatedAt: Timestamp.now() }
        : m
    );
    await updateDoc(skillRef, {
      milestones: updatedMilestones,
      updatedAt: Timestamp.now(),
    });
  } else {
    throw new Error("Skill not found for toggling milestone.");
  }
};

// Delete a milestone from a skill
export const deleteMilestoneFromSkill = async (
  skillId: string,
  milestoneId: string
) => {
  const skillRef = doc(db, "skills", skillId);
  const skillSnap = await getDoc(skillRef);

  if (skillSnap.exists()) {
    const skill = skillSnap.data() as Skill;
    const updatedMilestones = skill.milestones.filter(
      (m) => m.id !== milestoneId
    );
    await updateDoc(skillRef, {
      milestones: updatedMilestones,
      updatedAt: Timestamp.now(),
    });
  } else {
    throw new Error("Skill not found for deleting milestone.");
  }
};
