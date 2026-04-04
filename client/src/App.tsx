import { BrowserRouter as Router, Route, Routes, Navigate} from 'react-router-dom';
import CreateMeet from './pages/CreateMeet';
import Room from './pages/Room';
import NotFoundPage from './pages/NotFoundPage';

function App() {
 return (
    <>
     <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/meet/new" replace />} />
        <Route path="/meet/new" element={<CreateMeet />} />
        <Route path="/meet/room/:roomId" element={<Room />}/>
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Router>
    </>
  )
}

export default App
