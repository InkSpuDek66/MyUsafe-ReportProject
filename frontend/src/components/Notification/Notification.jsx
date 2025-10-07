import { BellIcon } from "@heroicons/react/24/outline"

export default function Notification() {
    return (
        <>
            <button
                type="button"
                className="relative rounded-full p-1 text-gray-700 hover:text-white focus:outline-2 focus:outline-offset-2 focus:outline-indigo-500"
            >
                <span className="absolute -inset-1.5" />
                <span className="sr-only">View notifications</span>
                {/* Heroicon name: outline/bell */}
                <BellIcon aria-hidden="true" className="size-6" />
            </button>
        </>
    )
}