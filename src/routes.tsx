import { createHashRouter } from "react-router-dom";
import App from "./App";
import Home from "./components/Home/Home";
import LoginPage from "./components/LogIn/LogIn";
import RegisterForm from "./components/Register/Register";
import PrivateRoute from "./components/PrivateRoute/PrivateRoute";
import ProfilePage from "./components/UserProfile/ProfilePage";
import AdminPanel from "./components/AdminPanel/AdminPanel";


export const router = createHashRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        path: "/početna",
        element: <Home />,
      },
       {
        path: "/prijava",
        element: <LoginPage />,
      },
      {
        path: "/registracija",
        element: <RegisterForm />,
      },
        {
        path: "/profil",
        element: (
          <PrivateRoute>
            <ProfilePage />
          </PrivateRoute>
        )
      },
        {
        path: "/admin/panel",
        element: (
          <PrivateRoute adminOnly>
            <AdminPanel />
          </PrivateRoute>
        ),
      },
    ],
  },
]);
