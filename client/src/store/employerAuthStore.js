import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useEmployerAuthStore = create(
    persist(
        (set) => ({
            employer: null,
            employerToken: null,

            setEmployerAuth: (employer, token) => set({ employer, employerToken: token }),

            updateEmployer: (data) => set((state) => ({
                employer: { ...state.employer, ...data }
            })),

            employerLogout: () => set({ employer: null, employerToken: null }),
        }),
        { name: 'jobvault-employer-auth' }
    )
);

export default useEmployerAuthStore;
