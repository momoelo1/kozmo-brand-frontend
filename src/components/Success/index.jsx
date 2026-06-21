import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import ordersService from "../../services/orders";
import { clearCart } from "../../reducers/cartReducer";
import Notification from "../Notification";
import "./index.scss";

const MAX_ATTEMPTS = 5;
const RETRY_DELAY = 1500;

const Success = () => {
  const [cardReady, setCardReady] = useState(false);
  const [order, setOrder] = useState(null);
  const [status, setStatus] = useState("loading"); // loading | loaded | notfound
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const dispatch = useDispatch();
  const currency = useSelector((state) => state.currency.selected);

  useEffect(() => {
    document.title = "Order Confirmed – KoZmo";
  }, []);

  useEffect(() => {
    const t = setTimeout(() => setCardReady(true), 10);
    return () => clearTimeout(t);
  }, []);

  // Payment succeeded — empty the cart.
  useEffect(() => {
    dispatch(clearCart());
  }, [dispatch]);

  // Fetch the persisted order, retrying for the webhook race.
  useEffect(() => {
    if (!sessionId) {
      setStatus("notfound");
      return;
    }
    let cancelled = false;
    let attempts = 0;

    const fetchOrder = async () => {
      attempts += 1;
      try {
        const data = await ordersService.getOrderBySession(sessionId);
        if (cancelled) return;
        setOrder(data);
        setStatus("loaded");
      } catch {
        if (cancelled) return;
        if (attempts < MAX_ATTEMPTS) {
          setTimeout(fetchOrder, RETRY_DELAY);
        } else {
          setStatus("notfound");
        }
      }
    };

    fetchOrder();
    return () => {
      cancelled = true;
    };
  }, [sessionId]);

  const formatPrice = (cents) =>
    `${currency.symbol}${((cents / 100) * currency.rate).toFixed(2)}`;

  return (
    <div className="success-view">
      <Notification />
      <div className={`success-card${cardReady ? " card-ready" : ""}`}>
        <div className="success-icon-wrap">
          <svg className="success-icon" viewBox="0 0 52 52" fill="none" aria-hidden="true">
            <circle cx="26" cy="26" r="25" stroke="#ffb84d" strokeWidth="1.5" />
            <path d="M15 26.5l8 8 14-16" stroke="#ffb84d" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>

        <div className="success-header">
          <h1 className="success-heading">Order Confirmed</h1>
          <p className="success-sub">Thank you for your purchase.</p>
        </div>

        {status === "loading" && (
          <p className="success-note">Loading your order…</p>
        )}

        {status === "loaded" && order && (
          <div className="success-order">
            <ul className="success-items">
              {order.items.map((item, i) => (
                <li key={`${item.productId}-${item.size}-${i}`} className="success-item">
                  <span className="success-item-name">
                    {item.name}
                    {item.size ? ` — ${item.size}` : ""}
                    <span className="success-item-qty"> ×{item.quantity}</span>
                  </span>
                  <span className="success-item-price">
                    {formatPrice(item.price * item.quantity)}
                  </span>
                </li>
              ))}
            </ul>
            <div className="success-total">
              <span>Total</span>
              <span>{formatPrice(order.amountTotal)}</span>
            </div>
          </div>
        )}

        {sessionId && (
          <p className="success-ref">
            Ref: <span>{sessionId.slice(-12).toUpperCase()}</span>
          </p>
        )}

        {status !== "loading" && (
          <p className="success-note">
            {status === "notfound"
              ? "Your order is being processed. You'll receive a confirmation email shortly."
              : "A confirmation email is on its way."}
          </p>
        )}

        <Link to="/" className="success-btn">
          Back to Shop
        </Link>
      </div>
    </div>
  );
};

export default Success;
