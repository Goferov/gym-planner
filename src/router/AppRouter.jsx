// src/router/AppRouter.jsx
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import Home from '../pages/Home';
import Login from '../pages/Auth/Login';
import Register from '../pages/Auth/Register';

import TrainerLayout from '../pages/Trainer/TrainerLayout';
import TrainerDashboard from '../pages/Trainer/TrainerDashboard';
import ExercisesList from '../pages/Trainer/ExercisesList';

import PublicRoute from './PublicRoute';
import ProtectedRoute from './ProtectedRoute';
import ExerciseForm from "@/pages/Trainer/ExercisesForm.jsx";
import ClientsList from "@/pages/Trainer/ClientsList.jsx";
import ClientForm from "@/pages/Trainer/ClientsForm.jsx";

function AppRouter() {
    return (
        <BrowserRouter>
            <Routes>
                <Route
                    path="/"
                    element={
                        <PublicRoute>
                            <Home />
                        </PublicRoute>
                    }
                />
                <Route
                    path="/login"
                    element={
                        <PublicRoute>
                            <Login />
                        </PublicRoute>
                    }
                />
                <Route
                    path="/register"
                    element={
                        <PublicRoute>
                            <Register />
                        </PublicRoute>
                    }
                />

                <Route
                    path="/trainer"
                    element={
                        <ProtectedRoute>
                            <TrainerLayout />
                        </ProtectedRoute>
                    }
                >
                    <Route index element={<TrainerDashboard />} />
                    <Route path="exercises" element={<ExercisesList />} />
                    <Route path="exercises/add" element={<ExerciseForm />} />
                    <Route path="exercises/add/:id" element={<ExerciseForm />} />

                    <Route path="clients" element={<ClientsList />} />
                    <Route path="clients/add" element={<ClientForm />} />
                    <Route path="clients/add/:id" element={<ClientForm />} />
                </Route>

                <Route path="*" element={<div>404 - Not Found</div>} />
            </Routes>
        </BrowserRouter>
    );
}

export default AppRouter;
