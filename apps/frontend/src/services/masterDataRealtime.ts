import { onValue, push, ref, remove, set, update } from "firebase/database";
import { database } from "../lib/firebase.js";
import { Classroom, Department } from "../types.js";

interface DepartmentInput {
  name: string;
  code: string;
}

interface ClassroomInput {
  buildingName: string;
  roomNumber: string;
  capacity: number;
  facilities?: string;
}

const departmentsRef = ref(database, "masterData/departments");
const classroomsRef = ref(database, "masterData/classrooms");

const mapDepartmentSnapshot = (value: Record<string, Omit<Department, "id">> | null): Department[] => {
  if (!value) {
    return [];
  }

  return Object.entries(value).map(([id, data]) => ({ id, ...data }));
};

const mapClassroomSnapshot = (value: Record<string, Omit<Classroom, "id">> | null): Classroom[] => {
  if (!value) {
    return [];
  }

  return Object.entries(value).map(([id, data]) => ({ id, ...data }));
};

export const subscribeDepartments = (callback: (departments: Department[]) => void): (() => void) => {
  return onValue(departmentsRef, (snapshot) => {
    callback(mapDepartmentSnapshot(snapshot.val()));
  });
};

export const addDepartment = async (payload: DepartmentInput): Promise<void> => {
  const newRef = push(departmentsRef);
  await set(newRef, payload);
};

export const updateDepartment = async (id: string, payload: Partial<DepartmentInput>): Promise<void> => {
  await update(ref(database, `masterData/departments/${id}`), payload);
};

export const deleteDepartment = async (id: string): Promise<void> => {
  await remove(ref(database, `masterData/departments/${id}`));
};

export const subscribeClassrooms = (callback: (classrooms: Classroom[]) => void): (() => void) => {
  return onValue(classroomsRef, (snapshot) => {
    callback(mapClassroomSnapshot(snapshot.val()));
  });
};

export const addClassroom = async (payload: ClassroomInput): Promise<void> => {
  const newRef = push(classroomsRef);
  await set(newRef, payload);
};

export const updateClassroom = async (id: string, payload: Partial<ClassroomInput>): Promise<void> => {
  await update(ref(database, `masterData/classrooms/${id}`), payload);
};

export const deleteClassroom = async (id: string): Promise<void> => {
  await remove(ref(database, `masterData/classrooms/${id}`));
};