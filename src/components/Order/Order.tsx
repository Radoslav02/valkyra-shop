import { useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import emailjs from "@emailjs/browser";
import { clearCart } from "../Redux/cartSlice";
import "./Order.css";
import type { RootState } from "../Redux/store";
import TermsModal from "../Modals/TermsModal";
import { Button, Checkbox } from "@mui/material";
import { toast } from "react-toastify";

interface Customer {
  email: string;
  name: string;
  number: string;
  phoneNumber: string;
  place: string;
  postalCode: string;
  street: string;
  surname: string;
}

const Order = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { customer, total } =
    (location.state as {
      customer: Customer;
      total: number;
    }) || {};

  const items = useSelector((state: RootState) => state.cart.items);

  const [isEmailSent, setIsEmailSent] = useState(false);
  const [isModalOpen, setModalOpen] = useState(false); // State for modal visibility
  const [isTermsAccepted, setIsTermsAccepted] = useState(false); // State for checkbox

  const sendEmail = () => {
    if (!items || items.length === 0) {
      toast.error("Nema poručenih proizvoda.");
      return;
    }

    if (!isTermsAccepted) {
      toast.error("Morate prihvatiti uslove korišćenja pre nego što nastavite.");
      return;
    }

    const templateParams = {
      customerEmail: customer?.email,
      customerName: customer?.name,
      customerNumber: customer?.number,
      customerPhoneNumber: customer?.phoneNumber,
      customerPlace: customer?.place,
      customerPostalCode: customer?.postalCode,
      customerStreet: customer?.street,
      customerSurname: customer?.surname,
      total,
      items: items
        .map((item) => {
          const dimensions = item.selectedDimension
            ? `Dimenzija: ${item.selectedDimension}`
            : "Nema dimenzije";
          const script = item.selectedScript
            ? `Pismo: ${item.selectedScript}`
            : "Nema pisma";
          const customTitle = item.customTitle
            ? `Natpis: ${item.customTitle}`
            : "Nema natpisa";

          return `Naziv: ${item.name}, Količina: ${item.quantity}, Cena: ${item.price}, ${dimensions}, ${script}, ${customTitle}`;
        })
        .join("\n"),
    };

    emailjs
      .send(
        "service_mqkqlir",
        "template_qowqqcs",
        templateParams,
        "1tiA01x6TVNOrRdyO"
      )
      .then(() => {
        dispatch(clearCart());
        setIsEmailSent(true);
        navigate("/potvrda");
      })
      .catch((error) => {
        console.error("Email sending error:", error);
        toast.error(`Error: ${error.text || error.message}`);
      });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("sr-RS", {
      style: "currency",
      currency: "RSD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(price);
  };

  const handleModalOpen = () => setModalOpen(true);
  const handleModalClose = () => setModalOpen(false);

  const handleCheckboxChange = () => {
    setIsTermsAccepted((prev) => !prev); // Toggle the checkbox state
  };

  return (
    <div className="order-container">
      <h2>Detalji porudžbine</h2>
      {customer ? (
        <div className="customer-info-wrapper">
          <h3>Podaci o klijentu:</h3>
          <div className="show-profile">
            <p>Email: {customer.email}</p>
            <p>Ime: {customer.name}</p>
            <p>Broj: {customer.number}</p>
            <p>Telefon: {customer.phoneNumber}</p>
            <p>Mesto: {customer.place}</p>
            <p>Poštanski broj: {customer.postalCode}</p>
            <p>Ulica: {customer.street}</p>
            <p>Prezime: {customer.surname}</p>
            <h3>Ukupno za plaćanje: {formatPrice(total)}</h3>
          </div>
        </div>
      ) : (
        <p>Nema podataka o klijentu.</p>
      )}

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

      <div className="order-button-wrapper">
        <Button
          variant="contained"
          className="to-home-button"
          onClick={() => navigate(-1)}
        >
          Nazad
        </Button>
        <Button
          variant="contained"
          onClick={sendEmail}
          className="order-button"
        >
          Poruči
        </Button>
        {isEmailSent && <p>Poruka je uspešno poslata!</p>}

        {/* Checkbox and label for Terms Acceptance */}
      </div>

      {/* Terms Modal */}
      <TermsModal  isOpen={isModalOpen} close={handleModalClose} />
    </div>
  );
};

export default Order;
