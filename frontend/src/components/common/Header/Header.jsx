export default function Header({name}) {
    return (
        <header className="relative bg-white after:content-[''] after:pointer-events-none after:absolute after:inset-x-0 after:inset-y-0 after:border-y-0 after:border-gray-200 shadow-md">
            <div className="mx-auto max-w-7xl px-4 py-2 sm:px-6 lg:px-8">
                <h1 className="text-xl font-bold tracking-tight text-gray-900">{name || "Header"}</h1>
            </div>
        </header>
    )
}