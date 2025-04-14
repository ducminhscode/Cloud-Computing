import './App.css';
import Home from './component/Home';
import LoginPage from './component/Login';
import Register from './component/Register';

function App() {
  return (
    <div>
      <LoginPage />
      <Home/>
      <Register/>
    </div>
  );
}

export default App;
