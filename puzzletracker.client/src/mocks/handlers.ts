import { http, HttpResponse } from 'msw';
import { mockProfile, mockPuzzles, mockUserPuzzles } from './data';
import type { UserPuzzle } from '../types/dto/puzzle.types';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:7110/api';

// Mutable in-memory store so mutations reflect during the session
let userPuzzles = [...mockUserPuzzles];

export const handlers = [
    // ── Account ───────────────────────────────────────────────────────────────
    http.get(`${BASE_URL}/account/profile`, () => {
        return HttpResponse.json(mockProfile);
    }),

    http.post(`${BASE_URL}/account/login`, () => {
        return new HttpResponse(null, { status: 200 });
    }),

    http.post(`${BASE_URL}/account/logout`, () => {
        return new HttpResponse(null, { status: 200 });
    }),

    // ── Puzzles ───────────────────────────────────────────────────────────────
    http.get(`${BASE_URL}/puzzles`, () => {
        return HttpResponse.json(mockPuzzles);
    }),

    http.get(`${BASE_URL}/puzzles/:puzzleId`, ({ params }) => {
        const puzzle = mockPuzzles.find(p => p.id === Number(params.puzzleId));
        if (!puzzle) return new HttpResponse(null, { status: 404 });
        return HttpResponse.json(puzzle);
    }),

    // ── UserPuzzles ───────────────────────────────────────────────────────────
    http.get(`${BASE_URL}/user-puzzles/my-collection`, () => {
        return HttpResponse.json(userPuzzles);
    }),

    http.get(`${BASE_URL}/user-puzzles/:puzzleId`, ({ params }) => {
        const up = userPuzzles.find(p => p.userPuzzleId === Number(params.puzzleId));
        if (!up) return new HttpResponse(null, { status: 404 });
        return HttpResponse.json(up);
    }),

    http.post(`${BASE_URL}/user-puzzles/add/:puzzleId`, ({ params }) => {
        const puzzleId = Number(params.puzzleId);
        const source = mockPuzzles.find(p => p.id === puzzleId);
        if (!source) return new HttpResponse(null, { status: 404 });

        const newEntry: UserPuzzle = {
            ...source,
            userPuzzleId: Date.now(),
            isOwned: true,
            isCompleted: false,
            timesCompleted: 0,
            isInUserCollection: true,
        };
        userPuzzles = [...userPuzzles, newEntry];
        return HttpResponse.json(newEntry, { status: 201 });
    }),

    http.post(`${BASE_URL}/user-puzzles/complete/:puzzleId`, ({ params }) => {
        const puzzleId = Number(params.puzzleId);
        userPuzzles = userPuzzles.map(p =>
            p.id === puzzleId
                ? { ...p, isCompleted: true, timesCompleted: p.timesCompleted + 1, lastCompletedDate: new Date().toISOString() }
                : p
        );
        return new HttpResponse(null, { status: 200 });
    }),

    http.post(`${BASE_URL}/user-puzzles`, async ({ request }) => {
        const body = (await request.json()) as UserPuzzle;
        const newEntry: UserPuzzle = { ...body, userPuzzleId: Date.now() };
        userPuzzles = [...userPuzzles, newEntry];
        return HttpResponse.json(newEntry, { status: 201 });
    }),

    http.put(`${BASE_URL}/user-puzzles/:puzzleId`, async ({ params, request }) => {
        const body = (await request.json()) as UserPuzzle;
        userPuzzles = userPuzzles.map(p =>
            p.userPuzzleId === Number(params.puzzleId) ? { ...p, ...body } : p
        );
        return HttpResponse.json(body);
    }),

    http.delete(`${BASE_URL}/user-puzzles/:puzzleId`, ({ params }) => {
        userPuzzles = userPuzzles.filter(p => p.userPuzzleId !== Number(params.puzzleId));
        return new HttpResponse(null, { status: 204 });
    }),
];
