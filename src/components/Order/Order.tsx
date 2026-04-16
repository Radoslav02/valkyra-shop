import { useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import emailjs from "@emailjs/browser";
import { clearCart } from "../Redux/cartSlice";
import "./Order.css";
import type { RootState } from "../Redux/store";
import { Button, FormControlLabel, Radio, RadioGroup } from "@mui/material";
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

  const { customer, total, deliveryMethod: passedDeliveryMethod } =
    (location.state as {
      customer: Customer;
      total: number;
      deliveryMethod?: string;
    }) || {};

  const items = useSelector((state: RootState) => state.cart.items);
  const user = useSelector((state: RootState) => state.auth.user);
  const isLoggedIn = Boolean(user);

  const [isEmailSent, setIsEmailSent] = useState(false);
  const [deliveryMethod, setDeliveryMethod] = useState<string>(passedDeliveryMethod || "");

  const sendEmail = async () => {
    if (!items || items.length === 0) {
      toast.error("Nema poručenih proizvoda.");
      return;
    }

    if (!deliveryMethod) {
      toast.error("Molimo vas da izaberete način preuzimanja.");
      return;
    }

    const orderData = {
      customer,
      total,
      deliveryMethod,
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
        deliveryMethod: deliveryMethod === "pickup" ? "Lično preuzimanje" : "Dostava na adresu",
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
        "service_gg68c2m",
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

      {items && items.length > 0 && (
        <div className="order-items-wrapper">
          <h3>Poručeni proizvodi</h3>
          {items.map((item) => {
            const unitPrice =
              item.onDiscount && item.discountPrice
                ? item.discountPrice
                : item.price;
            return (
              <div key={item.productId} className="order-item">
                {item.image && <img src={item.image} alt={item.name} />}
                <div className="order-item-details">
                  <p className="order-item-name">{item.name}</p>
                  <p className="order-item-quantity">
                    Količina: {item.quantity}
                  </p>
                  <p className="order-item-price">
                    Cena: {formatPrice(unitPrice * item.quantity)}
                  </p>
                  {item.selectedDimension && (
                    <p>Dimenzija: {item.selectedDimension}</p>
                  )}
                  {item.selectedScript && (
                    <p>Pismo: {item.selectedScript}</p>
                  )}
                  {item.customTitle && <p>Naslov: {item.customTitle}</p>}
                  {item.selectedDate && <p>Datum: {item.selectedDate}</p>}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {customer ? (
        <div className="customer-info-wrapper">
          <h3>Podaci o klijentu</h3>
          <div className="show-profile">
            <p>
              <span>Email:</span> {customer.email}
            </p>
            <p>
              <span>Ime:</span> {customer.name}
            </p>
            <p>
              <span>Prezime:</span> {customer.surname}
            </p>
            <p>
              <span>Telefon:</span> {customer.phoneNumber}
            </p>
            {isLoggedIn && (
              <>
                <p>
                  <span>Mesto:</span> {customer.place}
                </p>
                <p>
                  <span>Poštanski broj:</span> {customer.postalCode}
                </p>
                <p>
                  <span>Ulica:</span> {customer.street}
                </p>
                <p>
                  <span>Broj:</span> {customer.number}
                </p>
              </>
            )}
          </div>
        </div>
      ) : (
        <p>Nema podataka o klijentu.</p>
      )}

      <div className="delivery-method-wrapper">
        <h3>Način preuzimanja</h3>
        <RadioGroup
          value={deliveryMethod}
          onChange={(e) => setDeliveryMethod(e.target.value)}
        >
          <FormControlLabel
            value="pickup"
            control={<Radio />}
            label="Lično preuzimanje"
            disabled={!isLoggedIn}
          />
          <FormControlLabel
            value="shipping"
            control={<Radio />}
            label="Dostava na adresu"
            disabled={!isLoggedIn}
          />
        </RadioGroup>
      </div>

      <div className="order-total-wrapper">
        <h3>Ukupno za plaćanje: {formatPrice(total)}</h3>
        <p className="delivery-note">
          +{" "}
          <a
            href="http://www.postexpress.rs/struktura/lat/cenovnik/cenovnik-unutrasnji-saobracaj.asp"
            target="_blank"
            rel="noopener noreferrer"
          >
            Troškovi dostave
          </a>
        </p>
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
      </div>
    </div>
  );
};

export default Order;
