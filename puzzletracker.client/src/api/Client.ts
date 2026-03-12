import axios, { type AxiosResponse } from 'axios';

// DTO imports
import type { Brand } from '../types/dto/brand.types';
import type { Illustrator } from '../types/dto/illustrator.types';
import type { PaginatedResult } from '../types/dto/paginated-result.types';
import type { Series } from '../types/dto/series.types';
import type { UserPuzzle, Puzzle, UserCustomPuzzle } from '../types/dto/puzzle.types';
import type { UserProfile, UpdateUserProfile } from '../types/dto/user-profile.types';

axios.defaults.baseURL = import.meta.env.VITE_API_URL || 'http://localhost:7110/api';

axios.defaults.withCredentials = true;

// Prevent axios from following redirects
axios.defaults.maxRedirects = 0;

// Add response interceptor to handle authentication errors
axios.interceptors.response.use(
    response => response,
    error => {
        // If we get a redirect (307, 301, 302), treat it as 401
        if (error.response?.status === 307 || error.response?.status === 302 || error.response?.status === 301) {
            console.warn('Received redirect instead of proper 401. Treating as unauthorized.');
            error.response.status = 401;
        }
        return Promise.reject(error);
    }
);

const responseBody = <T>(response: AxiosResponse<T>) => response.data;

const requests = {
    get: <T>(url: string) => axios.get<T>(url).then(responseBody),
    post: <T>(url: string, body: {}) => axios.post<T>(url, body).then(responseBody),
    put: <T>(url: string, body: {}) => axios.put<T>(url, body).then(responseBody),
    delete: <T>(url: string) => axios.delete<T>(url).then(responseBody)
};

const Account = {
    currentUserProfile: () => requests.get<UserProfile>('/account/profile'),
    updateUserProfile: (profileData: UpdateUserProfile) => requests.put<UserProfile>('/account/profile/update', profileData),
    updatePassword: (currentPassword: string, newPassword: string, confirmNewPassword: string) => requests.put('/account/change-password', { currentPassword, newPassword, confirmNewPassword }),
    login: (email: string, password: string) => requests.post<void>('/account/login', { email, password }),
    logout: () => requests.post<void>('/account/logout', {}),
    register: (email: string, password: string, confirmPassword: string, displayName?: string) => requests.post<void>('/account/register', { email, password, confirmPassword, displayName })
};

const Puzzles = {
    getAll: (params?: URLSearchParams) => {
        const queryString = params ? `?${params.toString()}` : '';
        return requests.get<PaginatedResult<Puzzle>>(`/puzzles${queryString}`);
    },
    getById: (puzzleId: number) => requests.get<Puzzle>(`/puzzles/${puzzleId}`)
};

const UserPuzzles = {
    getAll: (params?: URLSearchParams) => {
        const queryString = params ? `?${params.toString()}` : '';
        return requests.get<PaginatedResult<UserPuzzle>>(`/user-puzzles/my-collection${queryString}`);
    },
    getById: (puzzleId: number) => requests.get<UserPuzzle>(`/user-puzzles/my-collection/${puzzleId}`),
    isInCollection: (puzzleId: number) => requests.get<boolean>(`/user-puzzles/check/${puzzleId}`),
    addToCollection: (puzzleId: number) => requests.post(`/user-puzzles/add/${puzzleId}`, {}),
    markAsCompleted: (puzzleId: number) => requests.post(`/user-puzzles/complete/${puzzleId}`, {}),
    markAsIncomplete: (puzzleId: number) => requests.post(`/user-puzzles/incomplete/${puzzleId}`, {}),
    toggleOwned: (puzzleId: number) => requests.post(`/user-puzzles/toggle-owned/${puzzleId}`, {}),
    update: (puzzleId: number, updates: Partial<UserPuzzle>) => requests.put(`/user-puzzles/update/${puzzleId}`, updates),
    createCustom: (puzzle: UserCustomPuzzle) => requests.post('/user-puzzles/custom/create', puzzle),
    editCustom: (puzzleId: number, puzzle: UserCustomPuzzle) => requests.post(`/user-puzzles/custom/edit/${puzzleId}`, puzzle),
    deleteCustom: (puzzleId: number) => requests.delete(`/user-puzzles/custom/delete/${puzzleId}`),
    remove: (puzzleId: number) => requests.delete(`/user-puzzles/remove/${puzzleId}`)
};

const Illustrators = {
    getAll: () => requests.get<Illustrator[]>('/illustrators'),
    getById: (illustratorId: number) => requests.get<Illustrator>(`/illustrators/${illustratorId}`)
};

const Brands = {
    getAll: () => requests.get<Brand[]>('/brands'),
    getById: (brandId: number) => requests.get<Brand>(`/brands/${brandId}`)
};

const Series = {
    getAll: () => requests.get<Series[]>('/series'),
    getById: (seriesId: number) => requests.get<Series>(`/series/${seriesId}`)
};

const Client = {
    Account,
    Puzzles,
    UserPuzzles,
    Illustrators,
    Brands,
    Series
};

export default Client;