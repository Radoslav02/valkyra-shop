import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { removeFromCart } from "../Redux/cartSlice";
import DeleteIcon from "@mui/icons-material/Delete";
import "./Cart.css";
import { Button } from "@mui/material";
import type { RootState } from "../Redux/store";

export default function Cart() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const cartItems = useSelector((state: RootState) => state.cart.items);
  const user = useSelector((state: RootState) => state.auth.user);

  const handleRemoveItem = (productId: string) => {
    dispatch(removeFromCart(productId));
  };

  // Calculate total price (price multiplied by quantity)
  const totalPrice = cartItems.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );
  const deliveryCost = 620.0;
  const finalTotal = totalPrice + deliveryCost;

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("sr-RS", {
      style: "currency",
      currency: "RSD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(price);

  const handleOrder = () => {
    if (user) {
      const orderDetails = {
        customer: {
          email: user.email,
          name: user.name || "",
          number: user.number || "",
          phoneNumber: user.phoneNumber || "",
          place: user.place || "",
          postalCode: user.postalCode || "",
          street: user.street || "",
          surname: user.surname || "",
        },
        total: finalTotal,
      };

      navigate("/poručivanje", { state: orderDetails });
    } else {
      // korisnik nije ulogovan → vodi na formu
      const orderDetails = {
        total: finalTotal,
      };

      navigate("/podaci", { state: orderDetails });
    }
  };

  return (
    <div className="cart-container">
      <h2>Vaša korpa</h2>
      {cartItems.length === 0 ? (
        <p>Vaša korpa je prazna</p>
      ) : (
        <div className="cart-items-wrapper">
          {cartItems.map((item) => (
            <div key={item.productId} className="cart-item">
              <img src={item.image} alt={item.name} />
              <div className="cart-item-details">
                <p className="cart-item-name">{item.name}</p>
                <p className="cart-item-quantity">Količina: {item.quantity}</p>
                {item.discountPrice && item.onDiscount ? (
                  <>
                    <p className="cart-item-price">
                      Cena: {formatPrice(item.discountPrice * item.quantity)}
                    </p>
                    <p className="cart-item-old-price">
                      <s>
                        Stara cena: {formatPrice(item.price * item.quantity)}
                      </s>
                    </p>
                  </>
                ) : (
                  <p className="cart-item-price">
                    Cena: {formatPrice(item.price * item.quantity)}
                  </p>
                )}

                <p className="cart-item-dimension">
                  {item.selectedDimension
                    ? `Dimenzija: ${item.selectedDimension}`
                    : ""}
                </p>
                <p className="cart-item-script">
                  {item.selectedScript ? `Pismo: ${item.selectedScript}` : ""}
                </p>
                <p className="cart-item-title">
                  {item.customTitle ? `Naslov: ${item.customTitle}` : ""}
                </p>
                <p className="cart-item-date">
                  {item.selectedDate ? `Datum: ${item.selectedDate}` : ""}
                </p>
              </div>
              <div
                className="cart-delete-button"
                onClick={() => handleRemoveItem(item.productId)}
                aria-label="delete"
              >
                <DeleteIcon sx={{ fontSize: 35 }} />
              </div>
            </div>
          ))}
          <div className="total-price-container">
            <h4>Ukupna cena: {formatPrice(totalPrice)}</h4>
            <h4>Troškovi dostave: {formatPrice(deliveryCost)}</h4>
            <h3>Ukupno za plaćanje: {formatPrice(finalTotal)}</h3>
          </div>
          <div className="cart-button-wrapper">
            <Button
              variant="contained"
              className="to-home-button"
              onClick={() => navigate("/početna")}
            >
              Početna
            </Button>
            <Button
              variant="contained"
              onClick={handleOrder}
              className="order-button"
            >
              Poruči
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
