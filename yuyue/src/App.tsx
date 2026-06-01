import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from 'sonner';
import Navbar from "@/components/Navbar";
import Home from "@/pages/Home";
import BookingList from "@/pages/BookingList";
import Admin from "@/pages/Admin";

export default function App() {
  return (
    <Router>
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/bookings" element={<BookingList />} />
            <Route path="/admin" element={<Admin />} />
          </Routes>
        </main>
        <Toaster
          richColors
          closeButton
          duration={3000}
          toastOptions={{
            style: {
              borderRadius: '12px',
              padding: '12px 16px'
            }
          }}
        />
      </div>
    </Router>
  );
}
