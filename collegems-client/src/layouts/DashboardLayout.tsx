import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";

export default function DashboardLayout() {
  return (
    <>
      <Navbar />
      <div className="pt-20 p-10 bg-gray-50 dark:bg-gray-950 min-h-screen">
        <Outlet />
      </div>
    </>
  );
}