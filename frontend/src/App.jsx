import { BrowserRouter, Routes, Route } from 'react-router-dom';
import TorchApp from './torch/TorchApp';
import DashboardApp from './dashboard/DashboardApp';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<TorchApp />} />
        <Route path="/command" element={<DashboardApp />} />
      </Routes>
    </BrowserRouter>
  );
}
