import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import Home from '../pages/Home';
import Login from '../pages/Auth/Login';
import Register from '../pages/Auth/Register';

import TrainerLayout from '../pages/Trainer/TrainerLayout';
import TrainerDashboard from '../pages/Trainer/TrainerDashboard';
import ExercisesList from '../pages/Trainer/ExercisesList';
import ExerciseForm from '../pages/Trainer/ExercisesForm';
import ClientsList from '../pages/Trainer/ClientsList';
import ClientForm from '../pages/Trainer/ClientsForm';
import PlansList from '../pages/Trainer/PlansList';
import PlanForm from '../pages/Trainer/PlanForm';
import ClientPlanHistory from '../pages/Trainer/ClientPlanHistory';
import Settings from '../pages/Auth/Settings';

// import ClientLayout from '../pages/Client/ClientLayout';
// import ClientDashboard from '../pages/Client/ClientDashboard';
// import TodayWorkout from '../pages/Client/TodayWorkout';
// import History from '../pages/Client/History';

import PublicRoute from './PublicRoute';
import ProtectedRoute from './ProtectedRoute';
import ClientDashboard from "@/pages/Client/ClientDashboard.jsx";
import ClientPlans from "@/pages/Client/ClientPlans.jsx";
import PlanDetails from "@/pages/Client/Workout.jsx";
import Workout from "@/pages/Client/Workout.jsx";
import ClientLayout from "@/pages/Client/ClientLayout.jsx";

function ClientSettings() {
    return null;
}

function AppRouter() {
    return (
        <BrowserRouter>
            <Routes>
                {/* PUBLIC */}
                <Route path="/" element={<PublicRoute><Home/></PublicRoute>} />
                <Route path="/login" element={<PublicRoute><Login/></PublicRoute>} />
                <Route path="/register" element={<PublicRoute><Register/></PublicRoute>} />

                {/* TRAINER */}
                <Route path="/trainer" element={<ProtectedRoute><TrainerLayout/></ProtectedRoute>}>
                    <Route index element={<TrainerDashboard />} />
                    <Route path="exercises" element={<ExercisesList />} />
                    <Route path="exercises/add" element={<ExerciseForm />} />
                    <Route path="exercises/add/:id" element={<ExerciseForm />} />

                    <Route path="clients" element={<ClientsList />} />
                    <Route path="clients/add" element={<ClientForm />} />
                    <Route path="clients/add/:id" element={<ClientForm />} />
                    <Route path="clients/history/:clientId" element={<ClientPlanHistory />} />

                    <Route path="plans" element={<PlansList />} />
                    <Route path="plans/add" element={<PlanForm />} />
                    <Route path="plans/add/:id" element={<PlanForm />} />

                    <Route path="settings" element={<Settings />} />
                </Route>

                {/* CLIENT */}
                <Route
                    path="/client"
                    element={
                        <ProtectedRoute>
                            <ClientLayout />
                        </ProtectedRoute>
                    }
                >
                    <Route index element={<ClientDashboard />} />
                    <Route path="plans" element={<ClientPlans />} />
                    <Route path="plan-details/:planId" element={<PlanDetails />} />
                    <Route path="workout/:planId" element={<Workout />} />
                    <Route path="history" element={<History />} />
                    <Route path="settings" element={<ClientSettings />} />
                </Route>

                {/* 404 */}
                <Route path="*" element={<div>404 - Not Found</div>} />
            </Routes>
        </BrowserRouter>
    );
}

export default AppRouter;
