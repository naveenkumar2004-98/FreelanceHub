import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import FreelancerDashboard from './pages/FreelancerDashboard';
import EmployerDashboard from './pages/EmployerDashboard';
import EditEmployerProfile from './pages/EditEmployerProfile';
import EditFreelancerProfile from './pages/EditFreelancerProfile';
import Home from './pages/Home';
import PostProject from './components/PostProject';
import PaymentPage from './pages/PaymentPage';
import ViewApplication from './pages/ViewApplication';
import ProjectApplications from './pages/ProjectApplications';



function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/freelancer-dashboard" element={<FreelancerDashboard />} />
        <Route path="/employer-dashboard" element={<EmployerDashboard />} />
        <Route path="/edit-employer-profile" element={<EditEmployerProfile />} />
        <Route path="/edit-freelancer-profile" element={<EditFreelancerProfile />} />
        <Route path="/post-project" element={<PostProject />} />
        <Route path="/payment" element={<PaymentPage />} />
        <Route path="/application/:id" element={<ViewApplication />} />
        <Route path="/project/:projectId/applications" element={<ProjectApplications />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;