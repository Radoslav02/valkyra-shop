import { useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import emailjs from "@emailjs/browser";
import { clearCart } from "../Redux/cartSlice";
import "./Order.css";
import type { RootState } from "../Redux/store";
import { Button } from "@mui/material";
import { toast } from "react-toastify";
import { addDoc, collection } from "firebase/firestore";
import { db } from "../../firebase";

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

  const sendEmail = async () => {
    if (!items || items.length === 0) {
      toast.error("Nema poručenih proizvoda.");
      return;
    }

    const orderData = {
      customer,
      total,
      items: items.map((item) => ({
        id: item.productId,
        name: item.name,
        quantity: item.quantity,
        price: item.price,
        selectedDimension: item.selectedDimension || null,
        selectedScript: item.selectedScript || null,
        customTitle: item.customTitle || null,
        selectedDate: item.selectedDate || null,
      })),
      timestamp: new Date().toISOString(),
    };

    try {
      await addDoc(collection(db, "orders"), orderData);

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
            const selectedDate = item.selectedDate
              ? `Datum: ${item.selectedDate}`
              : "Nema datuma";
            const imageTag = item.image
              ? `<img src="${item.image}" alt="${item.name}" style="width:120px; height:auto; display:block; margin-bottom:10px;" />`
              : "<em>Nema slike</em>";

            return `
        ${imageTag}
        <div><strong>Naziv:</strong> ${item.name}, <strong>Količina:</strong> ${item.quantity}, <strong>Cena:</strong> ${item.price} RSD, <strong>${dimensions}</strong>, <strong>${script}</strong>, <strong>${customTitle}</strong>, <strong>${selectedDate}</strong></div>
        <hr />
      
    `;
          })
          .join(""),
      };

      await emailjs.send(
        "service_mqkqlir",
        "template_qowqqcs",
        templateParams,
        "1tiA01x6TVNOrRdyO"
      );

      dispatch(clearCart());
      setIsEmailSent(true);
      navigate("/potvrda");
    } catch (error: any) {
      console.error("Greška pri slanju porudžbine:", error);
      toast.error(`Greška: ${error.message || "Neuspelo slanje"}`);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("sr-RS", {
      style: "currency",
      currency: "RSD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(price);
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
    </div>
  );
};

export default Order;
