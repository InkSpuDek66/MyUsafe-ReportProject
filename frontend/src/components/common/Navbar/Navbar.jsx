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
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";
import { LogIn } from "lucide-react";
import NotificationBell from "../../NotificationBell/NotificationBell";





import './Navbar.css'

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

export default function Navbar() {
  const [token, setToken] = useState(null);
  const [role, setRole] = useState(null);
  const [profileImage, setProfileImage] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    const storedRole = localStorage.getItem("role");
    setToken(storedToken);
    setRole(storedRole);

    // โหลดรูปโปรไฟล์
    if (storedToken) {
      fetchProfileImage(storedToken);
    }

    console.log("Navbar: Loaded role:", storedRole);
  }, []);

  // ✅ เพิ่ม useEffect เพื่อฟัง event การอัปเดตโปรไฟล์
  useEffect(() => {
    const handleProfileUpdate = (event) => {
      if (event.detail?.profile_image) {
        setProfileImage(event.detail.profile_image);
      }
    };

    // ฟัง custom event
    window.addEventListener('profileUpdated', handleProfileUpdate);

    // Cleanup
    return () => {
      window.removeEventListener('profileUpdated', handleProfileUpdate);
    };
  }, []);

  const fetchProfileImage = async (authToken) => {
    try {
      const response = await fetch(`${API_URL}/profile`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      const data = await response.json();
      if (data.success && data.data.profile_image) {
        setProfileImage(data.data.profile_image);
      }
    } catch (err) {
      console.error('Error fetching profile image:', err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("userId");
    setToken(null);
    setRole(null);
    setProfileImage(null);
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
    
    ...(role === 'admin' ? [
      { name: "Admin Reports", href: "/admin/reports" },
      { name: "Staff Performance", href: "/admin/staff-performance" },
      { name: "Complaint List", href: "/admin/complaint-list" }
    ] : []),
    
    ...(role === 'admin' || role === 'staff' ? [
      { name: "Assignments", href: "/admin/assignments" }
    ] : []),
    
    { name: "Reports", href: "/complaints/new" },
  ];

  const canSeeWork = role === 'admin' || role === 'staff';

  const baseItems = [
    { name: "Your profile", href: "/profile" },
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
    imageUrl: profileImage 
      ? `${API_URL.replace('/api', '')}${profileImage}`
      : "https://cdn.pixabay.com/photo/2023/02/18/11/00/icon-7797704_640.png",
  };

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
              {/* ✅ NotificationBell - แทนที่ NotificationPlaceholder */}
              {token && <NotificationBell />}

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
                      className="border border-gray-200 size-8 rounded-full outline -outline-offset-1 outline-white/10 object-cover"
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
                  <img alt="" src={user.imageUrl} className="size-10 rounded-full outline -outline-offset-1 outline-white/10 object-cover" />
                  <div className="ml-3">
                    <div className="text-base font-medium text-white">{user.name}</div>
                    <div className="text-sm font-medium text-gray-700">{user.email}</div>
                  </div>
                  <div className="ml-auto">
                    {/* ✅ NotificationBell - บน Mobile */}
                    <NotificationBell />
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