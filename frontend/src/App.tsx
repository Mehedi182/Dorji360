import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import ToastContainer from './components/ToastContainer';
import Customers from './pages/Customers';
import Measurements from './pages/Measurements';
import Templates from './pages/Templates';
import Samples from './pages/Samples';
import Orders from './pages/Orders';
import Staff from './pages/Staff';
import Payments from './pages/Payments';
import Deliveries from './pages/Deliveries';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Navigate to="/customers" replace />} />
          <Route path="/customers" element={<Customers />} />
          <Route path="/measurements" element={<Measurements />} />
          <Route path="/templates" element={<Templates />} />
          <Route path="/samples" element={<Samples />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/staff" element={<Staff />} />
          <Route path="/payments" element={<Payments />} />
          <Route path="/deliveries" element={<Deliveries />} />
        </Routes>
        <ToastContainer />
      </Layout>
    </Router>
  );
}

export default App;
