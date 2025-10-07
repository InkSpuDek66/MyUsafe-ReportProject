// frontend/src/pages/Home/Home.jsx
import React, { useEffect, useMemo, useState } from 'react';

export default function Home() {
  const [complaints, setComplaints] = useState([]);
  const [filterStatus, setFilterStatus] = useState('ทั้งหมด');
  const [q, setQ] = useState('');
  const [loading, setLoading] = useState(false);

  const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  // load data
  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/complaints`);
      const data = await res.json();
      setComplaints(data);
    } catch (e) {
      console.error('fetch error', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  // computed stats from client-side data
  const stats = useMemo(() => {
    const total = complaints.length;
    const counts = { 'รอรับเรื่อง': 0, 'ดำเนินการ': 0, 'เสร็จสิ้น': 0 };
    complaints.forEach((c) => {
      const s = c.current_status || 'รอรับเรื่อง';
      if (counts[s] !== undefined) counts[s] += 1;
    });
    const percentCompleted = total === 0 ? 0 : Math.round((counts['เสร็จสิ้น'] / total) * 100);
    return { total, counts, percentCompleted };
  }, [complaints]);

  // filter + search
  const filtered = useMemo(() => {
    return complaints.filter((c) => {
      if (filterStatus && filterStatus !== 'ทั้งหมด') {
        if (c.current_status !== filterStatus) return false;
      }
      if (q) {
        const qq = q.toLowerCase();
        const match =
          (c.title && c.title.toLowerCase().includes(qq)) ||
          (c.description && c.description.toLowerCase().includes(qq)) ||
          (c.location && c.location.toLowerCase().includes(qq)) ||
          (c.complaint_id && c.complaint_id.toLowerCase().includes(qq));
        if (!match) return false;
      }
      return true;
    });
  }, [complaints, filterStatus, q]);

  // actions: change status, like/dislike
  const updateStatus = async (complaint_id, newStatus) => {
    try {
      await fetch(`${API}/api/complaints/${complaint_id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      await load();
    } catch (e) {
      console.error(e);
    }
  };

  const sendAction = async (complaint_id, action) => {
    try {
      await fetch(`${API}/api/complaints/${complaint_id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });
      // update locally (or reload)
      await load();
    } catch (e) {
      console.error(e);
    }
  };

  const statusColor = (s) => {
    if (s === 'รอรับเรื่อง') return 'bg-red-100 text-red-800';
    if (s === 'ดำเนินการ') return 'bg-yellow-100 text-yellow-800';
    if (s === 'เสร็จสิ้น') return 'bg-green-100 text-green-800';
    return 'bg-gray-100 text-gray-700';
  };

  return (
    <div className="p-6 max-w-7xl mx-auto bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold text-center mb-6 text-blue-800">
        ระบบรายงานปัญหาภายในมหาวิทยาลัย
      </h1>

      {/* --- สถิติด้านบน --- */}
      <div className="flex flex-col md:flex-row gap-4 items-stretch mb-6">
        <div className="flex-1 bg-white rounded-2xl shadow p-5 flex items-center justify-between">
          <div>
            <div className="text-sm text-gray-500">ทั้งหมด</div>
            <div className="text-2xl font-bold">{stats.total}</div>
          </div>
          <div className="text-sm text-gray-500">รวมเหตุการณ์</div>
        </div>

        <div className="flex-1 bg-white rounded-2xl shadow p-5 flex items-center justify-between">
          <div>
            <div className="text-sm text-gray-500">เสร็จสิ้น</div>
            <div className="text-2xl font-bold">{stats.counts['เสร็จสิ้น'] || 0}</div>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-500">เปอร์เซ็นต์</div>
            <div className="text-xl font-semibold">{stats.percentCompleted}%</div>
          </div>
        </div>

        <div className="flex-1 bg-white rounded-2xl shadow p-5 flex items-center justify-between">
          <div>
            <div className="text-sm text-gray-500">รอดำเนินการ</div>
            <div className="text-2xl font-bold">{stats.counts['รอรับเรื่อง'] || 0}</div>
          </div>
          <div>
            <div className="text-sm text-gray-500">กำลังดำเนิน</div>
            <div className="text-2xl font-bold">{stats.counts['ดำเนินการ'] || 0}</div>
          </div>
        </div>
      </div>

      {/* --- filters + search --- */}
      <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
        <div className="flex items-center gap-2">
          {['ทั้งหมด', 'รอรับเรื่อง', 'ดำเนินการ', 'เสร็จสิ้น'].map((s) => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={`px-4 py-2 rounded-full text-sm font-medium ${
                filterStatus === s ? 'bg-blue-600 text-white' : 'bg-white border'
              }`}
            >
              {s}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="ค้นหา ID, คำบรรยาย, ตำแหน่ง..."
            className="border rounded-lg px-3 py-2"
          />
          <button
            onClick={() => {
              setQ('');
              setFilterStatus('ทั้งหมด');
            }}
            className="px-3 py-2 bg-gray-200 rounded-lg"
          >
            รีเซ็ต
          </button>
        </div>
      </div>

      {/* --- list --- */}
      {loading ? (
        <div className="text-center py-20">กำลังโหลด...</div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((c) => (
            <div key={c.complaint_id} className="bg-white rounded-2xl shadow hover:shadow-lg transition">
              <div className="h-44 overflow-hidden rounded-t-2xl">
                <img
                  src={c.attachment || 'https://via.placeholder.com/800x450?text=No+Image'}
                  alt={c.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-4">
                <div className={`inline-block px-3 py-1 rounded-full text-xs font-semibold mb-2 ${statusColor(c.current_status)}`}>
                  {c.current_status}
                </div>

                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">{c.title}</h3>
                    <div className="text-xs text-gray-500">ID: {c.complaint_id} • {new Date(c.datetime_reported).toLocaleString()}</div>
                  </div>
                  <div className="text-right text-sm text-gray-500">
                    👁 {c.views || 0}
                  </div>
                </div>

                <p className="text-gray-600 text-sm mt-2 line-clamp-3">{c.description}</p>
                <div className="mt-3 flex items-center justify-between text-sm text-gray-500">
                  <div>📍 {c.location}</div>
                  <div className="flex items-center gap-3">
                    <button onClick={() => sendAction(c.complaint_id, 'like')} className="text-sm hover:text-blue-600">
                      👍 {c.likes || 0}
                    </button>
                    <button onClick={() => sendAction(c.complaint_id, 'dislike')} className="text-sm hover:text-red-600">
                      👎 {c.dislikes || 0}
                    </button>
                  </div>
                </div>

                {/* change status dropdown */}
                <div className="mt-3 flex items-center justify-between">
                  <select
                    onChange={(e) => updateStatus(c.complaint_id, e.target.value)}
                    value={c.current_status}
                    className="border rounded-lg px-3 py-1 text-sm"
                  >
                    <option>รอรับเรื่อง</option>
                    <option>ดำเนินการ</option>
                    <option>เสร็จสิ้น</option>
                  </select>

                  <button onClick={() => {
                    // view increment
                    sendAction(c.complaint_id, 'view');
                    // optionally open detail
                    alert('เพิ่ม views แล้ว (ตัวอย่าง) — คุณสามารถเพิ่มหน้า detail ได้');
                  }} className="text-xs bg-gray-100 px-3 py-1 rounded-lg">
                    ดูรายละเอียด
                  </button>
                </div>

                <div className="text-xs text-gray-400 mt-2 text-right">
                  เสร็จสิ้น: {c.completed_date && c.completed_date !== '-' ? new Date(c.completed_date).toLocaleString() : '-'}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      <footer className="text-center mt-10 text-gray-500 text-sm">
        © University Traffy — หน้าแสดงผลแบบจำลอง
      </footer>
    </div>
  );
}
