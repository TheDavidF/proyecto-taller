import { Usuarios } from './Usuarios';
import { Vehiculos } from './Vehiculos';

function App() {
  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '30px' }}>
      <Usuarios />
      <Vehiculos />
    </div>
  );
}

export default App;