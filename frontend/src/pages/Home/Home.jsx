import Header from "../../components/Layouts/Header/Header"
export default function Home() {
    return (
        <>
            {/* <header className="relative bg-white after:pointer-events-none after:absolute after:inset-x-0 after:inset-y-0 after:border-y after:border-gray-200 shadow-md">
                <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
                    <h1 className="text-3xl font-bold tracking-tight text-gray-600">Dashboard</h1>
                </div>
            </header> */}
            <Header name="Dashboard"/>
            <main>
                <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
                    <h1 className="text-center">Home Page</h1>
                </div>
            </main>
        </>
    )
}