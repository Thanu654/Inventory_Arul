import React from "react";
import Header from "../Layouts/Header";
import Footer from "../Layouts/Footer";
import OffersList from "../Offers/OffersList";

const HomeBlank = () => {
  return (
    <>
      <Header />
      <main style={{ minHeight: "60vh" }}>
        <OffersList />
      </main>
      <Footer />
    </>
  );
};

export default HomeBlank;