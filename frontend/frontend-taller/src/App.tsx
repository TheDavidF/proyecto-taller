import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import { PerfilPage } from './pages/PerfilPage';
import { ServicioPage } from './pages/ServicioPage';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-brand-bg text-brand-dark flex flex-col">
        {/* Barra de navegación superior */}
        <nav className="bg-brand-secondary text-white shadow-md p-4">
          <div className="max-w-5xl mx-auto flex justify-between items-center">
            <span className="text-xl font-bold tracking-wide">Taller Mecánico</span>
            <div className="space-x-6 font-medium">
              <Link to="/perfiles" className="hover:text-brand-primary transition-colors">
                Perfiles
              </Link>
              <Link to="/servicios" className="hover:text-brand-primary transition-colors">
                Servicios
              </Link>
            </div>
          </div>
        </nav>

        {/* Vistas dinámicas */}
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Navigate to="/perfiles" replace />} />
            <Route path="/perfiles" element={<PerfilPage />} />
            <Route path="/servicios" element={<ServicioPage />} />
            <Route path="*" element={<Navigate to="/perfiles" replace />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;