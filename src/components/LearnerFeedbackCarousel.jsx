// insert component to the correct position of the page
import React, { useRef } from "react";
import g1 from "../assets/g1.jpg";
import g2 from "../assets/g2.jpg";
import g3 from "../assets/g3.jpg";
import b1 from "../assets/b1.jpg";
import b2 from "../assets/b2.jpg";
import b3 from "../assets/b3.jpg";

const feedbacks = [
  {
    id: 1,
    name: "Alice",
    image: g1,
    feedback:
      "This course helped me understand React very well! I especially loved how the concepts were broken down into simple steps and the exercises reinforced the lessons perfectly.",
  },
  {
    id: 2,
    name: "Bob",
    image: b1,
    feedback:
      "Very clear explanations and practical examples. The instructor made sure every topic was covered in depth and easy to follow.",
  },
  {
    id: 3,
    name: "Diana",
    image: g2,
    feedback:
      "Loved the interactive exercises and demos! They helped me apply what I learned immediately and boosted my confidence in building real projects.",
  },
  {
    id: 4,
    name: "Charlie",
    image: b2,
    feedback:
      "The course had practical examples which helped a lot! I feel much more comfortable now using React in my own projects.",
  },
  {
    id: 5,
    name: "Clara",
    image: g3,
    feedback:
      "Fantastic content and pacing. I really appreciated the detailed explanations and the additional tips that made understanding complex topics much easier.",
  },
  {
    id: 6,
    name: "Sam",
    image: b3,
    feedback:
      "I loved how the course was structured. It gradually built up from the basics to more advanced topics, making learning smooth and enjoyable.",
  },
];

const HorizontalFeedbackCarousel = () => {
  const carouselRef = useRef(null);

  const scrollLeft = () => {
    carouselRef.current.scrollBy({ left: -350, behavior: "smooth" });
  };

  const scrollRight = () => {
    carouselRef.current.scrollBy({ left: 350, behavior: "smooth" });
  };

  return (
    <div className="w-full relative my-12">
      <button
        onClick={scrollLeft}
        className="absolute left-0 top-1/2 -translate-y-1/2 bg-white border border-gray-300 rounded-full p-4 shadow-md z-10 hover:bg-gray-100 transition hidden sm:flex"
      >
        ←
      </button>

      <div
        ref={carouselRef}
        className="flex overflow-x-hidden space-x-6 px-6 sm:px-10"
      >
        {feedbacks.map((item) => (
          <div
            key={item.id}
            className="feedback-card flex-shrink-0 w-[280px] sm:w-[320px] md:w-[360px] lg:w-[400px] border rounded-2xl shadow-xl bg-white"
          >
            <img
              src={item.image}
              alt={item.name}
              className="w-full h-48 object-cover rounded-t-2xl"
            />
            <div className="p-6">
              <h3 className="font-bold text-lg sm:text-xl text-center mb-3 text-gray-800">
                {item.name}
              </h3>
              <p className="text-gray-700 text-base sm:text-lg text-center leading-relaxed">
                {item.feedback}
              </p>
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={scrollRight}
        className="absolute right-0 top-1/2 -translate-y-1/2 bg-white border border-gray-300 rounded-full p-4 shadow-md z-10 hover:bg-gray-100 transition hidden sm:flex"
      >
        →
      </button>
    </div>
  );
};

export default HorizontalFeedbackCarousel;
