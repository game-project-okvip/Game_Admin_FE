import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "../pages/Login";
import UserManagement from "../pages/UserManagement";
import IPManagement from "../pages/IPManagement";
import PlayerManagement from "../pages/PlayerManagement";
import PlayerHistory from "../pages/PlayerHistory";
import ProtectedRoute from "../components/ProtectedRoute";

const AppRoutes: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            localStorage.getItem("token") ? (
              <Navigate to="/players" />
            ) : (
              <Navigate to="/login" />
            )
          }
        />

        <Route path="/login" element={<Login />} />
        <Route
          path="/players"
          element={
            <ProtectedRoute>
              <PlayerManagement />
            </ProtectedRoute>
          }
        />
        <Route
          path="/playhistory"
          element={
            <ProtectedRoute>
              <PlayerHistory />
            </ProtectedRoute>
          }
        />
        <Route
          path="/users"
          element={
            <ProtectedRoute>
              <UserManagement />
            </ProtectedRoute>
          }
        />
        <Route
          path="/ips"
          element={
            <ProtectedRoute>
              <IPManagement />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;
