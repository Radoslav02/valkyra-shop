import { collection, doc, setDoc } from "firebase/firestore";
import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
} from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "./Register.css";
import { useState } from "react";
import { ScaleLoader } from "react-spinners"; // Example loader
import { auth, db } from "../../firebase";
import { type SubmitHandler, useForm } from "react-hook-form";
import { Checkbox } from "@mui/material";
import TermsModal from "../Modals/TermsModal";

interface FormData {
  name: string;
  surname: string;
  email: string;
  password: string;
  place: string;
  postalCode: string;
  street: string;
  number: string;
  phoneNumber: string;
}

const RegisterForm = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>();
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setModalOpen] = useState(false);
  const [isTermsAccepted, setIsTermsAccepted] = useState(false);

  const onSubmit: SubmitHandler<FormData> = async (data) => {
    setIsLoading(true);

    try {
      if (!isTermsAccepted) {
        toast.error(
          "Morate prihvatiti uslove korišćenja pre nego što nastavite."
        );
        return;
      }

      const userCredential = await createUserWithEmailAndPassword(
        auth,
        data.email,
        data.password
      );
      const user = userCredential.user;

      await sendEmailVerification(user);

      await setDoc(doc(collection(db, "users"), user.uid), {
        name: data.name,
        surname: data.surname,
        email: data.email,
        place: data.place,
        postalCode: data.postalCode,
        street: data.street,
        number: data.number,
        phoneNumber: data.phoneNumber,
        isAdmin: false,
      });

      toast.success(
        "Na Vaš email smo poslali link za verifikaciju. Proverite SPAM folder!"
      );
      navigate("/prijava");
    } catch (error) {
      if (error instanceof Error) {
        toast.error(`Registracija neuspešna: ${error.message}`);
      } else {
        toast.error("Desila se greška. Molimo vas pokušajte ponovo!");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleModalOpen = () => setModalOpen(true);
  const handleModalClose = () => setModalOpen(false);

  const handleCheckboxChange = () => {
    setIsTermsAccepted((prev) => !prev); // Toggle the checkbox state
  };

  return (
    <div className="register-container">
      <form className="register-form" onSubmit={handleSubmit(onSubmit)}>
        <h2 className="register-title">Registracija</h2>

        {/** If loading, show a spinner or message **/}
        {isLoading && (
          <div className="register-loader">
            <ScaleLoader color="#e7cfb4" />
            <p>Obrađujem podatke...</p>
          </div>
        )}

        <div className="inputs-wrapper">
          <div className="register-row">
            <div className="register-input-wrapper">
              <label htmlFor="name">Ime</label>
              <input
                id="name"
                className="register-input"
                {...register("name", { required: true })}
                placeholder="Unesite ime"
                disabled={isLoading}
              />
              {errors.name && (
                <span className="error">Ovo polje je obavezno</span>
              )}
            </div>
            <div className="register-input-wrapper">
              <label htmlFor="surname">Prezime</label>
              <input
                id="surname"
                className="register-input"
                {...register("surname", { required: true })}
                placeholder="Unesite prezime"
                disabled={isLoading}
              />
              {errors.surname && (
                <span className="error">Ovo polje je obavezno</span>
              )}
            </div>
          </div>

          <div className="register-row">
            <div className="register-input-wrapper">
              <label htmlFor="email">E-mail</label>
              <input
                id="email"
                type="email"
                className="register-input"
                {...register("email", { required: true })}
                placeholder="example@domain.com"
                disabled={isLoading}
              />
              {errors.email && (
                <span className="error">Ovo polje je obavezno</span>
              )}
            </div>
            <div className="register-input-wrapper">
              <label htmlFor="password">Šifra</label>
              <input
                id="password"
                type="password"
                className="register-input"
                {...register("password", { required: true })}
                placeholder="Unesite lozinku"
                disabled={isLoading}
              />
              {errors.password && (
                <span className="error">Ovo polje je obavezno</span>
              )}
            </div>
          </div>

          <div className="register-row">
            <div className="register-input-wrapper">
              <label htmlFor="place">Mesto stanovanja</label>
              <input
                id="place"
                className="register-input"
                {...register("place", { required: true })}
                placeholder="Vaše mesto stanovanja"
                disabled={isLoading}
              />
              {errors.place && (
                <span className="error">Ovo polje je obavezno</span>
              )}
            </div>
            <div className="register-input-wrapper">
              <label htmlFor="postalCode">Poštanski broj</label>
              <input
                id="postalCode"
                className="register-input"
                {...register("postalCode", { required: true })}
                placeholder="11000"
                disabled={isLoading}
              />
              {errors.postalCode && (
                <span className="error">Ovo polje je obavezno</span>
              )}
            </div>
          </div>

          <div className="register-row">
            <div className="register-input-wrapper">
              <label htmlFor="street">Ulica</label>
              <input
                id="street"
                className="register-input"
                {...register("street", { required: true })}
                placeholder="Ulica"
                disabled={isLoading}
              />
              {errors.street && (
                <span className="error">Ovo polje je obavezno</span>
              )}
            </div>
            <div className="register-input-wrapper">
              <label htmlFor="number">Broj kuće/zgrade</label>
              <input
                id="number"
                className="register-input"
                {...register("number", { required: true })}
                placeholder="123"
                disabled={isLoading}
              />
              {errors.number && (
                <span className="error">Ovo polje je obavezno</span>
              )}
            </div>
          </div>

          <div className="register-row">
            <div className="register-input-wrapper">
              <label htmlFor="phoneNumber">Broj telefona</label>
              <input
                id="phoneNumber"
                className="register-input"
                {...register("phoneNumber", { required: true })}
                placeholder="06x/xxxx-xxx"
                disabled={isLoading}
              />
              {errors.phoneNumber && (
                <span className="error">Ovo polje je obavezno</span>
              )}
            </div>
          </div>
        </div>

        <div className="terms-checkbox-container">
          <Checkbox
            id="termsCheckbox"
            checked={isTermsAccepted}
            onChange={handleCheckboxChange}
          />
          <label htmlFor="termsCheckbox" onClick={handleModalOpen}>
            Prihvatam uslove korišćenja
          </label>
        </div>

        <button
          className="register-page-button"
          type="submit"
          disabled={isLoading}
        >
          {isLoading ? "Registrujem..." : "Registruj se"}
        </button>
      </form>

      {/* Terms Modal */}
      <TermsModal isOpen={isModalOpen} close={handleModalClose} />
    </div>
  );
};

export default RegisterForm;
