import { create } from 'zustand';
import {
    createProject as createProjectInDb,
    deleteProjectById as deleteProjectFromDb,
    listProjects,
    listScreensByProjectId,
    updateProjectById as updateProjectInDb,
    type ProjectListItem,
} from '@/data/componentFileRepository';
import type { ComponentFileListItem } from '@/data/componentFileRepository';

interface ProjectStore {
    projects: ProjectListItem[];
    selectedProjectId: number | null;
    currentScreens: ComponentFileListItem[];
    isLoading: boolean;

    loadProjects: () => Promise<void>;
    selectProject: (id: number | null) => Promise<void>;
    createProject: (name: string) => Promise<number | null>;
    renameProject: (id: number, name: string) => Promise<void>;
    deleteProject: (id: number) => Promise<void>;
}

export const useProjectStore = create<ProjectStore>((set, get) => ({
    projects: [],
    selectedProjectId: null,
    currentScreens: [],
    isLoading: true,

    loadProjects: async () => {
        set({ isLoading: true });
        try {
            const projects = await listProjects();
            set({ projects });
        } catch (error) {
            console.error('Failed to load projects:', error);
        } finally {
            set({ isLoading: false });
        }
    },

    selectProject: async (id) => {
        set({ selectedProjectId: id });
        if (id === null) {
            set({ currentScreens: [] });
            return;
        }
        try {
            const screens = await listScreensByProjectId(id);
            set({ currentScreens: screens });
        } catch (error) {
            console.error('Failed to load screens:', error);
        }
    },

    createProject: async (name) => {
        try {
            const id = await createProjectInDb(name);
            await get().loadProjects();
            return id;
        } catch (error) {
            console.error('Failed to create project:', error);
            return null;
        }
    },

    renameProject: async (id, name) => {
        try {
            await updateProjectInDb(id, name);
            await get().loadProjects();
        } catch (error) {
            console.error('Failed to rename project:', error);
        }
    },

    deleteProject: async (id) => {
        try {
            await deleteProjectFromDb(id);
            if (get().selectedProjectId === id) {
                set({ selectedProjectId: null, currentScreens: [] });
            }
            await get().loadProjects();
        } catch (error) {
            console.error('Failed to delete project:', error);
        }
    },
}));
