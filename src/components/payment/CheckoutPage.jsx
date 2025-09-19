import React, { useContext, useState } from "react";
import { PricingContext } from "../../contexts/PricingConetxt";
import { Toaster, toast } from "sonner";
import { useNavigate } from "react-router-dom";

export default function CheckoutPage() {
  const { pricingData, setPricingData } = useContext(PricingContext);
  const navigate = useNavigate();

  const discount = pricingData.strikeoutPrice - pricingData.price;

  const handleSubmit = () => {
    toast.success("Add a plan Successfully");
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex justify-center items-center p-6">
      <div className="bg-white rounded-xl shadow-lg max-w-5xl w-full flex flex-col md:flex-row overflow-hidden">
        {/* Left Side (Product Preview) */}
        <div className="md:w-1/2 p-6 flex flex-col items-center justify-center text-center">
          <img
            src="https://images.unsplash.com/photo-1611746872441-9c0d6a1f7a38"
            alt="Product"
            className="w-64 h-64 object-cover rounded-lg shadow-md"
          />
          <h2 className="mt-4 text-xl font-semibold">{pricingData.title}</h2>
          <p className="text-gray-500">{pricingData.description}</p>
        </div>

        {/* Right Side (Checkout Form + Summary) */}
        <div className="md:w-1/2 bg-gray-50 p-8 flex flex-col justify-between space-y-6">
          {/* Price & Summary */}
          <div>
            <h3 className="text-2xl font-bold text-green-600">
              {pricingData.price}
              {pricingData.showStrikeout && (
                <>
                  <span className="text-gray-500 line-through text-lg ml-2">
                    {pricingData.strikeoutPrice}
                  </span>
                </>
              )}
            </h3>

            <div className="mt-4 space-y-2 text-gray-600">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-medium">
                  {pricingData.strikeoutPrice}
                </span>
              </div>
              {pricingData.showStrikeout && (
                <>
                  <div className="flex justify-between">
                    <span>Discount</span>
                    <span className="text-red-500">- {discount}</span>
                  </div>
                </>
              )}

              <div className="flex justify-between border-t pt-2 font-semibold">
                <span>Total</span>
                <span>{pricingData.price}</span>
              </div>
            </div>

            {/* Coupon Code */}
            <div className="mt-4">
              <input
                type="text"
                placeholder="Enter coupon code"
                className="w-full border rounded-md px-3 py-2 focus:outline-blue-500"
              />
              <button className="mt-2 w-full bg-gray-800 text-white py-2 rounded-md hover:bg-gray-900">
                Apply Coupon
              </button>
            </div>
          </div>

          {/* Form */}
          <form className="space-y-4">
            <input
              type="text"
              placeholder="First Name *"
              className="w-full border rounded-md px-3 py-2 focus:outline-blue-500"
            />
            <input
              type="text"
              placeholder="Last Name *"
              className="w-full border rounded-md px-3 py-2 focus:outline-blue-500"
            />
            <input
              type="email"
              placeholder="Email *"
              className="w-full border rounded-md px-3 py-2 focus:outline-blue-500"
            />

            <button
              type="submit"
              onClick={handleSubmit}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
            >
              Add a Plan
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
