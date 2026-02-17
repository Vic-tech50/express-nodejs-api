import fetch from "node-fetch";
import dotenv from "dotenv";

dotenv.config();

/* =========================
   PAYSTACK INITIALIZATION
========================= */
export const initPaystack = async (req, res) => {
  const { email, amount } = req.body;

  try {
    const response = await fetch(
      "https://api.paystack.co/transaction/initialize",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          email,
          amount: amount * 100, // Paystack uses kobo
          callback_url: `${process.env.BASE_URL}/api/payment/paystack/verify`
        })
      }
    );

    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: "Paystack init failed" });
  }
};

/* =========================
   PAYSTACK VERIFICATION
========================= */
export const verifyPaystack = async (req, res) => {
  const { reference } = req.params;

  try {
    const response = await fetch(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`
        }
      }
    );

    const data = await response.json();

    if (data.data.status === "success") {
      return res.json({ success: true, data: data.data });
    }

    res.json({ success: false });
  } catch (error) {
    res.status(500).json({ error: "Verification failed" });
  }
};

/* =========================
   FLUTTERWAVE INITIALIZATION
========================= */
export const initFlutterwave = async (req, res) => {
  const { email, amount, name } = req.body;

  try {
    const response = await fetch(
      "https://api.flutterwave.com/v3/payments",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.FLUTTERWAVE_SECRET_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          tx_ref: Date.now().toString(),
          amount,
          currency: "NGN",
          redirect_url: `${process.env.BASE_URL}/api/payment/flutterwave/verify`,
          customer: {
            email,
            name
          }
        })
      }
    );

    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: "Flutterwave init failed" });
  }
};

/* =========================
   FLUTTERWAVE VERIFICATION
========================= */
export const verifyFlutterwave = async (req, res) => {
  const { transaction_id } = req.query;

  try {
    const response = await fetch(
      `https://api.flutterwave.com/v3/transactions/${transaction_id}/verify`,
      {
        headers: {
          Authorization: `Bearer ${process.env.FLUTTERWAVE_SECRET_KEY}`
        }
      }
    );

    const data = await response.json();

    if (data.data.status === "successful") {
      return res.json({ success: true, data: data.data });
    }

    res.json({ success: false });
  } catch (error) {
    res.status(500).json({ error: "Verification failed" });
  }
};

