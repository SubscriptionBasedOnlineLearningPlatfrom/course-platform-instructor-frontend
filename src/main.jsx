
import React from 'react'; 
import ReactDOM from 'react-dom/client';
import {BrowserRouter} from 'react-router-dom'
import App from './App.jsx';
import './index.css';
import { PricingProvider } from "./contexts/PricingConetxt.jsx";
import { ApiProvider } from './contexts/APIContext.jsx';


ReactDOM.createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <PricingProvider>
      <ApiProvider>
        <App />
      </ApiProvider>
    </PricingProvider>
  </BrowserRouter>
);
