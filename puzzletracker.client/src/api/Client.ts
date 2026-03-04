import axios, { type AxiosResponse } from 'axios';
import type { UserPuzzle, Puzzle, UserProfile, Series, Brand, Illustrator } from '../types/dto.types';

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
    login: (email: string, password: string) => requests.post<void>('/account/login', { email, password }),
    logout: () => requests.post<void>('/account/logout', {})
};

const Puzzles = {
    getAll: (params?: URLSearchParams) => {
        const queryString = params ? `?${params.toString()}` : '';
        return requests.get<Puzzle[]>(`/puzzles${queryString}`);
    },
    getById: (puzzleId: number) => requests.get<Puzzle>(`/puzzles/${puzzleId}`)
};

const UserPuzzles = {
    getAll: () => requests.get<UserPuzzle[]>('/user-puzzles/my-collection'),
    getById: (puzzleId: number) => requests.get<UserPuzzle>(`/user-puzzles/${puzzleId}`),
    addToCollection: (puzzleId: number) => requests.post(`/user-puzzles/add/${puzzleId}`, {}),
    markAsCompleted: (puzzleId: number) => requests.post(`/user-puzzles/complete/${puzzleId}`, {}),
    create: (puzzle: UserPuzzle) => requests.post('/user-puzzles', puzzle),
    update: (puzzle: UserPuzzle) => requests.put(`/user-puzzles/${puzzle.userPuzzleId}`, puzzle),
    delete: (puzzleId: number) => requests.delete(`/user-puzzles/${puzzleId}`)
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