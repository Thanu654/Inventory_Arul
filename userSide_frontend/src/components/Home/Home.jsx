import React from "react";
import Header from "../Layouts/Header";
import Footer from "../Layouts/Footer";
import OffersList from "../Offers/OffersList";
import ContactButtons from "../Shared/ContactButtons";

const Home = () => {
  return (
    <>
      <Header />
      <main style={{ minHeight: "60vh" }}>
        

        <ContactButtons />
      
      </main>
      <Footer />
    </>
  );
};

export default Home;