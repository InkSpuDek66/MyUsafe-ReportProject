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
import { Bars3Icon, XMarkIcon, BellIcon, CheckIcon, TrashIcon } from "@heroicons/react/24/outline";
import { LogIn } from "lucide-react";
import { io } from 'socket.io-client';
import './Navbar.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const SOCKET_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

export default function Navbar() {
  const [token, setToken] = useState(null);
  const [role, setRole] = useState(null);
  const [userId, setUserId] = useState(null);
  const [profileImage, setProfileImage] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [socket, setSocket] = useState(null);
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    const storedRole = localStorage.getItem("role");
    const storedUserId = localStorage.getItem("userId") || localStorage.getItem("user_id");
    
    console.log('👤 User info:', { 
      storedUserId, 
      storedRole,
      hasToken: !!storedToken 
    });
    
    setToken(storedToken);
    setRole(storedRole);
    setUserId(storedUserId);

    if (storedToken && storedUserId) {
      fetchProfileImage(storedToken);
      fetchNotifications(storedUserId);
      
      // เชื่อมต่อ Socket.IO
      console.log('🔌 Connecting to socket:', SOCKET_URL);
      const socketConnection = io(SOCKET_URL, {
        transports: ['websocket', 'polling'], // ใช้ทั้ง websocket และ polling
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionAttempts: 5
      });
      
      socketConnection.on('connect', () => {
        console.log('✅ Socket connected:', socketConnection.id);
        console.log('📤 Joining room:', storedUserId);
        socketConnection.emit('join', storedUserId);
      });

      socketConnection.on('disconnect', (reason) => {
        console.log('❌ Socket disconnected:', reason);
      });

      socketConnection.on('connect_error', (error) => {
        console.error('❌ Socket connection error:', error);
      });

      // ฟัง new_notification event
      socketConnection.on('new_notification', (notification) => {
        console.log('🔔 New notification received:', notification);
        console.log('🔔 Notification type:', notification.type);
        console.log('🔔 Notification message:', notification.message);
        
        // อัพเดท state
        setNotifications(prev => {
          console.log('📝 Updating notifications, prev count:', prev.length);
          return [notification, ...prev];
        });
        
        setUnreadCount(prev => {
          console.log('📝 Updating unread count from', prev, 'to', prev + 1);
          return prev + 1;
        });
        
        // แสดง browser notification
        if (Notification.permission === 'granted') {
          console.log('🔔 Showing browser notification');
          new Notification('MyUSafe - การแจ้งเตือนใหม่', {
            
            body: notification.message,
            icon: '/MyUSafe_mini_none-bg_LOGO1.png'
          });socketConnection.onAny((eventName, ...args) => {
  console.log('📨 Socket event received:', eventName, args);
});
        } else if (Notification.permission === 'default') {
          console.log('❓ Requesting notification permission');
          Notification.requestPermission();
        }
      });

      // Test event เพื่อตรวจสอบว่า socket ทำงาน
      socketConnection.on('test', (data) => {
        console.log('🧪 Test event received:', data);
      });
      
      setSocket(socketConnection);
      
      return () => {
        console.log('🔌 Disconnecting socket...');
        socketConnection.off('new_notification');
        socketConnection.off('connect');
        socketConnection.off('disconnect');
        socketConnection.off('connect_error');
        socketConnection.off('test');
        socketConnection.disconnect();
      };
    } else {
      console.log('⚠️ No token or userId, skipping socket connection');
    }
  }, []);

  // ✅ เพิ่ม useEffect เพื่อฟังเหตุการณ์อัปเดตโปรไฟล์
  useEffect(() => {
    const handleProfileUpdate = (event) => {
      console.log('✅ profileUpdated event received in Navbar:', event.detail);
      
      if (event.detail?.profile_image) {
        setProfileImage(event.detail.profile_image);
      }
      if (event.detail?.name) {
        setUserName(event.detail.name);
      }
      if (event.detail?.email) {
        setUserEmail(event.detail.email);
      }
    };
    window.addEventListener('profileUpdated', handleProfileUpdate);
    return () => window.removeEventListener('profileUpdated', handleProfileUpdate);
  }, []);

  // ขอ permission สำหรับ browser notification
  useEffect(() => {
    if (token && Notification.permission === 'default') {
      Notification.requestPermission().then(permission => {
        console.log('🔔 Notification permission:', permission);
      });
    }
  }, [token]);

  const fetchProfileImage = async (authToken) => {
    try {
      const response = await fetch(`${API_URL}/profile`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      const data = await response.json();
      
      if (data.success && data.data) {
        setUserName(data.data.name || "");
        setUserEmail(data.data.email || "");
        
        if (data.data.profile_image) {
          setProfileImage(data.data.profile_image);
        }
        
        console.log("✅ Profile data loaded:", {
          name: data.data.name,
          email: data.data.email,
          role: data.data.role
        });
      }
    } catch (err) {
      console.error('Error fetching profile data:', err);
    }
  };

  const fetchNotifications = async (uid) => {
    try {
      console.log('📥 Fetching notifications for:', uid);
      const response = await fetch(`${API_URL}/notifications/${uid}?limit=20`);
      const data = await response.json();
      console.log('📥 Notifications fetched:', data);
      if (data.success) {
        setNotifications(data.data);
        setUnreadCount(data.unread_count);
      }
    } catch (err) {
      console.error('Error fetching notifications:', err);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      const response = await fetch(`${API_URL}/notifications/${notificationId}/read`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId })
      });
      
      if (response.ok) {
        setNotifications(prev =>
          prev.map(n => n._id === notificationId ? { ...n, is_read: true } : n)
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (err) {
      console.error('Error marking as read:', err);
    }
  };

  const markAllAsRead = async () => {
    try {
      const response = await fetch(`${API_URL}/notifications/read-all`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId })
      });
      
      if (response.ok) {
        setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
        setUnreadCount(0);
      }
    } catch (err) {
      console.error('Error marking all as read:', err);
    }
  };

  const deleteNotification = async (notificationId) => {
    try {
      const response = await fetch(`${API_URL}/notifications/${notificationId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId })
      });
      
      if (response.ok) {
        const wasUnread = notifications.find(n => n._id === notificationId)?.is_read === false;
        setNotifications(prev => prev.filter(n => n._id !== notificationId));
        if (wasUnread) {
          setUnreadCount(prev => Math.max(0, prev - 1));
        }
      }
    } catch (err) {
      console.error('Error deleting notification:', err);
    }
  };

const handleNotificationClick = (notification) => {
  console.log('🖱️ Notification clicked:', notification);
  if (!notification.is_read) {
    markAsRead(notification._id);
  }
  setShowNotifications(false);
  
  // ✅ ตรวจสอบว่าเป็น Staff หรือไม่ และ notification เป็นประเภท assigned
  if (role === 'staff' && notification.type === 'assigned') {
    // Staff ที่ได้รับมอบหมายงาน → ไปที่ AssignmentDetail
    navigate(`/assignment/${notification.complaint_id}`);
  } else {
    // User ปกติ → ไปที่ ComplaintDetail
    navigate(`/complaint/${notification.complaint_id}`);
  }
};

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'completed': return '✅';
      case 'assigned': return '👤';
      case 'status_change': return '🔄';
      case 'comment': return '💬';
      case 'cancelled': return '❌';
      default: return '📢';
    }
  };

  const formatTimeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    if (seconds < 60) return 'เมื่อสักครู่';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} นาทีที่แล้ว`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} ชั่วโมงที่แล้ว`;
    const days = Math.floor(hours / 24);
    return `${days} วันที่แล้ว`;
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("userId");
    localStorage.removeItem("user_id");
    localStorage.removeItem("email");
    setToken(null);
    setRole(null);
    setProfileImage(null);
    setNotifications([]);
    setUnreadCount(0);
    if (socket) {
      console.log('🔌 Logging out, disconnecting socket');
      socket.disconnect();
    }
    navigate("/");
    setUserName("");
    setUserEmail("");
    navigate("/");
  };

  const isActive = (href) => {
    if (href === '/') return location.pathname === '/';
    return location.pathname.startsWith(href);
  };

  const navigation = [
  { name: "หน้าหลัก", href: "/" },
  ...(role === 'admin' ? [
    { name: "สถิติ", href: "/admin/reports" },
    { name: "รายงานการปฏิบัติงาน", href: "/admin/staff-performance" },
    { name: "รายการเรื่องร้องเรียน", href: "/admin/complaint-list" },
    { name: "หมวดหมู่", href: "/admin/categories" }
  ] : []),
  ...(role === 'staff' ? [
    { name: "งานที่ถูกมอบหมาย", href: "/admin/assignments" }
  ] : []),
  { name: "ร้องเรียน", href: "/complaints/new" },
];

  const canSeeWork = role === 'staff';
  const baseItems = [
    { name: "โปรไฟล์", href: "/profile" },
    { name: "เรื่องร้องเรียนของฉัน", href: "/my-complaints" },
  ];
  const workItem = { name: "งานที่ถูกมอบหมาย", href: "/admin/assignments" };
  const signOutItem = { name: "ลงชื่อออก", onClick: handleLogout };
  const userNavigation = token
    ? [...baseItems, ...(canSeeWork ? [workItem] : []), signOutItem]
    : [];

  const getProfileImageUrl = () => {
    if (!profileImage) {
      return "https://cdn.pixabay.com/photo/2023/02/18/11/00/icon-7797704_640.png";
    }

    if (profileImage.startsWith('http://') || profileImage.startsWith('https://')) {
      return profileImage;
    }

    if (profileImage.startsWith('/')) {
      return `${API_URL.replace('/api', '')}${profileImage}`;
    }

    return `${API_URL.replace('/api', '')}/profile/${profileImage}`;
  };

  const user = {
    name: userName || "ผู้ใช้ระบบ",
    email: userEmail || "ไม่ระบุ",
    imageUrl: getProfileImageUrl(),
  };

  const NotificationButton = () => (
    <div className="relative">
      <button
        type="button"
        onClick={() => setShowNotifications(!showNotifications)}
        className="relative p-1 text-gray-700 rounded-full hover:text-white hover:bg-white/5 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-lime-400"
      >
        <span className="sr-only">View notifications</span>
        <BellIcon className="size-6" aria-hidden="true" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex items-center justify-center size-5 text-xs font-bold text-white bg-red-600 rounded-full ring-2 ring-lime-400">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Dropdown */}
      {showNotifications && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 z-50 max-h-[80vh] overflow-hidden flex flex-col">
          {/* Header */}
          <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between bg-gray-50">
            <h3 className="text-sm font-semibold text-gray-900">
              การแจ้งเตือน ({unreadCount})
            </h3>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-xs text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1"
              >
                <CheckIcon className="size-3" />
                อ่านทั้งหมด
              </button>
            )}
          </div>

          {/* Notifications List */}
          <div className="overflow-y-auto flex-1">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <BellIcon className="size-12 mx-auto mb-2 text-gray-300" />
                <p className="text-sm">ไม่มีการแจ้งเตือน</p>
              </div>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif._id}
                  className={`px-4 py-3 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors ${
                    !notif.is_read ? 'bg-blue-50' : ''
                  }`}
                  onClick={() => handleNotificationClick(notif)}
                >
                  <div className="flex items-start gap-3">
                    <span className="text-2xl flex-shrink-0">
                      {getNotificationIcon(notif.type)}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm ${!notif.is_read ? 'font-semibold text-gray-900' : 'text-gray-700'}`}>
                        {notif.message}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {formatTimeAgo(notif.created_at)}
                      </p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteNotification(notif._id);
                      }}
                      className="text-gray-400 hover:text-red-600 flex-shrink-0"
                    >
                      <TrashIcon className="size-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 }
        </div>
      )}
    </div>
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
              {token && <NotificationButton />}

              {!token && (
                <Link
                  to="/login"
                  className="flex items-center gap-2 bg-lime-600 hover:bg-lime-700 text-white font-medium rounded-md px-3 py-2 shadow-sm hover:shadow-md transition duration-300"
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
                      alt="Profile"
                      src={user.imageUrl}
                      className="border border-gray-200 size-8 rounded-full outline -outline-offset-1 outline-white/10 object-cover"
                      onError={(e) => {
                        e.target.src = "https://cdn.pixabay.com/photo/2023/02/18/11/00/icon-7797704_640.png";
                      }}
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
                  <img 
                    alt="Profile"
                    src={user.imageUrl}
                    className="size-10 rounded-full outline -outline-offset-1 outline-white/10 object-cover"
                    onError={(e) => {
                      e.target.src = "https://cdn.pixabay.com/photo/2023/02/18/11/00/icon-7797704_640.png";
                    }}
                  />
                  <div className="ml-3">
                    <div className="text-base font-medium text-white">{user.name}</div>
                    <div className="text-sm font-medium text-gray-700">{user.email}</div>
                  </div>
                  <div className="ml-auto">
                    <NotificationButton />
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
