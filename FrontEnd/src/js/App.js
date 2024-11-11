import "../css/App.css";
import "../css/all.css";
import Dashboared from "./modules/Dashboared";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Formup from "./modules/Formup";
import UsersPhoto from "./modules/UsersPhoto";

const ProtectedRoute = ({ children, auth = false }) => {
  const isLoggedIn = localStorage.getItem("user:token") !== null || false;
  if (!isLoggedIn && auth) {
    return <Navigate to={"/users/sign_in"} />;
  } else if (
    isLoggedIn &&
    ["/users/sign_in", "/users/sign_up"].includes(window.location.pathname)
  ) {
    return <Navigate to={"/"} />;
  }
  return children;
};

function App() {
  return (
    <>
      <div className="contener">
        <Router>
          <Routes>
            <Route
              path="/users"
              element={
                <ProtectedRoute auth={true}>
                  <UsersPhoto />
                </ProtectedRoute>
              }
            />
            <Route
              path="/"
              element={
                <ProtectedRoute auth={true}>
                  <Dashboared />
                </ProtectedRoute>
              }
            />
            <Route
              path="/users/sign_in"
              element={
                <ProtectedRoute>
                  <Formup isLoggedIn={true} />
                </ProtectedRoute>
              }
            />
            <Route
              path="/users/sign_up"
              element={
                <ProtectedRoute>
                  <Formup isLoggedIn={false} />
                </ProtectedRoute>
              }
            />
          </Routes>
        </Router>
      </div>
    </>
  );
}

export default App;
