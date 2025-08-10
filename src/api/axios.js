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
            console.warn('Token expired or invalid. I am logging off...');
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
    return data;
}

export async function getExercise(id) {
    const { data } = await api.get(`/exercises/${id}`);
    return data.data;
}


export async function createExercise(exerciseData) {
    const { data } = await api.post('/exercises', exerciseData);
    return data;
}


export async function updateExercise(id, exerciseData) {
    return api.post(`/exercises/${id}`, exerciseData)
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
    return data.data; // { data: {...} }
}


export async function updatePlan(planId, planData) {
    const { data } = await api.put(`/plans/${planId}`, planData);
    return data;
}


export async function deletePlan(planId) {
    const response = await api.delete(`/plans/${planId}`);
    return response;
}


export async function assignPlan(planId, userIds) {
    const { data } = await api.post(`/plans/${planId}/assign`, {
        user_ids: userIds,
    });
    return data;
}


export async function unassignPlan(planId, userIds) {
    const response = await api.delete(`/plans/${planId}/unassign`, {
        data: { user_ids: userIds }
    });
    return response.data;
}

export async function getPlanHistory(planUserId) {
    const { data } = await api.get(`/plan-user/${planUserId}/history`);
    return data;
}

export async function getAssignedPlans(params = { active: 1 }) {
    const { data } = await api.get('/plan-user', { params });
    return data;
}

export async function getMetrics()      { return (await api.get('/dashboard/metrics')).data; }
export async function getPerformance(d) { return (await api.get('/dashboard/performance', { params:{ days:d } })).data; }
export async function getRecentClients(l=5) { return (await api.get('/dashboard/recent-clients', { params:{ limit:l } })).data; }
export async function getRecentActivity(l=20){ return (await api.get('/dashboard/activity', { params:{ limit:l } })).data; }

export async function updateMyProfile(payload) {
    const { data } = await api.put('/me/profile', payload);
    return data;
}

export async function changeMyPassword(current, newPass, confirm) {
    const { data } = await api.put('/me/password', {
        current_password: current,
        new_password: newPass,
        new_password_confirmation: confirm,
    });
    return data;
}

/* -------------------------------------------------
   PLAN-USER  (lista przypisań, start planu, historia)
---------------------------------------------------*/

/** GET /plan-user         – lista przypisanych planów
 *  – Jeśli trener poda ?user_id=X, backend zwróci plany tego klienta
 *  – params = { active:1|0, user_id: 7 }
 */
export async function fetchPlanUsers(params = {}) {
    const { data } = await api.get('/plan-user', { params });
    return data;                               // AssignedPlanResource[]
}

/** POST /plan-user/{id}/start – rozpocznij plan */
export async function startPlan(planUserId) {
    const { data } = await api.post(`/plan-user/${planUserId}/start`);
    return data;                               // { message: 'Plan started' }
}

/** GET /plan-user/{id} – podstawowe info + progress */
export async function fetchPlanUser(planUserId) {
    const { data } = await api.get(`/plan-user/${planUserId}`);
    return data;                               // PlanUserResource
}

/** GET /plan-user/{id}/history – pełna historia */
export async function fetchPlanUserHistory(planUserId) {
    const { data } = await api.get(`/plan-user/${planUserId}/history`);
    return data;                               // PlanUserHistoryResource
}

/* -------------------------------------------------
   DZIEŃ PLANU  (dzisiejszy lub dowolny)
---------------------------------------------------*/

/** GET /plan-user/{id}/day?date=YYYY-MM-DD
 *    Jeśli date pominięte → dziś
 */
export async function fetchPlanDay(planUserId, date = null) {
    const params = date ? { date } : {};
    const { data } = await api.get(`/plan-user/${planUserId}/day`, { params });
    console.log(data);
    return data;
}

/** POST /plan-user/{id}/day/start  – generuje logi na dziś
 *    body może opcjonalnie zawierać { date:'YYYY-MM-DD' }
 */
export async function startPlanDay(planUserId, date = null) {
    const body = date ? { date } : {};
    const { data } = await api.post(`/plan-user/${planUserId}/day/start`, body);
    return data;                               // zwraca taki sam payload jak fetchPlanDay
}

/** GET /plan-user/{id}/day/summary */
export async function fetchPlanDaySummary(planUserId, date = null) {
    const params = date ? { date } : {};
    const { data } = await api.get(
        `/plan-user/${planUserId}/day/summary`,
        { params }
    );
    return data;                               // { progress, total, done, ... }
}

/* -------------------------------------------------
   LOGI ĆWICZEŃ
---------------------------------------------------*/

/** POST /exercise-logs/{logId}/mark-complete
 *    completed = true by default
 */
export async function markExerciseComplete(logId, completed = true) {
    const { data } = await api.post(
        `/exercise-logs/${logId}/mark-complete`,
        { completed }
    );
    return data;                               // { message, exercise_log }
}

/** POST /exercise-logs/{logId}/report-difficulty (1-5 + komentarz) */
export async function reportExerciseDifficulty(logId, difficulty, comment = '') {
    const { data } = await api.post(
        `/exercise-logs/${logId}/report-difficulty`,
        {
            difficulty_reported: difficulty,
            difficulty_comment: comment,
        }
    );
    return data;                               // { message, exercise_log }
}