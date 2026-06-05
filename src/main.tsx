import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import ShabbatGate from './components/ShabbatGate.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ShabbatGate>
      <App />
    </ShabbatGate>
  </StrictMode>,
);
