import React from 'react';
function Header() {
  return (
    <header className="bg-white shadow-md p-4 flex justify-between items-center">
      <h1 className="text-xl font-bold text-blue-600">
        CareConnect
      </h1>

      <nav className="space-x-4">
        <a href="/" className="text-gray-700 hover:text-blue-600">
          Home
        </a>
        <a href="/booking" className="text-gray-700 hover:text-blue-600">
          Book
        </a>
      </nav>
    </header>
  );
}

export default Header;