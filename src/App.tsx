import { Outlet } from "react-router-dom";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "./firebase";
import { login, logout } from "./components/Redux/authSlice";
import "./App.css";
import Header from "./components/Header/Header";
import Footer from "./components/Footer/Footer";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import NavBar from "./components/NavBar/NavBar";


function App() {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Firebase Auth listener - automatski detektuje prijavljenog korisnika
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Korisnik je prijavljen - učitaj podatke iz Firestore
        try {
          const userDocRef = doc(db, "users", firebaseUser.uid);
          const userDoc = await getDoc(userDocRef);

          if (userDoc.exists()) {
            const userData = userDoc.data();
            dispatch(login({
              email: userData.email || firebaseUser.email || "",
              isAdmin: userData.isAdmin || false,
              name: userData.name,
              number: userData.number,
              phoneNumber: userData.phoneNumber,
              place: userData.place,
              postalCode: userData.postalCode,
              street: userData.street,
              surname: userData.surname,
            }));
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      } else {
        // Korisnik nije prijavljen - očisti Redux state
        dispatch(logout());
      }
      setLoading(false);
    });

    // Cleanup listener kada se komponenta unmount-uje
    return () => unsubscribe();
  }, [dispatch]);

  // Opciono: prikaži loader dok proveravamo auth status
  if (loading) {
    return (
      <div className="container-fluid">
        <Header />
        <NavBar />
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
          <p>Učitavanje...</p>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="container-fluid">
      <Header />
      <NavBar />
      <Outlet />
      <Footer />
      <ToastContainer
        position="top-center"
        autoClose={1500}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        style={{ marginTop: "100px" }}
        limit={1}
      />
    </div>
  );
}

export default App;
