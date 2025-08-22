import { Outlet } from "react-router-dom";


const UI = () => {
  return (
    <div>
      <header>
        <h1>Movie App</h1>
      </header>
      <Outlet/>
      <footer>Movie App 2025.</footer>
    </div>
  );
};

export default UI;
