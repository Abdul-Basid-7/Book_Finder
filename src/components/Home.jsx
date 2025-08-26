import React, { useEffect, useState, useRef } from "react";


const COVER_URL = (cover_i, size = "M") =>
    cover_i
        ? `https://covers.openlibrary.org/b/id/${cover_i}-${size}.jpg`
        : `https://via.placeholder.com/150x220?text=No+Cover`;


export default function Home() {
    const [query, setQuery] = useState("");
    const [authorFilter, setAuthorFilter] = useState("");
    const [minYear, setMinYear] = useState(0);
    const [hasEbook, setHasEbook] = useState(false);
    const [page, setPage] = useState(1);
    const [results, setResults] = useState([]);
    const [numFound, setNumFound] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [selected, setSelected] = useState(null);
    const [favorites, setFavorites] = useState(() => {
        try {
            const raw = localStorage.getItem("bf_favorites_v1");
            return raw ? JSON.parse(raw) : {};
        } catch (e) {
            return {};
        }
    });

    const inputRef = useRef(null);

    useEffect(() => {
        localStorage.setItem("bf_favorites_v1", JSON.stringify(favorites));
    }, [favorites]);


    const buildUrl = (q, p = 1) => {
        const base = "https://openlibrary.org/search.json";
        const params = new URLSearchParams();
        if (!q || q.trim() === "") return null;
        params.set("title", q);
        params.set("page", p.toString());
        params.set(
            "fields",
            [
                "title",
                "author_name",
                "cover_i",
                "first_publish_year",
                "publisher",
                "isbn",
                "subject",
                "ebook_count_i",
            ].join(",")
        );
        params.set("limit", "9");
        return `${base}?${params.toString()}`;
    };

    const search = async (p = 1) => {
        const url = buildUrl(query, p);
        if (!url) return;
        setLoading(true);
        setError("");
        try {
            const res = await fetch(url);
            if (!res.ok) throw new Error(`API error: ${res.status}`);
            const data = await res.json();
            let docs = data.docs || [];
            if (authorFilter.trim()) {
                const af = authorFilter.toLowerCase();
                docs = docs.filter((d) =>
                    (d.author_name || []).some((a) => a.toLowerCase().includes(af))
                );
            }
            if (minYear) {
                docs = docs.filter(
                    (d) => d.first_publish_year && d.first_publish_year >= minYear
                );
            }
            if (hasEbook) {
                docs = docs.filter((d) => d.ebook_count_i && d.ebook_count_i > 0);
            }
            setResults(docs);
            setNumFound(data.numFound || 0);
            setPage(p);
        } catch (err) {
            setError(err.message || "Failed to fetch");
        } finally {
            setLoading(false);
        }
    };
    const handleSubmit = (e) => {
        e && e.preventDefault();
        if (!query.trim()) return;
        search(1);
    };


    const toggleFavorite = (doc) => {
        const key = doc.key || `${doc.title}-${doc.cover_i || "nocover"}`;
        setFavorites((prev) => {
            const copy = { ...prev };
            if (copy[key]) delete copy[key];
            else
                copy[key] = {
                    title: doc.title,
                    cover_i: doc.cover_i,
                    author_name: doc.author_name,
                };
            return copy;
        });
    };

    const isFav = (doc) => {
        const key = doc.key || `${doc.title}-${doc.cover_i || "nocover"}`;
        return Boolean(favorites[key]);
    };


    useEffect(() => {
        if (inputRef.current) inputRef.current.focus();
    }, []);

    return (
        <main  className="flex flex-col min-h-screen items-center justify-center bg-cover bg-center p-6"
                style={{
            backgroundImage: "linear-gradient(to right, rgba(67,56,202,0.85), rgba(147,51,234,0.85)), url('https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=1600&q=80')",
                     }}>
            {/* Search form */}
            <form
                onSubmit={handleSubmit}
                className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-8 bg-white rounded-xl shadow-lg p-4"
            >
                <input
                    ref={inputRef}
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search book title..."
                    className="md:col-span-2 w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-indigo-500"
                />


                <input
                    value={authorFilter}
                    onChange={(e) => setAuthorFilter(e.target.value)}
                    placeholder="Filter by author"
                    className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-indigo-500"
                />
                <div className="flex gap-2">
                    <button
                        type="submit"
                        className="flex-1 bg-gradient-to-r from-indigo-500 to-purple-500 text-white px-3 py-2 rounded-lg shadow hover:opacity-90 transition"
                    >
                        Search
                    </button>

                    <button
                        type="button"
                        onClick={() => {
                            setQuery("");
                            setAuthorFilter("");
                            setMinYear(0);
                            setHasEbook(false);
                            setResults([]);
                            setNumFound(0);
                        }}
                        className="flex-1 bg-gray-200 px-3 py-2 rounded-lg hover:bg-gray-300 transition"
                    >
                        Clear
                    </button>
                </div>
                <div className="md:col-span-4 flex flex-wrap gap-4 mt-3 items-center text-sm">
                    <div className="flex items-center gap-2">
                        <label>Min year:</label>
                        <input
                            type="number"
                            value={minYear || ""}
                            onChange={(e) => setMinYear(Number(e.target.value) || 0)}
                            className="w-24 border rounded p-2"
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <input
                            id="ebook"
                            type="checkbox"
                            checked={hasEbook}
                            onChange={(e) => setHasEbook(e.target.checked)}
                        />
                        <label htmlFor="ebook">Only ebooks</label>
                    </div>
                    <div className="ml-auto">Results: {numFound}</div>
                </div>
            </form>


            {/* Results */}
            {loading && <div className="text-center text-white py-8 animate-pulse">🔎 Searching...</div>}
            {error && (
                <div className="bg-red-100 text-red-800 p-3 rounded mb-4 text-center">
                    {error}
                </div>
            )}


            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {results.map((doc, idx) => (
                    <article
                        key={`${doc.key || doc.title}-${idx}`}
                        className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition transform hover:-translate-y-1 flex flex-col"
                    >
                        <img
                            src={COVER_URL(doc.cover_i)}
                            alt={`${doc.title} cover`}
                            className="w-full h-52 object-cover"
                        />
                        <div className="p-4 flex-1 flex flex-col">
                            <h2 className="font-bold text-lg mb-1 text-indigo-700">
                                {doc.title}
                            </h2>
                            <p className="text-sm text-gray-600">
                                {(doc.author_name || []).slice(0, 2).join(", ")}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                                First publish: {doc.first_publish_year || "—"}
                            </p>


                            <div className="mt-auto flex justify-between items-center pt-3">
                                <button
                                    onClick={() => setSelected(doc)}
                                    className="text-indigo-600 text-sm font-medium hover:underline"
                                >
                                    Details
                                </button>

                                <button
                                    onClick={() => toggleFavorite(doc)}
                                    className={`text-sm px-2 py-1 rounded-lg transition ${isFav(doc)
                                            ? "bg-yellow-200 text-yellow-900"
                                            : "bg-gray-100 hover:bg-gray-200"
                                        }`}
                                >
                                    {isFav(doc) ? "★ Favorited" : "☆ Favorite"}
                                </button>
                            </div>
                        </div>
                    </article>
                ))}
            </div>

            {numFound > 0 && (
                <div className="flex items-center justify-center gap-4 mt-8">
                    <button
                        onClick={() => page > 1 && search(page - 1)}
                        disabled={page <= 1}
                        className="px-4 py-2 rounded-lg bg-indigo-100 hover:bg-indigo-200 disabled:opacity-50"
                    >
                        Prev
                    </button>
                    <div className="text-white">Page {page}</div>
                    <button
                        onClick={() => search(page + 1)}
                        disabled={results.length === 0}
                        className="px-4 py-2 rounded-lg bg-indigo-100 hover:bg-indigo-200 disabled:opacity-50"
                    >
                        Next
                    </button>
                </div>
            )}


        </main>
    );
}
