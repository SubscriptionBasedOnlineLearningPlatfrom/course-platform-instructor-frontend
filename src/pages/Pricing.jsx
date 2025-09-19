import React from "react";
import PaymentCard from "../components/payment/PaymentCard";
import CheckoutPage from "../components/payment/CheckoutPage";

const Pricing = () => {
  return (
    <div className="flex flex-col md:flex-row gap-6 p-6">
      {/* Left Side */}
      <div className="md:w-2/5">
        <PaymentCard />
      </div>

      {/* Right Side */}
      <div className="md:w-3/5">
        <CheckoutPage />
      </div>
    </div>
  );
};

export default Pricing;
