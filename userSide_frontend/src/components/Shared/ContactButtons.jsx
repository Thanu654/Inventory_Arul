import React from "react";

const ContactButtons = ({
  phone = "+9475350101",
  waMessage = "Hello! I'm interested in your products. Can you help me?",
  locationUrl = "https://maps.google.com/?q=Arul+Electrical+Earlalai"
}) => {
  const phoneDigits = phone.replace(/\D/g, "");

  const handleWhatsAppClick = () => {
    const url = `https://wa.me/${phoneDigits}?text=${encodeURIComponent(waMessage)}`;
    window.open(url, "_blank");
  };

  const handleCallClick = () => {
    window.location.href = `tel:${phone}`;
  };

  const handleLocationClick = () => {
    window.open(locationUrl, "_blank");
  };

  return (
    <div className="fixed right-6 bottom-6 flex flex-col gap-4 z-50">
      <button
        className="w-14 h-14 rounded-full bg-green-500 text-white flex items-center justify-center shadow-xl hover:shadow-2xl hover:scale-110 transition-all duration-300"
        onClick={handleWhatsAppClick}
        title="WhatsApp"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2C6.48 2 2 6.48 2 12c0 1.71.46 3.31 1.24 4.71L2 22l5.29-1.24C8.69 21.54 10.29 22 12 22c5.52 0 10-4.48 10-10S17.52 2 12 2z" />
        </svg>
      </button>

      <button
        className="w-14 h-14 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-xl hover:shadow-2xl hover:scale-110 transition-all duration-300"
        onClick={handleCallClick}
        title="Call Now"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
          <path d="M20 15.5c-1.2 0-2.5-.2-3.6-.6-.3-.1-.6 0-.8.2l-2.2 2.2c-2.8-1.5-5.2-3.9-6.7-6.7l2.2-2.2c.2-.2.3-.5.2-.8-.4-1.1-.6-2.4-.6-3.6C8.5 3.5 8 3 7.5 3H4c-.5 0-1 .5-1 1 0 9.4 7.6 17 17 17 .5 0 1-.5 1-1v-3.5c0-.5-.5-1-1-1z" />
        </svg>
      </button>

      <button
        className="w-14 h-14 rounded-full bg-orange-500 text-white flex items-center justify-center shadow-xl hover:shadow-2xl hover:scale-110 transition-all duration-300"
        onClick={handleLocationClick}
        title="Location"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5S10.62 6.5 12 6.5s2.5 1.12 2.5 2.5S13.38 11.5 12 11.5z" />
        </svg>
      </button>
    </div>
  );
};

export default ContactButtons;
