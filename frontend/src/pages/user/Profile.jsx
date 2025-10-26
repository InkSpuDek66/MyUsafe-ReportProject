// frontend/src/pages/user/Profile.jsx
import { useState, useEffect } from 'react';
import { Camera, User, Mail, Phone, Calendar, Shield, Lock, Eye, EyeOff } from 'lucide-react';
import axios from 'axios';

export default function Profile() {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [editing, setEditing] = useState(false);
    const [changingPassword, setChangingPassword] = useState(false);
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        phone: ''
    });
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [showPasswords, setShowPasswords] = useState({
        current: false,
        new: false,
        confirm: false
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_URL}/profile`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.data.success) {
                const userData = response.data.data;
                setProfile(userData);
                
                // แยกชื่อและนามสกุล
                const nameParts = userData.name ? userData.name.split(' ') : ['', ''];
                setFormData({
                    firstName: nameParts[0] || '',
                    lastName: nameParts.slice(1).join(' ') || '',
                    phone: userData.phone || ''
                });
            }
        } catch (err) {
            console.error('Error fetching profile:', err);
            setError('ไม่สามารถโหลดข้อมูลโปรไฟล์ได้');
        } finally {
            setLoading(false);
        }
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (file.size > 5 * 1024 * 1024) {
            setError('ไฟล์รูปภาพต้องมีขนาดไม่เกิน 5MB');
            return;
        }

        if (!file.type.startsWith('image/')) {
            setError('กรุณาเลือกไฟล์รูปภาพเท่านั้น');
            return;
        }

        setUploading(true);
        setError('');
        setSuccess('');

        try {
            const token = localStorage.getItem('token');
            const formData = new FormData();
            formData.append('profileImage', file);

            const response = await axios.post(`${API_URL}/profile/image`, formData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            });

            if (response.data.success) {
                setProfile(prev => ({
                    ...prev,
                    profile_image: response.data.data.profile_image
                }));
                setSuccess('อัปเดตรูปโปรไฟล์สำเร็จ');
                setTimeout(() => setSuccess(''), 3000);
                
                // Reload Navbar เพื่ออัปเดตรูป
                window.dispatchEvent(new Event('profileImageUpdated'));
            }
        } catch (err) {
            console.error('Error uploading image:', err);
            setError(err.response?.data?.error || 'เกิดข้อผิดพลาดในการอัปโหลดรูปภาพ');
        } finally {
            setUploading(false);
        }
    };

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        const fullName = `${formData.firstName} ${formData.lastName}`.trim();
        
        if (!fullName) {
            setError('กรุณากรอกชื่อ-นามสกุล');
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const response = await axios.put(`${API_URL}/profile`, {
                name: fullName,
                phone: formData.phone
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.data.success) {
                setSuccess('อัปเดตข้อมูลสำเร็จ');
                setEditing(false);
                fetchProfile();
                setTimeout(() => setSuccess(''), 3000);
            }
        } catch (err) {
            console.error('Error updating profile:', err);
            setError(err.response?.data?.error || 'เกิดข้อผิดพลาดในการอัปเดตข้อมูล');
        }
    };

    const handleChangePassword = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        // Validation
        if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
            setError('กรุณากรอกข้อมูลให้ครบทุกช่อง');
            return;
        }

        if (passwordData.newPassword.length < 6) {
            setError('รหัสผ่านใหม่ต้องมีอย่างน้อย 6 ตัวอักษร');
            return;
        }

        if (passwordData.newPassword !== passwordData.confirmPassword) {
            setError('รหัสผ่านใหม่ไม่ตรงกัน');
            return;
        }

        if (passwordData.currentPassword === passwordData.newPassword) {
            setError('รหัสผ่านใหม่ต้องไม่ซ้ำกับรหัสผ่านเดิม');
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const response = await axios.put(`${API_URL}/profile/password`, {
                currentPassword: passwordData.currentPassword,
                newPassword: passwordData.newPassword
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.data.success) {
                setSuccess('เปลี่ยนรหัสผ่านสำเร็จ');
                setChangingPassword(false);
                setPasswordData({
                    currentPassword: '',
                    newPassword: '',
                    confirmPassword: ''
                });
                setTimeout(() => setSuccess(''), 3000);
            }
        } catch (err) {
            console.error('Error changing password:', err);
            setError(err.response?.data?.error || 'เกิดข้อผิดพลาดในการเปลี่ยนรหัสผ่าน');
        }
    };

    const getRoleLabel = (role) => {
        const roles = {
            admin: 'ผู้ดูแลระบบ',
            staff: 'เจ้าหน้าที่',
            reporter: 'ผู้ใช้งาน'
        };
        return roles[role] || role;
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('th-TH', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const togglePasswordVisibility = (field) => {
        setShowPasswords(prev => ({
            ...prev,
            [field]: !prev[field]
        }));
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-lime-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600">กำลังโหลดข้อมูล...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-6">
                    <h1 className="text-3xl font-bold text-gray-900">โปรไฟล์</h1>
                    <p className="mt-1 text-sm text-gray-600">จัดการข้อมูลส่วนตัวของคุณ</p>
                </div>

                {/* Alert Messages */}
                {error && (
                    <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                        {error}
                    </div>
                )}
                {success && (
                    <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
                        {success}
                    </div>
                )}

                {/* Profile Card */}
                <div className="bg-white rounded-lg shadow overflow-hidden mb-6">
                    {/* Profile Image Section */}
                    <div className="bg-gradient-to-r from-lime-400 to-lime-500 px-6 py-8">
                        <div className="flex flex-col items-center">
                            <div className="relative">
                                <div className="w-32 h-32 rounded-full border-4 border-white shadow-lg overflow-hidden bg-gray-200">
                                    {profile?.profile_image ? (
                                        <img
                                            src={`${API_URL.replace('/api', '')}${profile.profile_image}`}
                                            alt="Profile"
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-gray-300">
                                            <User className="w-16 h-16 text-gray-500" />
                                        </div>
                                    )}
                                </div>
                                <label
                                    htmlFor="profile-image-upload"
                                    className="absolute bottom-0 right-0 bg-white rounded-full p-2 shadow-lg cursor-pointer hover:bg-gray-50 transition"
                                >
                                    {uploading ? (
                                        <div className="w-5 h-5 border-2 border-lime-400 border-t-transparent rounded-full animate-spin" />
                                    ) : (
                                        <Camera className="w-5 h-5 text-gray-700" />
                                    )}
                                </label>
                                <input
                                    id="profile-image-upload"
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageUpload}
                                    className="hidden"
                                    disabled={uploading}
                                />
                            </div>
                            <h2 className="mt-4 text-2xl font-bold text-white">{profile?.name}</h2>
                            <div className="mt-2 flex items-center gap-2 bg-white/20 px-3 py-1 rounded-full">
                                <Shield className="w-4 h-4 text-white" />
                                <span className="text-sm text-white font-medium">
                                    {getRoleLabel(profile?.role)}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Profile Info Section */}
                    <div className="px-6 py-6">
                        {!editing && !changingPassword ? (
                            <>
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3 pb-4 border-b border-gray-200">
                                        <Mail className="w-5 h-5 text-gray-400" />
                                        <div>
                                            <p className="text-sm text-gray-500">อีเมล</p>
                                            <p className="text-gray-900 font-medium">{profile?.email}</p>
                                        </div>
                                    </div>

                                    {profile?.phone && (
                                        <div className="flex items-center gap-3 pb-4 border-b border-gray-200">
                                            <Phone className="w-5 h-5 text-gray-400" />
                                            <div>
                                                <p className="text-sm text-gray-500">เบอร์โทรศัพท์</p>
                                                <p className="text-gray-900 font-medium">{profile.phone}</p>
                                            </div>
                                        </div>
                                    )}

                                    <div className="flex items-center gap-3 pb-4">
                                        <Calendar className="w-5 h-5 text-gray-400" />
                                        <div>
                                            <p className="text-sm text-gray-500">สมาชิกเมื่อ</p>
                                            <p className="text-gray-900 font-medium">
                                                {formatDate(profile?.created_at)}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-6 flex gap-3">
                                    <button
                                        onClick={() => setEditing(true)}
                                        className="flex-1 bg-lime-400 hover:bg-lime-500 text-gray-900 font-medium py-2 px-4 rounded-lg transition"
                                    >
                                        แก้ไขข้อมูล
                                    </button>
                                    <button
                                        onClick={() => setChangingPassword(true)}
                                        className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium py-2 px-4 rounded-lg transition flex items-center justify-center gap-2"
                                    >
                                        <Lock className="w-4 h-4" />
                                        เปลี่ยนรหัสผ่าน
                                    </button>
                                </div>
                            </>
                        ) : editing ? (
                            <form onSubmit={handleUpdateProfile} className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            ชื่อ <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.firstName}
                                            onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-lime-400 focus:border-transparent"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            นามสกุล <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.lastName}
                                            onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-lime-400 focus:border-transparent"
                                            required
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        เบอร์โทรศัพท์
                                    </label>
                                    <input
                                        type="tel"
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-lime-400 focus:border-transparent"
                                    />
                                </div>

                                <div className="flex gap-3 pt-4">
                                    <button
                                        type="submit"
                                        className="flex-1 bg-lime-400 hover:bg-lime-500 text-gray-900 font-medium py-2 px-4 rounded-lg transition"
                                    >
                                        บันทึก
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setEditing(false);
                                            const nameParts = profile?.name ? profile.name.split(' ') : ['', ''];
                                            setFormData({
                                                firstName: nameParts[0] || '',
                                                lastName: nameParts.slice(1).join(' ') || '',
                                                phone: profile?.phone || ''
                                            });
                                        }}
                                        className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium py-2 px-4 rounded-lg transition"
                                    >
                                        ยกเลิก
                                    </button>
                                </div>
                            </form>
                        ) : (
                            <form onSubmit={handleChangePassword} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        รหัสผ่านปัจจุบัน <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <input
                                            type={showPasswords.current ? "text" : "password"}
                                            value={passwordData.currentPassword}
                                            onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                                            className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-lime-400 focus:border-transparent"
                                            required
                                        />
                                        <button
                                            type="button"
                                            onClick={() => togglePasswordVisibility('current')}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                        >
                                            {showPasswords.current ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                        </button>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        รหัสผ่านใหม่ <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <input
                                            type={showPasswords.new ? "text" : "password"}
                                            value={passwordData.newPassword}
                                            onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                                            className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-lime-400 focus:border-transparent"
                                            required
                                            minLength={6}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => togglePasswordVisibility('new')}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                        >
                                            {showPasswords.new ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                        </button>
                                    </div>
                                    <p className="mt-1 text-xs text-gray-500">รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร</p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        ยืนยันรหัสผ่านใหม่ <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <input
                                            type={showPasswords.confirm ? "text" : "password"}
                                            value={passwordData.confirmPassword}
                                            onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                                            className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-lime-400 focus:border-transparent"
                                            required
                                        />
                                        <button
                                            type="button"
                                            onClick={() => togglePasswordVisibility('confirm')}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                        >
                                            {showPasswords.confirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                        </button>
                                    </div>
                                </div>

                                <div className="flex gap-3 pt-4">
                                    <button
                                        type="submit"
                                        className="flex-1 bg-lime-400 hover:bg-lime-500 text-gray-900 font-medium py-2 px-4 rounded-lg transition"
                                    >
                                        เปลี่ยนรหัสผ่าน
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setChangingPassword(false);
                                            setPasswordData({
                                                currentPassword: '',
                                                newPassword: '',
                                                confirmPassword: ''
                                            });
                                            setShowPasswords({
                                                current: false,
                                                new: false,
                                                confirm: false
                                            });
                                        }}
                                        className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium py-2 px-4 rounded-lg transition"
                                    >
                                        ยกเลิก
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}