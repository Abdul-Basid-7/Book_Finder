import React from "react";


export default function Header() {
return (
<header className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md py-6 px-4">
<div className="max-w-4xl mx-auto text-center">
<h1 className="text-4xl font-extrabold drop-shadow-lg">BookFinder 📚</h1>
<p className="mt-2 text-lg opacity-90">
Discover books with style — powered by Open Library API
</p>
</div>
</header>
);
}