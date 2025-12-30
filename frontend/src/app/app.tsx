import AuthContextProvider from '../contexts/AuthContext';
import AppRoutes from './appRoutes';
import { BrowserRouter } from 'react-router-dom';
import MeetingContextProvider from '../contexts/MeetingContext';
function App() {
  return (
    <>
      <BrowserRouter>
        <AuthContextProvider>
          <MeetingContextProvider>
            <AppRoutes />
          </MeetingContextProvider>
        </AuthContextProvider>
      </BrowserRouter>
    </>
  );
}

export default App;
