
import React from 'react'; 
import ReactDOM from 'react-dom/client';
import {BrowserRouter} from 'react-router-dom'
import App from './App.jsx';
import './index.css';
import { PricingProvider } from "./contexts/PricingConetxt.jsx";
import { ApiProvider } from './contexts/APIContext.jsx';
import { Toaster } from 'react-hot-toast';


ReactDOM.createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <PricingProvider>
      <ApiProvider>
        <App />
        <Toaster position="top-right" />
      </ApiProvider>
    </PricingProvider>
  </BrowserRouter>
);
