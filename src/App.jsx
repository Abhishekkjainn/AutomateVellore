import './App.css';
import Header from './components/header';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import BookingPage from './pages/bookingpage';
import Page1 from './pages/page1';
import Page2 from './pages/page2';
import Page3 from './pages/page3';
import Footer from './components/footer';
import SelectDriver from './pages/selectDriver';
import BookingSuccessful from './pages/bookingSuccessful';
import Terms from './pages/termsandconditions';

function App() {
  return (
    <Router>
      <Header />
      <Routes>
        {/* Route for Page 1 and Page 2 */}
        <Route
          path="/"
          element={
            <>
              <Page1 />
              <Page2 />
              {/* <Page3 /> */}
            </>
          }
        />

        {/* Route for Booking Page */}
        <Route path="/book-ride" element={<BookingPage />} />
        <Route path="/book-ride/succesful" element={<BookingSuccessful />} />
        <Route path="/terms" element={<Terms />} />
      </Routes>
      <Footer />
    </Router>
  );
}

export default App;
