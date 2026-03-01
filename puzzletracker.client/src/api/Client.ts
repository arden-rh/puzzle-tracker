import axios, { type AxiosResponse } from 'axios';
import type { UserPuzzleDto as UserPuzzleDtoFromApi, PuzzleDto as PuzzleDtoFromApi, UserProfileDto } from '../types/dto.types';

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
    currentUserProfile: () => requests.get<UserProfileDto>('/account/profile'),
    login: (email: string, password: string) => requests.post<void>('/account/login', { email, password }),
    logout: () => requests.post<void>('/account/logout', {})
};

const Puzzles = {
    getAll: () => requests.get<PuzzleDtoFromApi[]>('/puzzles'),
    getById: (puzzleId: number) => requests.get<PuzzleDtoFromApi>(`/puzzles/${puzzleId}`)
};

const UserPuzzles = {
    getAll: () => requests.get<UserPuzzleDtoFromApi[]>('/user-puzzles/my-collection'),
    getById: (puzzleId: number) => requests.get<UserPuzzleDtoFromApi>(`/user-puzzles/${puzzleId}`),
    addToCollection: (puzzleId: number) => requests.post(`/user-puzzles/add/${puzzleId}`, {}),
    markAsCompleted: (puzzleId: number) => requests.post(`/user-puzzles/complete/${puzzleId}`, {}),
    create: (puzzle: UserPuzzleDtoFromApi) => requests.post('/user-puzzles', puzzle),
    update: (puzzle: UserPuzzleDtoFromApi) => requests.put(`/user-puzzles/${puzzle.userPuzzleId}`, puzzle),
    delete: (puzzleId: number) => requests.delete(`/user-puzzles/${puzzleId}`)
};

const Illustrators = {
    getAll: () => requests.get<string[]>('/illustrators'),
    getById: (illustratorId: number) => requests.get<string>(`/illustrators/${illustratorId}`)
};

const Brands = {
    getAll: () => requests.get<string[]>('/brands'),
    getById: (brandId: number) => requests.get<string>(`/brands/${brandId}`)
};

const Client = {
    Account,
    Puzzles,
    UserPuzzles,
    Illustrators,
    Brands
};

export default Client;