import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Plus, Pencil, Trash2, 
  FileText, ChevronRight, X, Calendar, Clock, BookOpen, AlertCircle, Check, 
  Calculator
} from "lucide-react";
import createClerkSupabaseClient from "../config/supabaseClient"
import { useUser } from "@clerk/clerk-react";

const DeleteConfirmModal = ({ isOpen, onClose, onConfirm, itemName }: { isOpen: boolean; onClose: () => void; onConfirm: () => void; itemName: string; }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-neutral-900/20 backdrop-blur-sm" />
          <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="relative w-full max-w-sm bg-base-100 rounded-2xl shadow-2xl border border-neutral-100 p-6 text-center font-[DM_Sans]">
            <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle size={32} />
            </div>
            <h3 className="text-xl font-bold text-neutral-700 mb-2">Are you sure?</h3>
            <p className="text-neutral-500 text-sm mb-6">You are about to delete <span className="font-bold text-neutral-700">"{itemName}"</span>. This action cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={onClose} className="flex-1 py-3 bg-neutral-100 hover:bg-neutral-200 text-neutral-600 rounded-xl font-bold text-sm transition-all">Cancel</button>
              <button onClick={() => { onConfirm(); onClose(); }} className="flex-1 py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl font-bold text-sm transition-all shadow-md shadow-red-100">Delete</button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};


const ExamModal = ({ isOpen, onClose, mode, initialData, onSave }: { isOpen: boolean; onClose: () => void; mode: "add" | "edit"; initialData?: any; onSave: (data: any) => void; }) => {
  const [formData, setFormData] = useState({ exam_name: "", exam_date: "", exam_time: "" });
  const supabase = createClerkSupabaseClient()

  useEffect(() => {
    if (mode === "edit" && initialData) {
      setFormData({ exam_name: initialData.exam_name, exam_date: initialData.exam_date, exam_time: initialData.exam_time });
    } else {
      setFormData({ exam_name: "", exam_date: "", exam_time: "" });
    }
  }, [mode, initialData, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ ...formData, id: initialData?.id || Date.now() });

    const { error } = await supabase
        .from("user_exams")
        .update({exam_name: formData.exam_name, exam_date: formData.exam_date, exam_time: formData.exam_time})
        .eq("id", initialData.id)

    if (error) {
        console.log(error)
    }

    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-neutral-900/20 backdrop-blur-sm" />
          <motion.div initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }} className="relative w-full max-w-lg rounded-xl shadow-2xl bg-base-200 p-8 md:p-10 font-[DM_Sans]">
            <button onClick={onClose} className="absolute top-6 right-6 p-2 text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 rounded-full transition-all"><X size={20} /></button>
            <header className="mb-8 text-left">
              <h2 className="text-2xl font-bold text-neutral-700">{mode === "edit" ? "Edit Exam" : "Add New Exam"}</h2>
              <p className="text-neutral-500 text-sm mt-1">Keep your study habits consistent.</p>
            </header>
            <form className="space-y-5" onSubmit={handleSubmit}>
              <div className="space-y-2 text-left">
                <label className="text-xs font-bold text-neutral-400 uppercase tracking-widest ml-1">Exam Name</label>
                <div className="relative"><BookOpen className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" size={18} />
                <input required type="text" value={formData.exam_name} onChange={(e) => setFormData({...formData, exam_name: e.target.value})} placeholder="e.g. Math 117 Final" className="w-full pl-12 pr-4 py-3.5 bg-base-100 border border-neutral-100 rounded-2xl focus:outline-none focus:border-[#6fc7ea] transition-all text-neutral-700 font-medium" /></div>
              </div>
              <div className="grid grid-cols-2 gap-4 text-left">
                <div className="space-y-2"><label className="text-xs font-bold text-neutral-400 uppercase tracking-widest ml-1">Date</label>
                <div className="relative"><Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" size={18} /><input required type="date" value={formData.exam_date} onChange={(e) => setFormData({...formData, exam_date: e.target.value})} placeholder="Oct 30, 2030" className="w-full pl-12 pr-4 py-3.5 bg-base-100 border border-neutral-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#6fc7ea]/20 focus:border-[#6fc7ea] transition-all text-neutral-700 font-medium" /></div></div>
                <div className="space-y-2"><label className="text-xs font-bold text-neutral-400 uppercase tracking-widest ml-1">Time</label>
                <div className="relative"><Clock className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" size={18} /><input required type="time" value={formData.exam_time} onChange={(e) => setFormData({...formData, exam_time: e.target.value})} placeholder="2:00 PM" className="w-full pl-12 pr-4 py-3.5 bg-base-100 border border-neutral-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#6fc7ea]/20 focus:border-[#6fc7ea] transition-all text-neutral-700 font-medium" /></div></div>
              </div>
              <div className="pt-4 flex gap-3">
                <button type="button" onClick={onClose} className="flex-1 py-3.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-600 rounded-2xl font-bold text-sm transition-all active:scale-95">Cancel</button>
                <button type="submit" className="flex-1 py-3.5 bg-[#6fc7ea] hover:bg-[#4f9ebd] text-white rounded-2xl font-bold text-sm transition-all shadow-xs active:scale-95 flex items-center justify-center gap-2">{mode === "edit" ? <Pencil size={18} /> : <Plus size={18} strokeWidth={3} />}{mode === "edit" ? "Save" : "Add Exam"}</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};


const ExamsPage = () => {
  const { user, isLoaded } = useUser()
  const supabase = createClerkSupabaseClient()
  
  interface exam {
    id: number,
    exam_name: string,
    exam_date: string,
    exam_time: string,
  }
  const [exams, setExams] = useState<exam[]>([]);
  const [pastExams, setPastExams] = useState<exam[]>([]);

  const [modal, setModal] = useState({ isOpen: false, mode: "add" as "add" | "edit", data: null as any });
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, data: null as any });

  useEffect(() => {
    const fetchStandingExams = async () => {
        const { data, error } = await supabase
            .from("user_exams")
            .select()
            .eq("user_id", user?.id)
            .eq("completed", false)
            .order("exam_date")
        
        if (data) {
            setExams(data)
        }

        if (error) {
            console.log(error)
        }
    }

    const fetchCompletedExams = async () => {
        const { data, error } = await supabase
            .from("user_exams")
            .select()
            .eq("user_id", user?.id)
            .eq("completed", true)
            .order("exam_date")
        
        if (data) {
            setPastExams(data)
        }

        if (error) {
            console.log(error)
        }
    }
    if (isLoaded) {
        fetchStandingExams()
        fetchCompletedExams()
    }

  }, [isLoaded])

  const handleSaveExam = async (data: any) => {
    if (modal.mode === "add") {
        console.log(data)
      setExams([...exams, { exam_name: data.exam_name, exam_date: data.exam_date, exam_time: data.exam_time, id: Date.now() }]);
       
      const { res_data, error } = await supabase
        .from("user_exams")
        .insert({id: data.id, user_id: user?.id, exam_name: data.exam_name, exam_date: data.exam_date, exam_time: data.exam_time, completed: false})
        .select()
      
      if (res_data) {
        console.log("User_exams updated")
        console.log(res_data)
      }

      if (error) {
        console.log(error)
      }

    } else {
      setExams(exams.map(e => e.id === data.id ? { ...e, ...data } : e));
    }
  };

  const confirmDelete = async () => {
    if (deleteModal.data) {
      setExams(exams.filter(e => e.id !== deleteModal.data.id));
      const { error } = await supabase
        .from("user_exams")
        .delete()
        .eq("user_id", user?.id)
        .eq("id", deleteModal.data.id)
        .select()

      if (error) {
        console.log(error)
      }
    }
  };


  const handleComplete = async (exam: any) => {
    setExams(exams.filter(e => e.id !== exam.id));
    setPastExams([exam, ...pastExams]);
    
    const { error } = await supabase
        .from("user_exams")
        .update({completed: true})
        .eq("user_id", user?.id)
        .eq("id", exam.id)
        .select()

    if (error) {
        console.log(error)
    }
    
  };

  return (
    <div className="flex-1 w-full h-screen overflow-y-auto bg-white font-[DM_Sans] custom-scrollbar selection:bg-sky-100">
      <div className="w-full px-6 py-10 md:px-16 md:py-14 max-w-[1600px] mx-auto">
        <header className="mb-8 flex justify-between items-end">
          <div><h1 className="text-4xl font-semibold text-neutral-700 tracking-tight">My Exams</h1>
          <p className="text-neutral-500 text-lg mt-2 font-medium">Keep track of your upcoming assessments.</p></div>
        </header>

        <section className="bg-base-100 rounded-lg p-8 md:p-10 border border-neutral-100 shadow-sm mb-12">
          <div className="flex justify-between items-center mb-10">
            <h2 className="text-2xl font-semibold text-neutral-700 tracking-tight">Upcoming Exams</h2>
            <button onClick={() => setModal({ isOpen: true, mode: "add", data: null })} className="flex items-center gap-2 px-6 py-2.5 bg-[#6fc7ea] hover:bg-[#4f9ebd] text-white rounded-xl text-sm font-bold transition-all shadow-md shadow-sky-200 active:scale-95">
              <Plus size={18} strokeWidth={3} /> Add New Exam
            </button>
          </div>

          <motion.div initial="hidden" animate="show" variants={{ show: { transition: { staggerChildren: 0.1 } } }} className="flex flex-col gap-4">
            <AnimatePresence>
              {isLoaded && exams.map((exam) => (
                <motion.div key={exam.id} layout initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, scale: 0.95 }} whileHover={{ x: 6 }} className="bg-white p-5 rounded-[1.5rem] border border-neutral-200/50 flex items-center justify-between shadow-sm transition-shadow hover:shadow-md">
                  <div className="flex items-center gap-6">
                    <div className="w-14 h-14 rounded-2xl bg-[#98e2ff] flex items-center justify-center text-[#fff] border border-[#98e2ff] shadow-inner"><Calculator /></div>
                    <div className="text-left"><h3 className="font-medium text-neutral-700 text-lg leading-tight">{exam.exam_name}</h3>
                    <p className="text-xs font-bold text-[#58b5da] mt-1.5 uppercase tracking-[0.15em] opacity-90">{exam.exam_date} | {exam.exam_time}</p></div>
                  </div>
                  <div className="flex gap-3 text-neutral-300 pr-4">
                    <button onClick={() => handleComplete(exam)} className="p-2 hover:text-green-500 hover:bg-green-50 rounded-xl transition-all" title="Mark as Complete"><Check size={20} strokeWidth={2} /></button>
                    <button onClick={() => setModal({ isOpen: true, mode: "edit", data: exam })} className="p-2 hover:text-[#6fc7ea] hover:bg-sky-50 rounded-xl transition-all"><Pencil size={20} strokeWidth={1.5} /></button>
                    <button onClick={() => setDeleteModal({ isOpen: true, data: exam })} className="p-2 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"><Trash2 size={20} strokeWidth={1.5} /></button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        </section>

        <section className="bg-[#fcfcfb] rounded-lg p-8 md:p-10 border border-neutral-100/50 mb-16">
          <h2 className="text-xl font-semibold text-neutral-400 mb-8 px-2 text-left">Past Exams</h2>
          <motion.div layout className="flex flex-col gap-4 opacity-60">
            <AnimatePresence>
              {isLoaded && pastExams.map((exam) => (
                <motion.div layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} key={exam.id} className="bg-white/70 p-5 rounded-[1.5rem] border border-neutral-200/40 flex items-center justify-between grayscale-[0.2]">
                  <div className="flex items-center gap-6">
                    <div className="w-14 h-14 rounded-2xl bg-neutral-100 flex items-center justify-center text-neutral-400 border border-neutral-200"><FileText size={18} /></div>
                    <div className="text-left"><h3 className="font-medium text-neutral-500 text-base">{exam.exam_name}</h3>

                    <p className="text-xs font-bold text-neutral-400 mt-1 uppercase tracking-widest">COMPLETED | {exam.exam_date}</p></div>
                  </div>
                  <div className="text-neutral-200 pr-4"><ChevronRight size={22} /></div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        </section>

        <ExamModal isOpen={modal.isOpen} onClose={() => setModal({ ...modal, isOpen: false })} mode={modal.mode} initialData={modal.data} onSave={handleSaveExam} />
        <DeleteConfirmModal isOpen={deleteModal.isOpen} onClose={() => setDeleteModal({ ...deleteModal, isOpen: false })} onConfirm={confirmDelete} itemName={deleteModal.data?.exam_name} />
      </div>
    </div>
  );
};

export default ExamsPage;