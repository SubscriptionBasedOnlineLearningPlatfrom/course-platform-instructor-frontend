import React, { useContext, useState } from "react";
import { PricingContext } from "../../contexts/PricingConetxt";

const PaymentCard = () => {
  // const [planName, setPlanName] = useState("");
  // const [price, setPrice] = useState("");
  const [showStrikeout, setShowStrikeout] = useState(false);
  // const [strikeoutPrice, setStrikeoutPrice] = useState("");
  // const [expiryDays, setExpiryDays] = useState("");
  // const [title, setTitle] = useState("");
  // const [description, setDescription] = useState("");
  // const [additionalInfo, setAdditionalInfo] = useState("");

  const {pricingData, setPricingData} = useContext(PricingContext);

  const handleChange = (e) => {
    const {name, value} = e.target;
    setPricingData((p) => ({...p, [name] : value}));
  }
  console.log(pricingData);
  return (
    <form
      // onSubmit={handleSubmit}
      className="w-[100%] mx-auto p-3 bg-gradient-to-br from-blue-50 to-indigo-100 shadow-lg rounded-lg"
    >
      <div className="space-y-8">
        {/* Payment Type Section */}
        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-gray-800">Add a Plan</h3>
        </div>

        {/* Plan Details */}
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Plan name
            </label>
            <input
              name="planName"
              type="text"
              value={pricingData.planName}
              onChange={handleChange}
              placeholder="Enter Plan Name"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Price (LKR)
            </label>
            <input
              type="number"
              name="price"
              value={pricingData.price}
              onChange={handleChange}
              placeholder="Enter amount"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Strikeout Price Section */}
          <div className="space-y-3 p-4 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-md">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={pricingData.showStrikeout}
                onChange={(e) => setShowStrikeout(e.target.checked)}
                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
              />
              <p className="text-sm text-gray-700">Show strikeout price</p>
            </div>

            {showStrikeout && (
              <>
                <div className="space-y-2 ">
                  <label className="block text-sm font-medium text-gray-700">
                    Strikeout Price
                  </label>
                  <input
                    type="number"
                    name="strikeoutPrice"
                    value={pricingData.strikeoutPrice}
                    onChange={handleChange}
                    placeholder="Add strikeout price"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Expires in days
                  </label>
                  <input
                    type="number"
                    name="expiryDays"
                    value={pricingData.expiryDays}
                    onChange={handleChange}
                    placeholder="Eg. 365"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </>
            )}
          </div>
        </div>

        {/* Product Details Section */}
        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-gray-800">
            Add Product Details
          </h3>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Title
            </label>
            <input
              type="text"
              name="title"
              value={pricingData.title}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Description
            </label>
            <textarea
              name="description"
              value={pricingData.description}
              onChange={handleChange}
              placeholder="Enter a description"
              rows="4"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-vertical"
            ></textarea>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Additional Information
            </label>
            <textarea
              value={pricingData.additionalInfo}
              name="additionalInfo"
              onChange={handleChange}
              placeholder="Enter extra details"
              rows="4"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-vertical"
            ></textarea>
          </div>
        </div>

        
      </div>
    </form>
  );
};

export default PaymentCard;
