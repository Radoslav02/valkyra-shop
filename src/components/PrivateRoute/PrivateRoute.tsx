// src/components/PrivateRoute/PrivateRoute.tsx
import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import type { FC, ReactNode } from 'react';
import type { RootState } from '../Redux/store';


interface PrivateRouteProps {
  children: ReactNode;
  adminOnly?: boolean;
}

const PrivateRoute: FC<PrivateRouteProps> = ({ children, adminOnly }) => {
  const user = useSelector((state: RootState) => state.auth.user);
  const location = useLocation();
  const isAdmin = user?.isAdmin || false; // Pretpostavka da `isAdmin` postoji u `user` objektu

  if (!user) {
    // Ako korisnik nije prijavljen, preusmeri na login
    return <Navigate to="/prijava" state={{ from: location }} replace />;
  }

  if (adminOnly && !isAdmin) {
    // Ako je ruta za admin, ali korisnik nije admin, preusmeri na početnu
    return <Navigate to="/početna" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

export default PrivateRoute;
