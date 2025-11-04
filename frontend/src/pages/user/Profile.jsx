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

            // ✅ ถ้าเป็น OAuth URL ให้ดาวน์โหลดที่ Backend
            if (userData.profile_image && 
                (userData.profile_image.startsWith('http://') || userData.profile_image.startsWith('https://'))) {
                
                console.log('📥 Detected OAuth image, downloading to server...');
                
                try {
                    const downloadRes = await axios.post(
                        `${API_URL}/profile/download-oauth-image`,
                        { imageUrl: userData.profile_image },
                        { headers: { Authorization: `Bearer ${token}` } }
                    );

                    if (downloadRes.data.success) {
                        console.log('✅ OAuth image downloaded successfully');
                        // อัปเดต state ด้วย local path
                        setProfile(prev => ({
                            ...prev,
                            profile_image: downloadRes.data.data.profile_image
                        }));
                    }
                } catch (err) {
                    console.warn('⚠️ Failed to download OAuth image:', err);
                    // ยังใช้ OAuth URL ได้ ถึงแม้ดาวน์โหลดไม่ได้
                }
            }

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

    // ✅ ฟังก์ชันสำหรับสร้าง Profile Image URL
    // ✅ แทนที่ฟังก์ชันนี้ใน Profile.jsx (line ~190-200)

const getProfileImageUrl = () => {
    if (!profile?.profile_image) {
        console.log('⚠️ No profile_image');
        return null;
    }

    const imageUrl = profile.profile_image;
    console.log('🖼️ Raw profile_image:', imageUrl);

    // ✅ ถ้าเป็น URL เต็ม (OAuth หรือ http/https)
    if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
        console.log('✅ Using OAuth/HTTP URL directly:', imageUrl);
        return imageUrl;
    }

    // ✅ ถ้าเป็น path ของเซิร์ฟเวอร์ (เช่น /profile/...)
    if (imageUrl.startsWith('/')) {
        const fullUrl = `http://localhost:5000${imageUrl}`;
        console.log('✅ Server path detected, full URL:', fullUrl);
        return fullUrl;
    }

    // ✅ Fallback
    const fallbackUrl = `http://localhost:5000/profile/${imageUrl}`;
    console.log('⚠️ Using fallback URL:', fallbackUrl);
    return fallbackUrl;
};
    if (loading) {
        return (
            <div className="min-h-screen bg-base-200 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-[#55C388] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-base-content/70">กำลังโหลดข้อมูล...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-base-200 py-8">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-6">
                    <h1 className="text-3xl font-bold text-base-content">โปรไฟล์</h1>
                    <p className="mt-1 text-sm text-base-content/70">จัดการข้อมูลส่วนตัวของคุณ</p>
                </div>
                
                {/* Alert Messages */}
                {error && (
                    <div className="alert alert-error mb-6">
                        <span>{error}</span>
                    </div>
                )}
                {success && (
                    <div className="alert alert-success mb-6">
                        <span>{success}</span>
                    </div>
                )}

                {/* Profile Card */}
                <div className="card bg-base-100 shadow-xl mb-6">
                    {/* Profile Image Section */}
                    <div className="bg-gradient-to-r from-[#55C388] to-[#43A874] px-6 py-8 rounded-t-2xl">
                        <div className="flex flex-col items-center">
                            <div className="relative">
                                <div className="w-32 h-32 rounded-full border-4 border-base-100 shadow-lg overflow-hidden bg-base-300">
                                    {/* ✅ แสดงรูปจาก OAuth หรือเซิร์ฟเวอร์ */}
                                    {getProfileImageUrl() ? (
                                        <img
                                            src={getProfileImageUrl()}
                                            alt="Profile"
                                            className="w-full h-full object-cover"
                                            onError={(e) => {
                                                console.error('Error loading image:', e);
                                                e.target.style.display = 'none';
                                            }}
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-base-300">
                                            <User className="w-16 h-16 text-base-content/40" />
                                        </div>
                                    )}
                                </div>
                                <label
                                    htmlFor="profile-image-upload"
                                    className="absolute bottom-0 right-0 btn btn-circle btn-sm bg-base-100 hover:bg-base-200 border-0 shadow-lg"
                                >
                                    {uploading ? (
                                        <div className="w-5 h-5 border-2 border-[#55C388] border-t-transparent rounded-full animate-spin" />
                                    ) : (
                                        <Camera className="w-5 h-5 text-base-content" />
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
                    <div className="card-body">
                        {!editing && !changingPassword ? (
                            <>
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3 pb-4 border-b border-base-300">
                                        <Mail className="w-5 h-5 text-base-content/40" />
                                        <div>
                                            <p className="text-sm text-base-content/60">อีเมล</p>
                                            <p className="text-base-content font-medium">{profile?.email}</p>
                                        </div>
                                    </div>

                                    {profile?.phone && (
                                        <div className="flex items-center gap-3 pb-4 border-b border-base-300">
                                            <Phone className="w-5 h-5 text-base-content/40" />
                                            <div>
                                                <p className="text-sm text-base-content/60">เบอร์โทรศัพท์</p>
                                                <p className="text-base-content font-medium">{profile.phone}</p>
                                            </div>
                                        </div>
                                    )}

                                    <div className="flex items-center gap-3 pb-4">
                                        <Calendar className="w-5 h-5 text-base-content/40" />
                                        <div>
                                            <p className="text-sm text-base-content/60">สมาชิกเมื่อ</p>
                                            <p className="text-base-content font-medium">
                                                {formatDate(profile?.created_at)}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-6 flex gap-3">
                                    <button
                                        onClick={() => setEditing(true)}
                                        className="btn flex-1 bg-[#55C388] hover:bg-[#43A874] text-white border-0"
                                    >
                                        แก้ไขข้อมูล
                                    </button>
                                    <button
                                        onClick={() => setChangingPassword(true)}
                                        className="btn flex-1 btn-ghost"
                                    >
                                        <Lock className="w-4 h-4" />
                                        เปลี่ยนรหัสผ่าน
                                    </button>
                                </div>
                            </>
                        ) : editing ? (
                            <form onSubmit={handleUpdateProfile} className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="form-control">
                                        <label className="label">
                                            <span className="label-text">ชื่อ <span className="text-error">*</span></span>
                                        </label><br />
                                        <input
                                            type="text"
                                            value={formData.firstName}
                                            onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                            className="input input-bordered focus:input-primary"
                                            required
                                        />
                                    </div>

                                    <div className="form-control">
                                        <label className="label">
                                            <span className="label-text">นามสกุล <span className="text-error">*</span></span>
                                        </label><br />
                                        <input
                                            type="text"
                                            value={formData.lastName}
                                            onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                            className="input input-bordered focus:input-primary"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="form-control">
                                    <label className="label">
                                        <span className="label-text">เบอร์โทรศัพท์</span>
                                    </label><br />
                                    <input
                                        type="tel"
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        className="input input-bordered focus:input-primary w-180"
                                    />
                                </div>
                                <div className="flex gap-3 pt-4">
                                    <button
                                        type="submit"
                                        className="btn flex-1 bg-[#55C388] hover:bg-[#43A874] text-white border-0"
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
                                        className="btn flex-1 btn-ghost"
                                    >
                                        ยกเลิก
                                    </button>
                                </div>
                            </form>
                        ) : (
                            <form onSubmit={handleChangePassword} className="space-y-4">
                                <div className="form-control">
                                    <label className="label">
                                        <span className="label-text">รหัสผ่านปัจจุบัน <span className="text-error">*</span></span>
                                    </label>
                                    <div className="relative">
                                        <input
                                            type={showPasswords.current ? "text" : "password"}
                                            value={passwordData.currentPassword}
                                            onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                                            className="input input-bordered focus:input-primary w-full pr-12"
                                            required
                                        />
                                        <button
                                            type="button"
                                            onClick={() => togglePasswordVisibility('current')}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 btn btn-ghost btn-sm btn-circle"
                                        >
                                            {showPasswords.current ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                        </button>
                                    </div>
                                </div>

                                <div className="form-control">
                                    <label className="label">
                                        <span className="label-text">รหัสผ่านใหม่ <span className="text-error">*</span></span>
                                    </label>
                                    <div className="relative">
                                        <input
                                            type={showPasswords.new ? "text" : "password"}
                                            value={passwordData.newPassword}
                                            onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                                            className="input input-bordered focus:input-primary w-full pr-12"
                                            required
                                            minLength={6}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => togglePasswordVisibility('new')}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 btn btn-ghost btn-sm btn-circle"
                                        >
                                            {showPasswords.new ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                        </button>
                                    </div>
                                    <label className="label">
                                        <span className="label-text-alt text-base-content/60">รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร</span>
                                    </label>
                                </div>

                                <div className="form-control">
                                    <label className="label">
                                        <span className="label-text">ยืนยันรหัสผ่านใหม่ <span className="text-error">*</span></span>
                                    </label>
                                    <div className="relative">
                                        <input
                                            type={showPasswords.confirm ? "text" : "password"}
                                            value={passwordData.confirmPassword}
                                            onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                                            className="input input-bordered focus:input-primary w-full pr-12"
                                            required
                                        />
                                        <button
                                            type="button"
                                            onClick={() => togglePasswordVisibility('confirm')}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 btn btn-ghost btn-sm btn-circle"
                                        >
                                            {showPasswords.confirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                        </button>
                                    </div>
                                </div>

                                <div className="flex gap-3 pt-4">
                                    <button
                                        type="submit"
                                        className="btn flex-1 bg-[#55C388] hover:bg-[#43A874] text-white border-0"
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
                                        className="btn flex-1 btn-ghost"
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