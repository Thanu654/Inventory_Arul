import { BrowserRouter, Routes, Route } from "react-router-dom";
import Product from "./components/Home/Product";
import Home from "./components/Home/Home";
import ParcelService from "./components/ParcelService/ParcelService";
import Offers from "./components/Offers/offers";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/products" element={<Product />} />
        <Route path="/parcel" element={<ParcelService />} />
        <Route path="/offers" element={<Offers />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
