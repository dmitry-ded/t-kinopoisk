import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';
import { Provider } from 'react-redux';
import { store } from './app/store.ts';
import { BrowserRouter } from 'react-router-dom';
import { LogError } from './components/logError/LogError.tsx';

createRoot(document.getElementById('root')!).render(
  <BrowserRouter>
    <Provider store={store}>
      <LogError>
        <App />
      </LogError>
    </Provider>
  </BrowserRouter>,
);
