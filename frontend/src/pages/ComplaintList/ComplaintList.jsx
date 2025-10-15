// // src/pages/ComplaintList/ComplaintList.jsx
// import React, { useEffect, useState } from "react";
// import { Link } from "react-router-dom";
// import { motion } from "framer-motion";
// import { MapPin, Clock, ArrowRight, Search } from "lucide-react";

// export default function ComplaintList() {
//   const [complaints, setComplaints] = useState([]);
//   const [search, setSearch] = useState("");

//   useEffect(() => {
//     fetch("http://localhost:5000/api/complaints")
//       .then((res) => res.json())
//       .then(setComplaints)
//       .catch((err) => console.error(err));
//   }, []);

//   const filtered = complaints.filter((c) =>
//     c.title.toLowerCase().includes(search.toLowerCase())
//   );

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-100 p-6">
//       <div className="max-w-6xl mx-auto">
//         <h1 className="text-4xl font-bold text-[#55C388] mb-8 text-center drop-shadow-sm">
//           ระบบแจ้งเรื่องร้องเรียน
//         </h1>

//         {/* Search */}
//         <div className="flex items-center gap-2 bg-white rounded-2xl shadow px-4 py-3 mb-8 max-w-lg mx-auto border border-green-100">
//           <Search className="text-[#55C388]" size={20} />
//           <input
//             type="text"
//             placeholder="ค้นหาเรื่องร้องเรียน..."
//             className="flex-1 outline-none text-gray-700"
//             value={search}
//             onChange={(e) => setSearch(e.target.value)}
//           />
//         </div>

//         {/* Card Grid */}
//         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
//           {filtered.map((item, index) => (
//             <motion.div
//               key={item.id}
//               initial={{ opacity: 0, y: 15 }}
//               animate={{ opacity: 1, y: 0 }}
//               transition={{ delay: index * 0.05 }}
//               className="bg-white rounded-3xl border border-green-100 shadow-sm hover:shadow-lg transition-all overflow-hidden"
//             >
//               <img
//                 src={item.attachment || "https://via.placeholder.com/400x200"}
//                 alt={item.title}
//                 className="h-40 w-full object-cover"
//               />
//               <div className="p-5">
//                 <h3 className="font-semibold text-lg text-gray-800 mb-2 line-clamp-1">
//                   {item.title}
//                 </h3>
//                 <p className="text-sm text-gray-600 line-clamp-2 mb-3">
//                   {item.description}
//                 </p>

//                 <div className="flex items-center text-gray-500 text-sm gap-3 mb-4">
//                   <MapPin size={16} className="text-[#55C388]" />
//                   <span>{item.location || "ไม่ระบุ"}</span>
//                 </div>

//                 <div className="flex items-center justify-between text-gray-500 text-xs">
//                   <div className="flex items-center gap-1">
//                     <Clock size={14} className="text-[#55C388]" />
//                     <span>{new Date(item.datetime_reported).toLocaleString("th-TH")}</span>
//                   </div>
//                   <Link
//                     to={`/complaint/${item.id}`}
//                     className="flex items-center gap-1 text-[#55C388] font-medium hover:underline"
//                   >
//                     ดูรายละเอียด <ArrowRight size={16} />
//                   </Link>
//                 </div>
//               </div>
//             </motion.div>
//           ))}
//         </div>

//         {filtered.length === 0 && (
//           <p className="text-center text-gray-500 mt-10">
//             ไม่พบเรื่องร้องเรียนที่ค้นหา
//           </p>
//         )}
//       </div>
//     </div>
//   );
// }
