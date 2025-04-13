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