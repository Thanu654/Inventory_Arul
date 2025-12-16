import React from "react";
import Header from "../Layouts/Header";
import Footer from "../Layouts/Footer";
import OffersList from "./OffersList";
import ContactButtons from "../Shared/ContactButtons";

const offers = () => {
  return (
    <>
      <Header />
      <main style={{ minHeight: "60vh" }}>
        <OffersList />
        <ContactButtons />


      </main>


      <Footer />
    </>
  );
};

export default offers;