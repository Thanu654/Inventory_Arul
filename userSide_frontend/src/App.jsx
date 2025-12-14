import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./components/Home/Home";
import HomeBlank from "./components/Home/HomeBlank";
import ParcelService from "./components/ParcelService/ParcelService";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomeBlank />} />
        <Route path="/products" element={<Home />} />
        <Route path="/parcel" element={<ParcelService />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
