import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { store } from './redux/store'
import { Provider } from 'react-redux'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

const queryClient = new QueryClient();
// Dev-only floating button covers the chat send button on phone screens.
const showQueryDevtools = window.matchMedia("(min-width: 768px)").matches;

createRoot(document.getElementById('root')).render(
  // <StrictMode>
  <QueryClientProvider client={queryClient}>
    <Provider store={store} >
      <App />
      {showQueryDevtools && <ReactQueryDevtools initialIsOpen={false} />}
    </Provider>
  </QueryClientProvider>
  // </StrictMode>,
)
