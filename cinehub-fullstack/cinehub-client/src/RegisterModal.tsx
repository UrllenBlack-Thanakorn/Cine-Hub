import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRegisterModalStore } from "./store";
import type { UserFormData } from "./types";

export const RegisterModal: React.FC = () => {
  const { isOpen, closeModal } = useRegisterModalStore();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState<UserFormData>({
    name: "",
    email: "",
    tel: "",
    role: "USER",
  });
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // TanStack useMutation สำหรับยิง POST /api/users
  const registerMutation = useMutation({
    mutationFn: async (data: UserFormData) => {
      const res = await fetch("http://localhost:3000/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.message || "เกิดข้อผิดพลาดในการลงทะเบียน");
      }
      return json;
    },
    onSuccess: (data) => {
      setSuccessMsg(
        `ลงทะเบียนสำเร็จ! ยินดีต้อนรับคุณ ${data.data.name} (Role: ${data.data.role})`,
      );
      setFormData({ name: "", email: "", tel: "", role: "USER" });
      // Invalidate queries เมื่อมีการสร้างข้อมูล user ใหม่ (ถ้ามี)
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });

  if (!isOpen) return null;

  const handleClose = () => {
    closeModal();
    setSuccessMsg(null);
    registerMutation.reset();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMsg(null);
    registerMutation.mutate(formData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-5 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center space-x-2">
              <span>👤</span>
              <span>ลงทะเบียนสมาชิกใหม่</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              จัดการ Server State ด้วย{" "}
              <span className="text-sky-300 font-semibold">TanStack Query</span>{" "}
              (useMutation) &amp; Zod
            </p>
          </div>
          <button
            onClick={handleClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              ชื่อ-นามสกุล <span className="text-rose-400">*</span> (2 - 100
              ตัวอักษร)
            </label>
            <input
              type="text"
              placeholder="เช่น สมชาย ใจดี"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-sky-500 focus:ring-1 focus:ring-sky-500 text-white text-sm outline-none transition"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              อีเมล <span className="text-rose-400">*</span> (เช่น
              user@example.com)
            </label>
            <input
              type="text"
              placeholder="เช่น somchai@example.com"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-sky-500 focus:ring-1 focus:ring-sky-500 text-white text-sm outline-none transition"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              เบอร์โทรศัพท์ (เบอร์มือถือไทย เช่น 081-234-5678)
            </label>
            <input
              type="text"
              placeholder="เช่น 089-999-8877"
              value={formData.tel}
              onChange={(e) =>
                setFormData({ ...formData, tel: e.target.value })
              }
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-sky-500 focus:ring-1 focus:ring-sky-500 text-white text-sm outline-none transition"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              สิทธิ์การใช้งาน (Role)
            </label>
            <select
              value={formData.role}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  role: e.target.value as "USER" | "ADMIN",
                })
              }
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-sky-500 focus:ring-1 focus:ring-sky-500 text-white text-sm outline-none transition cursor-pointer"
            >
              <option value="USER">USER (ผู้ใช้งานทั่วไป)</option>
              <option value="ADMIN">ADMIN (ผู้ดูแลระบบ)</option>
            </select>
          </div>

          {/* Validation Hints */}
          <div className="p-3 bg-sky-500/10 border border-sky-500/20 rounded-xl text-xs text-sky-300 leading-relaxed">
            💡 <strong>Validation Test:</strong> หากส่ง email ซ้ำ
            หรือเบอร์มือถือผิดรูปแบบ Backend จะส่งรหัส{" "}
            <code>400 Bad Request</code> / <code>409 Conflict</code> และ
            TanStack Query จะจัดการ Error ให้อัตโนมัติ
          </div>

          {/* Success Alert */}
          {successMsg && (
            <div className="p-3.5 bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 rounded-xl text-xs sm:text-sm font-medium flex items-center space-x-2">
              <span>🎉</span>
              <span>{successMsg}</span>
            </div>
          )}

          {/* Error Alert from useMutation */}
          {registerMutation.isError && (
            <div className="p-3.5 bg-rose-500/15 border border-rose-500/30 text-rose-400 rounded-xl text-xs sm:text-sm font-medium flex items-center space-x-2">
              <span>⚠️</span>
              <span>{(registerMutation.error as Error).message}</span>
            </div>
          )}

          {/* Modal Footer */}
          <div className="pt-3 flex justify-end space-x-3">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-medium transition cursor-pointer"
            >
              ปิดหน้าต่าง
            </button>
            <button
              type="submit"
              disabled={registerMutation.isPending}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white text-sm font-semibold shadow-lg shadow-emerald-500/20 active:scale-95 disabled:opacity-50 transition cursor-pointer"
            >
              {registerMutation.isPending
                ? "กำลังส่งข้อมูล..."
                : "🚀 บันทึกข้อมูล"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
