import { createAction, props } from '@ngrx/store';

export const toggleSidebar = createAction('[UI] Toggle Sidebar');
export const setDarkMode = createAction('[UI] Set Dark Mode', props<{ isDark: boolean }>());
export const setLoading = createAction('[UI] Set Loading', props<{ isLoading: boolean }>());
