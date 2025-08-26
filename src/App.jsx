import React from "react";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Home from "./components/Home";


export default function App() {
return (
<div className="min-h-screen bg-gradient-to-r from-purple-50 to-blue-50 text-gray-900 flex flex-col">
<Header />
 <div className="flex-grow">
        <Home />
      </div>
<Footer />
</div>
);
}