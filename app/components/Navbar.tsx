import { NavLink } from "react-router";


export default function Navbar() {
  const linkStyle = ({ isActive }: { isActive: boolean }) =>
    isActive ? "text-orange-300 font-semibold" : "text-gray-600";

  return (
    <div className="fixed top-0 left-0 w-full left-0 z-1">
    <nav className="mx-8 py-3 flex justify-between items-center">
      <h2 className="font-bold text-xl"></h2>
    <div className="flex gap-6">
      <nav className="flex gap-6 p-4 ">
        <NavLink to="/" className={linkStyle}>Home</NavLink>
        <NavLink to="/gallery" className={linkStyle}>Gallery</NavLink>
        <NavLink to="/book" className={linkStyle}>Book a Session</NavLink>
        <NavLink to="/landscapes" className={linkStyle}>Landscapes</NavLink>
        <NavLink to="/portraits" className={linkStyle}>Portraits</NavLink>
       
    </nav>
    </div>
    </nav>
   
    </div>
  );
}
