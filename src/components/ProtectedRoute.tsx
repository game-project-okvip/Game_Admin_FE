import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isValid, setIsValid] = useState<boolean | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setIsValid(false);
      return;
    }

    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      const isExpired = payload.exp * 1000 < Date.now();
      if (isExpired) {
        localStorage.removeItem("token");
        localStorage.removeItem("role");
        setIsValid(false);
      } else {
        setIsValid(true);
      }
    } catch (err) {
      setIsValid(false);
    }
  }, []);

  if (isValid === null) return null;
  if (!isValid) return <Navigate to="/login" />;
  return <>{children}</>;
};

export default ProtectedRoute;
