import AuthContextProvider from '../contexts/AuthContext';
import AppRoutes from './appRoutes';
import { BrowserRouter } from 'react-router-dom';

function App() {
  return (
    <>
      <BrowserRouter>
        <AuthContextProvider>
          <AppRoutes />
        </AuthContextProvider>
      </BrowserRouter>
    </>
  );
}

export default App;
