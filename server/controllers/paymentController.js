import { instance } from "../server.js";
import crypto from "crypto";
import { Payment } from "../models/paymentModel.js";

export const checkout = async (req, res) => {
  try {
    // console.log("Data: ", req.body);
    const options = {
      amount: Number(req.body.amount * 100),
      currency: "INR",
    };

    // console.log("options: ", options);
    const order = await instance.orders.create(options);

    console.log("order: ", order);

    res.status(200).json({
      success: true,
      order,
    });
  } catch (error) {
    console.error("Error in checkout:", error);
    res.status(500).json({
      success: false,
      error: "Internal Server Error",
    });
  }
};

export const paymentVerification = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
      req.body;

    const body = razorpay_order_id + "|" + razorpay_payment_id;

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_APT_SECRET)
      .update(body.toString())
      .digest("hex");

    const isAuthentic = expectedSignature === razorpay_signature;

    if (isAuthentic) {
      // Database logic goes here

      await Payment.create({
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature,
      });

      res.redirect(
        `http://localhost:3000/paymentsuccess?reference=${razorpay_payment_id}`
      );
    } else {
      res.status(400).json({
        success: false,
      });
    }
  } catch (error) {
    console.error("Error in paymentVerification:", error);
    res.status(500).json({
      success: false,
      error: "Internal Server Error",
    });
  }
};