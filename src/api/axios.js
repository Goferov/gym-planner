import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

export const api = axios.create({
    baseURL: `${API_URL}/api`,
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            console.warn('Token wygasł lub niepoprawny. Wylogowuję...');
            localStorage.removeItem('token');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export async function login(email, password) {
    const { data } = await api.post('/login', { email, password });
    localStorage.setItem('token', data.token);
    return data;
}

export async function logoutApi() {
    const { data } = await api.post('/logout');
    return data;
}

export async function registerTrainer(name, email, password, passwordConfirmation) {
    const { data } = await api.post('/register', {
        name,
        email,
        password,
        password_confirmation: passwordConfirmation,
        role: 'trainer',
    });
    return data;
}

export async function getMe() {
    const { data } = await api.get('/getUser');
    return data;
}

export async function getExercises(params = {}) {
    const { data } = await api.get('/exercises', { params });
    return data; // Array obiektów Exercise
}

export async function getExercise(id) {
    const { data } = await api.get(`/exercises/${id}`);
    return data.data; // Pojedynczy obiekt z polami {id, name, ... muscleGroups ...}
}


export async function createExercise(exerciseData) {
    const { data } = await api.post('/exercises', exerciseData);
    return data; // Zwraca utworzone ćwiczenie
}


export async function updateExercise(id, exerciseData) {
    const { data } = await api.put(`/exercises/${id}`, exerciseData);
    return data; // Zwraca zaktualizowany obiekt
}


export async function deleteExercise(id) {
    return await api.delete(`/exercises/${id}`);
}

export async function muscleGroups() {
    return await api.get(`/muscle-groups`);
}

// ========== Clients endpoints ==========


export async function getClients() {
    // W "ClientController@index" zwraca collection: data: [...]
    const { data } = await api.get('/clients');
    return data; // np. { data: [ {id, name, email, role, trainer_id}, ... ] }
}


export async function createClient(clientData) {
    const { data } = await api.post('/clients', clientData);
    return data;
}


export async function getClient(clientId) {
    const { data } = await api.get(`/clients/${clientId}`);
    return data; // np. { data: {...} }
}


export async function updateClient(clientId, clientData) {
    const { data } = await api.put(`/clients/${clientId}`, clientData);
    return data; // np. { data: {...} }
}


export async function deleteClient(clientId) {
    return await api.delete(`/clients/${clientId}`); // {status: 204, ...}
}

// ========== PLANS endpoints ==========

export async function getPlans() {
    const { data } = await api.get('/plans');
    return data;
}

/**
 *
 * @param {Object} planData
 *    {
 *      name: string,
 *      description?: string,
 *      duration_weeks?: number,
 *      plan_days: [
 *        {
 *          week_number: number,
 *          day_number: number,
 *          description?: string,
 *          exercises: [
 *            {
 *              exercise_id: number,
 *              sets?: number,
 *              reps?: number,
 *              rest_time?: number,
 *              tempo?: string,
 *              notes?: string
 *            },
 *            ...
 *          ]
 *        },
 *        ...
 *      ]
 *    }
 *
 */
export async function createPlan(planData) {
    const { data } = await api.post('/plans', planData);
    return data;
}

export async function getPlan(planId) {
    const { data } = await api.get(`/plans/${planId}`);
    return data; // { data: {...} }
}

/**
 * Aktualizuje istniejący plan (PUT /plans/:id).
 * planData musi zawierać name, duration_weeks, plan_days (pełny stan).
 * Zwraca zaktualizowany plan.
 */
export async function updatePlan(planId, planData) {
    const { data } = await api.put(`/plans/${planId}`, planData);
    return data;
}

/**
 * Usuwa plan (DELETE /plans/:id).
 * Zwraca status 204 (no content) przy sukcesie.
 */
export async function deletePlan(planId) {
    const response = await api.delete(`/plans/${planId}`);
    return response; // {status: 204,...}
}

/**
 * Przypisuje plan do wielu użytkowników (POST /plans/:id/assign).
 * body:
 *  {
 *    user_ids: number[];
 *  }
 * Zwraca { message: "Plan assigned to users successfully" } (status 201).
 */
export async function assignPlan(planId, userIds) {
    const { data } = await api.post(`/plans/${planId}/assign`, {
        user_ids: userIds,
    });
    return data;
}

/**
 * Usuwa przypisanie planu u wskazanych userów (DELETE /plans/:id/unassign).
 * W laravel unassignPlan przyjmuje tablicę user_ids w body.
 * Również plan-> clients()->updateExistingPivot(... active: false).
 * Zwraca { message: "..."} status 200
 *
 * UWAGA: w axios, by dodać body do DELETE, używamy:
 *   { data: { user_ids: [ ... ] } }
 */
export async function unassignPlan(planId, userIds) {
    // w laravel definicja: DELETE /plans/{plan}/unassign, w body user_ids
    const response = await api.delete(`/plans/${planId}/unassign`, {
        data: { user_ids: userIds }
    });
    return response.data; // np. {message: "..."} status 200
}