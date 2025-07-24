import { createHashRouter } from "react-router-dom";
import App from "./App";

import LoginPage from "./components/LogIn/LogIn";
import RegisterForm from "./components/Register/Register";
import PrivateRoute from "./components/PrivateRoute/PrivateRoute";
import ProfilePage from "./components/UserProfile/ProfilePage";
import AdminPanel from "./components/AdminPanel/AdminPanel";
import Cart from "./components/Cart/Cart";
import Confirmation from "./components/Confirmation/Confirmation";
import SubCategoryPage from "./components/SubCategory/SubCategory";
import ItemDetails from "./components/ItemDetails/ItemDetails";
import HomePage from "./components/Home/Home";
import Order from "./components/Order/Order";
import CustomerInfo from "./components/CustomerInfo/CustomerInfo";

export const router = createHashRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        path: "/početna",
        element: <HomePage />,
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
        ),
      },
      {
        path: "/admin/panel",
        element: (
          <PrivateRoute adminOnly>
            <AdminPanel />
          </PrivateRoute>
        ),
      },
      {
        path: "/korpa",
        element: <Cart />,
      },
      {
        path: "/potvrda",
        element: <Confirmation />,
      },
      {
        path: "/podkategorija/:subCategory",
        element: <SubCategoryPage />,
      },
      {
        path: "/proizvod/:productId",
        element: <ItemDetails />,
      },
      {
        path: "/poručivanje",
        element: <Order />,
      },
      {
        path: "/podaci",
        element: <CustomerInfo />,
      },
    ],
  },
]);
