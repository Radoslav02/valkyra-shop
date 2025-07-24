import { ScaleLoader } from "react-spinners";
import "./CustomerInfo.css";
import { toast } from "react-toastify";
import { useForm, type SubmitHandler } from "react-hook-form";
import { useNavigate, useLocation } from "react-router-dom";
import { useState } from "react";
import Checkbox from "@mui/material/Checkbox";
import TermsModal from "../Modals/TermsModal";


interface FormData {
  name: string;
  surname: string;
  email: string;
  place: string;
  postalCode: string;
  street: string;
  number: string;
  phoneNumber: string;
}

export default function CustomerInfo() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>();

  const navigate = useNavigate();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setModalOpen] = useState(false);
  const [isTermsAccepted, setIsTermsAccepted] = useState(false);

  const total = location.state?.total || 0;

  const onSubmit: SubmitHandler<FormData> = async (data) => {
    setIsLoading(true);

    try {
      if (!isTermsAccepted) {
        toast.error(
          "Morate prihvatiti uslove korišćenja pre nego što nastavite."
        );
        return;
      }

      const orderDetails = {
        customer: data,
        total,
      };

      navigate("/poručivanje", { state: orderDetails });
    } catch (error) {
      toast.error("Desila se greška. Pokušajte ponovo.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="customer-info-container">
      <form className="customer-info-form" onSubmit={handleSubmit(onSubmit)}>
        <h2 className="customer-info-title">Podaci za porudžbinu</h2>

        {isLoading && (
          <div className="customer-info-loader">
            <ScaleLoader color="#e7cfb4" />
            <p>Obrađujem podatke...</p>
          </div>
        )}

        <div className="customer-info-inputs">
          <div className="customer-info-row">
            <div className="customer-info-input-wrapper">
              <label htmlFor="name">Ime</label>
              <input
                id="name"
                {...register("name", { required: true })}
                placeholder="Unesite ime"
                disabled={isLoading}
              />
              {errors.name && (
                <span className="error">Ovo polje je obavezno</span>
              )}
            </div>
            <div className="customer-info-input-wrapper">
              <label htmlFor="surname">Prezime</label>
              <input
                id="surname"
                {...register("surname", { required: true })}
                placeholder="Unesite prezime"
                disabled={isLoading}
              />
              {errors.surname && (
                <span className="error">Ovo polje je obavezno</span>
              )}
            </div>
          </div>

          <div className="customer-info-row">
            <div className="customer-info-input-wrapper">
              <label htmlFor="email">E-mail</label>
              <input
                id="email"
                type="email"
                {...register("email", { required: true })}
                placeholder="example@domain.com"
                disabled={isLoading}
              />
              {errors.email && (
                <span className="error">Ovo polje je obavezno</span>
              )}
            </div>
          </div>

          <div className="customer-info-row">
            <div className="customer-info-input-wrapper">
              <label htmlFor="place">Mesto stanovanja</label>
              <input
                id="place"
                {...register("place", { required: true })}
                placeholder="Vaše mesto stanovanja"
                disabled={isLoading}
              />
              {errors.place && (
                <span className="error">Ovo polje je obavezno</span>
              )}
            </div>
            <div className="customer-info-input-wrapper">
              <label htmlFor="postalCode">Poštanski broj</label>
              <input
                id="postalCode"
                {...register("postalCode", { required: true })}
                placeholder="11000"
                disabled={isLoading}
              />
              {errors.postalCode && (
                <span className="error">Ovo polje je obavezno</span>
              )}
            </div>
          </div>

          <div className="customer-info-row">
            <div className="customer-info-input-wrapper">
              <label htmlFor="street">Ulica</label>
              <input
                id="street"
                {...register("street", { required: true })}
                placeholder="Ulica"
                disabled={isLoading}
              />
              {errors.street && (
                <span className="error">Ovo polje je obavezno</span>
              )}
            </div>
            <div className="customer-info-input-wrapper">
              <label htmlFor="number">Broj kuće/zgrade</label>
              <input
                id="number"
                {...register("number", { required: true })}
                placeholder="123"
                disabled={isLoading}
              />
              {errors.number && (
                <span className="error">Ovo polje je obavezno</span>
              )}
            </div>
          </div>

          <div className="customer-info-row">
            <div className="customer-info-input-wrapper">
              <label htmlFor="phoneNumber">Broj telefona</label>
              <input
                id="phoneNumber"
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

        <div className="customer-info-terms">
          <Checkbox
            id="termsCheckbox"
            checked={isTermsAccepted}
            onChange={() => setIsTermsAccepted((prev) => !prev)}
          />
          <label htmlFor="termsCheckbox" onClick={() => setModalOpen(true)}>
            Prihvatam uslove korišćenja
          </label>
        </div>

        <button
          className="customer-info-submit-button"
          type="submit"
          disabled={isLoading}
        >
          {isLoading ? "Obrađujem..." : "Nastavi na poručivanje"}
        </button>
      </form>

      <TermsModal isOpen={isModalOpen} close={() => setModalOpen(false)} />
    </div>
  );
}
