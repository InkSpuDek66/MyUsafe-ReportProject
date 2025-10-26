import { useState, useEffect } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import {
  Disclosure,
  DisclosureButton,
  DisclosurePanel,
  Menu,
  MenuButton,
  MenuItem,
  MenuItems,
} from "@headlessui/react";
import { Bars3Icon, XMarkIcon, BellIcon } from "@heroicons/react/24/outline";
import { LogIn } from "lucide-react";
import './Navbar.css'

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

export default function Navbar() {
  const [token, setToken] = useState(null);
  const [role, setRole] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    const storedRole = localStorage.getItem("role");
    setToken(storedToken);
    setRole(storedRole);

    console.log("Navbar: Loaded role:", storedRole);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("userId");
    setToken(null);
    setRole(null);
    navigate("/login");
  };

  const isActive = (href) => {
    if (href === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(href);
  };

  const navigation = [
    { name: "Dashboard", href: "/" },
    
    // ✅ Admin เท่านั้น - เห็นเมนูเหล่านี้
    ...(role === 'admin' ? [
      { name: "Admin Reports", href: "/admin/reports" },
      { name: "Staff Performance", href: "/admin/staff-performance" },
      { name: "Complaint List", href: "/admin/complaint-list" }
    ] : []),
    
    // ✅ Assignments - เฉพาะ admin และ staff
    ...(role === 'admin' || role === 'staff' ? [
      { name: "Assignments", href: "/admin/assignments" }
    ] : []),
    
    { name: "Reports", href: "/complaints/new" },
  ];

  const canSeeWork = role === 'admin' || role === 'staff';

  const baseItems = [
    { name: "Your profile", href: "#" },
    { name: "My Complains", href: "/my-complaints" },
  ];

  const workItem = { name: "Assignments", href: "/admin/assignments" };

  const signOutItem = { name: "Sign out", onClick: handleLogout };

  const userNavigation = token
    ? [
      ...baseItems,
      ...(canSeeWork ? [workItem] : []),
      signOutItem,
    ]
    : [];

  const user = {
    name: "User Name",
    email: "user@example.com",
    imageUrl:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
  };

  const NotificationPlaceholder = () => (
    <button
      type="button"
      className="relative p-1 text-gray-700 rounded-full hover:text-white hover:bg-white/5 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-lime-400"
    >
      <span className="sr-only">View notifications</span>
      <BellIcon className="size-6" aria-hidden="true" />
      <span className="absolute top-0 right-0 size-2.5 rounded-full bg-red-600 ring-2 ring-lime-400"></span>
    </button>
  );

  return (
    <div className="min-h-full">
      <Disclosure as="nav" className="bg-lime-400 shadow">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Left - Logo Section */}
            <div className="flex items-center">
              <div className="flex items-center text-xl font-extrabold">
                <a href="#" target="_blank">
                  <span className="myusafe-logo text-shadow-lg text-shadow-white/10">
                    <span className="part1">MyU</span><span className="part2">Safe</span>
                    <span className="underline-u "></span>
                  </span>
                </a>
                <p className="text-sm text-white ml-2">x</p>
                <a href="https://www.spu.ac.th/" target="_blank" rel="noreferrer">
                  <img className="h-6 w-auto ml-1" src="/New_logo_spu_1.png" alt="Logo_university" />
                </a>
              </div>

              {/* Navigation - Desktop */}
              <div className="hidden lg:block">
                <div className="ml-10 flex items-baseline space-x-4">
                  {navigation.map((item) => (
                    <Link
                      key={item.name}
                      to={item.href}
                      className={classNames(
                        isActive(item.href)
                          ? "bg-gray-950/50 text-white"
                          : "text-gray-700 hover:bg-white/5 hover:text-white",
                        "rounded-md px-3 py-2 text-sm font-medium transition-colors duration-200"
                      )}
                    >
                      {item.name}
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            {/* Right */}
            <div className="hidden lg:flex items-center md:ml-6 gap-3">
              {token && <NotificationPlaceholder />}

              {!token && (
                <Link
                  to="/login"
                  className="
                    flex items-center gap-2
                    bg-lime-600 hover:bg-lime-700
                    text-white font-medium
                    rounded-md px-3 py-2
                    shadow-sm hover:shadow-md
                    transition duration-300
                  "
                >
                  <LogIn className="w-4 h-4" />
                  Login
                </Link>
              )}

              {token && (
                <Menu as="div" className="relative ml-3">
                  <MenuButton className="relative flex max-w-xs items-center rounded-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500">
                    <span className="sr-only">Open user menu</span>
                    <img
                      alt=""
                      src={user.imageUrl}
                      className="border border-gray-200 size-8 rounded-full outline -outline-offset-1 outline-white/10"
                    />
                  </MenuButton>
                  <MenuItems
                    transition
                    className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-gray-800 py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
                  >
                    {userNavigation.map((item, index) =>
                      item.onClick ? (
                        <MenuItem
                          key={item.name + index}
                          as="button"
                          onClick={item.onClick}
                          className="block w-full text-left px-4 py-2 text-sm text-gray-300 data-[focus]:bg-gray-700 hover:bg-white/5"
                        >
                          {item.name}
                        </MenuItem>
                      ) : (
                        <MenuItem
                          key={item.name + index}
                          as={Link}
                          to={item.href}
                          className="block px-4 py-2 text-sm text-gray-300 data-[focus]:bg-gray-700 hover:bg-white/5"
                        >
                          {item.name}
                        </MenuItem>
                      )
                    )}
                  </MenuItems>
                </Menu>
              )}
            </div>

            {/* Mobile Menu Button */}
            <div className="-mr-2 flex lg:hidden">
              <DisclosureButton className="group inline-flex items-center justify-center rounded-md p-2 text-gray-700 hover:bg-white/5 hover:text-white focus:outline-2 focus:outline-offset-2 focus:outline-indigo-500">
                <span className="sr-only">Open main menu</span>
                <Bars3Icon className="block size-6 group-data-open:hidden" />
                <XMarkIcon className="hidden size-6 group-data-open:block" />
              </DisclosureButton>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <DisclosurePanel className="lg:hidden">
          <div className="space-y-1 px-2 pt-2 pb-3 sm:px-3">
            {navigation.map((item) => (
              <DisclosureButton
                key={item.name}
                as={Link}
                to={item.href}
                className={classNames(
                  isActive(item.href)
                    ? "bg-gray-950/50 text-white"
                    : "text-gray-700 hover:bg-white/5 hover:text-white",
                  "block rounded-md px-3 py-2 text-base font-medium transition-colors duration-200"
                )}
              >
                {item.name}
              </DisclosureButton>
            ))}
          </div>

          <div className="border-t border-white/10 pt-4 pb-3">
            <div className="flex items-center px-5">
              {token && (
                <>
                  <img alt="" src={user.imageUrl} className="size-10 rounded-full outline -outline-offset-1 outline-white/10" />
                  <div className="ml-3">
                    <div className="text-base font-medium text-white">{user.name}</div>
                    <div className="text-sm font-medium text-gray-700">{user.email}</div>
                  </div>
                  <div className="ml-auto">
                    <NotificationPlaceholder />
                  </div>
                </>
              )}
            </div>

            <div className="mt-3 space-y-1 px-2">
              {token && userNavigation.filter(item => item.name !== 'Sign out').map((item, index) => (
                <DisclosureButton
                  key={item.name + index}
                  as={Link}
                  to={item.href}
                  className="block rounded-md px-3 py-2 text-base font-medium text-gray-700 hover:bg-white/5 hover:text-white"
                >
                  {item.name}
                </DisclosureButton>
              ))}

              {token && (
                <DisclosureButton
                  as="button"
                  onClick={handleLogout}
                  className="block w-full text-left rounded-md px-3 py-2 text-base font-medium text-red-400 hover:bg-red-500/10 hover:text-red-300"
                >
                  Sign out
                </DisclosureButton>
              )}
            </div>

            {!token && (
              <div className="mt-3 space-y-1 px-2">
                <Link
                  to="/login"
                  className="flex items-center gap-2 bg-lime-600 hover:bg-lime-700 text-white rounded-md px-3 py-2 text-base font-medium shadow-sm hover:shadow-md transition"
                >
                  <LogIn className="w-4 h-4" />
                  Login
                </Link>
              </div>
            )}
          </div>
        </DisclosurePanel>
      </Disclosure>
    </div>
  );
}