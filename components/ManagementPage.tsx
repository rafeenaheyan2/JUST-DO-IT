
import React, { useState, useEffect } from 'react';
import { User, Order, SystemRequest, Transaction } from '../types';

interface ManagementPageProps {
  currentUser: User;
  users: User[];
  orders: Order[];
  systemRequests: SystemRequest[];
  transactions: Transaction[];
  onUpdateUsers: (newUsers: User[]) => void;
  onSubmitOrder: (order: Order) => void;
  onProfileUpdateRequest: (request: SystemRequest) => void;
  onApproveRequest: (requestId: string) => void;
  onSaleConfirm: (tx: Transaction) => void;
  onLogout: () => void;
}

const ManagementPage: React.FC<ManagementPageProps> = ({ 
  currentUser, users, orders, systemRequests, transactions, onUpdateUsers, onSubmitOrder, onProfileUpdateRequest, onApproveRequest, onSaleConfirm, onLogout 
}) => {
  const isAdmin = currentUser.role === 'admin';
  const [activeTab, setActiveTab] = useState('ড্যাশবোর্ড');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [isSaleModalOpen, setIsSaleModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [selectedSaleUser, setSelectedSaleUser] = useState<User | null>(null);
  const [isOrdering, setIsOrdering] = useState(false);
  
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<SystemRequest | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  // Sale Form State
  const [saleForm, setSaleForm] = useState({
    date: new Date().toISOString().split('T')[0],
    qty: 0,
    price: 0,
    received: 0
  });

  // Settings State
  const [settingsData, setSettingsData] = useState({
    username: currentUser.username,
    password: currentUser.password,
    photo: currentUser.photo,
    milkLiter: currentUser.milkLiter || 0
  });
  const [isSettingSubmitting, setIsSettingSubmitting] = useState(false);

  const pendingRequests = systemRequests.filter(r => r.status === 'pending');
  const userTx = transactions.filter(t => t.userId === currentUser.id);

  const [formData, setFormData] = useState<Partial<User>>({
    username: '', email: '', password: '', designation: '', photo: '', role: 'user', phone: '', milkLiter: 0, milkPrice: 0
  });

  const [customerFormData, setCustomerFormData] = useState({
    fullName: '', username: '', email: '', phone: '', tempPassword: '', milkLiter: 0, milkPrice: 80, photo: `https://api.dicebear.com/7.x/avataaars/svg?seed=${Date.now()}`
  });

  const handleEditClick = (user: User) => {
    setEditingUser(user);
    setFormData(user);
    setIsModalOpen(true);
  };

  const handleAddClick = () => {
    setEditingUser(null);
    setFormData({ username: '', email: '', password: '', designation: '', photo: `https://api.dicebear.com/7.x/avataaars/svg?seed=${Date.now()}`, role: 'user', phone: '', milkLiter: 0, milkPrice: 0 });
    setIsModalOpen(true);
  };

  const handleAddCustomerClick = () => {
    setCustomerFormData({ fullName: '', username: '', email: '', phone: '', tempPassword: '', milkLiter: 2, milkPrice: 80, photo: `https://api.dicebear.com/7.x/avataaars/svg?seed=${Date.now()}` });
    setIsCustomerModalOpen(true);
  };

  const handleSaleClick = (user: User) => {
    setSelectedSaleUser(user);
    setSaleForm({
      date: new Date().toISOString().split('T')[0],
      qty: user.milkLiter || 0,
      price: user.milkPrice || 0,
      received: 0
    });
    setIsSaleModalOpen(true);
  };

  const handleSaleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSaleUser) return;

    const currentTotal = saleForm.qty * saleForm.price;
    const prevBalance = selectedSaleUser.balance || 0;
    const finalBalance = prevBalance + currentTotal - saleForm.received;

    const tx: Transaction = {
      id: `TX-${Date.now()}`,
      userId: selectedSaleUser.id,
      date: saleForm.date,
      qty: saleForm.qty,
      price: saleForm.price,
      total: currentTotal,
      received: saleForm.received,
      prevBalance: prevBalance,
      finalBalance: finalBalance,
      type: 'sale'
    };

    onSaleConfirm(tx);
    setIsSaleModalOpen(false);
    setSelectedSaleUser(null);
    alert('লেনদেন সফলভাবে সম্পন্ন হয়েছে!');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingUser) {
      const updatedUsers = users.map(u => u.id === editingUser.id ? { ...u, ...formData } as User : u);
      onUpdateUsers(updatedUsers);
    } else {
      const newUser: User = { ...formData, id: Date.now().toString(), role: formData.role || 'user' } as User;
      onUpdateUsers([...users, newUser]);
    }
    setIsModalOpen(false);
  };

  const handleCustomerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newCustomer: User = {
      id: Date.now().toString(),
      username: customerFormData.username,
      email: customerFormData.email,
      password: customerFormData.tempPassword,
      designation: 'Customer',
      photo: customerFormData.photo,
      role: 'user',
      phone: customerFormData.phone,
      milkLiter: Number(customerFormData.milkLiter),
      milkPrice: Number(customerFormData.milkPrice),
      balance: 0
    };
    onUpdateUsers([...users, newCustomer]);
    setIsCustomerModalOpen(false);
    alert('নতুন কাস্টমার অ্যাকাউন্ট সফলভাবে তৈরি করা হয়েছে!');
  };

  const handleCreateOrder = () => {
    setIsOrdering(true);
    setTimeout(() => {
      const farmItems = ["অর্গানিক মুরগি", "গাভীর দুধ (অতিরিক্ত)", "তাজা সবজি", "খামার সরঞ্জাম", "প্রিমিয়াম ফিড"];
      const randomItem = farmItems[Math.floor(Math.random() * farmItems.length)];
      const newOrder: Order = { id: `ORD-${Math.floor(1000 + Math.random() * 9000)}`, customerId: currentUser.id, customerName: currentUser.username, item: randomItem, date: new Date().toLocaleString('bn-BD'), status: 'pending' };
      onSubmitOrder(newOrder);
      setIsOrdering(false);
      alert('আপনার অর্ডারটি সফলভাবে সাবমিট হয়েছে এবং অ্যাডমিন অনুমোদনের অপেক্ষায় আছে।');
    }, 1000);
  };

  const handleSettingsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSettingSubmitting(true);
    setTimeout(() => {
      const isMilkChange = settingsData.milkLiter !== currentUser.milkLiter;
      const request: SystemRequest = { id: `REQ-${Math.floor(10000 + Math.random() * 90000)}`, type: isMilkChange ? 'milk_update' : 'profile_update', userId: currentUser.id, userName: currentUser.username, date: new Date().toLocaleString('bn-BD'), status: 'pending', payload: settingsData, oldData: { username: currentUser.username, password: currentUser.password, photo: currentUser.photo, milkLiter: currentUser.milkLiter } };
      onProfileUpdateRequest(request);
      setIsSettingSubmitting(false);
      alert('আপনার রিকুয়েস্ট অ্যাডমিন এর কাছে পাঠানো হয়েছে। অনুমোদনের পর এটি কার্যকর হবে।');
    }, 1000);
  };

  const handleApproveInitiate = (request: SystemRequest) => { setSelectedRequest(request); setShowApprovalModal(true); };

  const handleConfirmSync = () => {
    if (!selectedRequest) return;
    setIsSyncing(true);
    setTimeout(() => {
      onApproveRequest(selectedRequest.id);
      setIsSyncing(false);
      setShowApprovalModal(false);
      setSelectedRequest(null);
    }, 1500);
  };

  const handleDeleteUser = (id: string) => { if (confirm('আপনি কি নিশ্চিত যে আপনি এই ইউজারকে ডিলিট করতে চান?')) { onUpdateUsers(users.filter(u => u.id !== id)); } };

  const sidebarItems = isAdmin ? [
    { label: 'ড্যাশবোর্ড', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
    { label: 'ইউজার', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z' },
    { label: 'কাস্টমার', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z' },
  ] : [
    { label: 'ড্যাশবোর্ড', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
    { label: 'সেটিংস', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z' },
  ];

  const currentBalance = currentUser.balance || 0;
  const currentSaleTotal = saleForm.qty * saleForm.price;
  const prevSaleBalance = selectedSaleUser?.balance || 0;
  const finalSaleBalance = prevSaleBalance + currentSaleTotal - saleForm.received;

  return (
    <div className="flex flex-col min-h-screen w-full bg-slate-50 font-['Hind_Siliguri'] animate-in fade-in duration-700">
      <header className="px-5 py-3.5 bg-white border-b border-slate-200 flex items-center justify-between sticky top-0 z-30 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-100">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
          </div>
          <div>
            <h1 className="font-bold text-lg text-slate-800 leading-tight">{isAdmin ? 'অ্যাডমিন প্যানেল' : 'কাস্টমার প্যানেল'}</h1>
            <p className="text-[9px] text-slate-400 uppercase tracking-[0.2em] font-bold">খামার ম্যানেজমেন্ট পোর্টাল</p>
          </div>
        </div>
        
        <div className="flex items-center gap-5">
          {isAdmin && pendingRequests.length > 0 && (
            <div className="relative group cursor-pointer mr-4" title="পেন্ডিং রিকুয়েস্ট">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center animate-bounce">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
              </div>
              <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center border-2 border-white shadow-sm">{pendingRequests.length}</span>
            </div>
          )}

          <div className="hidden md:flex items-center gap-3 pr-5 border-r border-slate-100">
            <div className="text-right">
              <p className="text-xs font-bold text-slate-700">{currentUser.username}</p>
              <p className="text-[9px] text-green-500 font-bold uppercase tracking-wider">{currentUser.designation}</p>
            </div>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-100 overflow-hidden shadow-sm">
               <img src={currentUser.photo} alt="User" />
            </div>
          </div>
          <button onClick={onLogout} className="px-4 py-2 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white rounded-lg text-xs font-bold transition-all flex items-center gap-2 active:scale-95 group">
            <span>লগআউট</span>
            <svg className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
          </button>
        </div>
      </header>

      <div className="flex-1 flex flex-col md:flex-row h-[calc(100vh-65px)] overflow-hidden">
        <aside className="w-full md:w-56 lg:w-60 bg-white border-r border-slate-200 flex md:flex-col p-3 gap-1 overflow-x-auto md:overflow-y-auto">
          {sidebarItems.map((item) => (
            <button key={item.label} onClick={() => setActiveTab(item.label)} className={`flex items-center gap-3.5 px-3.5 py-3 rounded-xl transition-all flex-shrink-0 md:flex-shrink-1 ${activeTab === item.label ? 'bg-indigo-600 text-white font-bold shadow-md shadow-indigo-100' : 'text-slate-500 hover:bg-slate-50 font-semibold'}`}>
              <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={item.icon} /></svg>
              <span className="hidden md:block text-[13px]">{item.label}</span>
            </button>
          ))}
        </aside>

        <main className="flex-1 p-6 lg:p-8 overflow-y-auto bg-slate-50/30">
          {activeTab === 'ড্যাশবোর্ড' && (
            <>
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div>
                  <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight">{isAdmin ? 'ড্যাশবোর্ড ওভারভিউ' : 'আমার খামার ড্যাশবোর্ড'}</h2>
                  <p className="text-xs text-slate-500 mt-0.5 font-medium">{isAdmin ? 'পুরো সিস্টেমের সব আপডেট এক পলকে দেখে নিন।' : 'আপনার পোর্টালে স্বাগতম। এখান থেকে আপনি খামারের পণ্য অর্ডার করতে পারেন।'}</p>
                </div>
                {!isAdmin && (
                  <button onClick={handleCreateOrder} disabled={isOrdering} className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-4 rounded-2xl text-sm font-black flex items-center gap-3 transition-all shadow-2xl shadow-indigo-200 active:scale-95 disabled:opacity-50 animate-pulse">
                    {isOrdering ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span> : <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"/></svg>}
                    অতিরিক্ত অর্ডার
                  </button>
                )}
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
                {isAdmin ? (
                  <>
                    {[
                      { label: 'মোট ইউজার', val: users.length, color: 'indigo', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z' },
                      { label: 'মোট আয়', val: '৳ ৮৫,৪০০', color: 'emerald', icon: 'M13 7h8m0 0v8m0-8l-8 8-4-4-6 6' },
                      { label: 'পেন্ডিং রিকুয়েস্ট', val: pendingRequests.length, color: 'amber', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' },
                      { label: 'মোট লাভ', val: '৳ ৫.৪ লক্ষ', color: 'indigo', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z', invert: true }
                    ].map((stat, i) => (
                      <div key={i} className={`p-5 rounded-2xl shadow-sm border border-slate-100 transition-all ${stat.invert ? 'bg-indigo-600 text-white' : 'bg-white text-slate-800'}`}>
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${stat.invert ? 'bg-white/20' : `bg-${stat.color}-50 text-${stat.color}-600`}`}><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeWidth="2.5" d={stat.icon}/></svg></div>
                        <p className={`text-[10px] font-bold uppercase tracking-widest ${stat.invert ? 'text-white/60' : 'text-slate-400'}`}>{stat.label}</p>
                        <p className="text-2xl font-black mt-1">{stat.val}</p>
                      </div>
                    ))}
                  </>
                ) : (
                  <>
                    {[
                      { label: 'নির্ধারিত দুধ', val: `${currentUser.milkLiter || 0} কেজি`, color: 'indigo', icon: 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z' },
                      { label: currentBalance >= 0 ? 'মোট পাওনা (অ্যাডভান্স)' : 'মোট দেনা (বাকি)', val: `৳ ${Math.abs(currentBalance)}`, color: currentBalance >= 0 ? 'emerald' : 'red', icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
                      { label: 'সফল লেনদেন', val: userTx.length, color: 'amber', icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' },
                      { label: 'অ্যাকাউন্ট টাইপ', val: 'গোল্ডেন', color: 'indigo', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z', invert: true }
                    ].map((stat, i) => (
                      <div key={i} className={`p-5 rounded-2xl shadow-sm border border-slate-100 transition-all ${stat.invert ? 'bg-indigo-600 text-white' : 'bg-white text-slate-800'}`}>
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${stat.invert ? 'bg-white/20' : `bg-${stat.color}-50 text-${stat.color}-600`}`}><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeWidth="2.5" d={stat.icon}/></svg></div>
                        <p className={`text-[10px] font-bold uppercase tracking-widest ${stat.invert ? 'text-white/60' : 'text-slate-400'}`}>{stat.label}</p>
                        <p className="text-2xl font-black mt-1">{stat.val}</p>
                      </div>
                    ))}
                  </>
                )}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100 relative overflow-hidden">
                  <div className="flex justify-between items-center mb-8">
                    <div>
                      <h3 className="text-lg font-black text-slate-800">{isAdmin ? 'সাম্প্রতিক কার্যক্রম' : 'লেনদেন ইতিহাস (Transaction History)'}</h3>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">সবশেষ ১০টি রেকর্ড</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    {isAdmin ? (
                       orders.slice(0, 10).map((order) => (
                        <div key={order.id} className="flex items-center gap-5 p-4 rounded-2xl hover:bg-slate-50 transition-all border border-transparent hover:border-slate-100 group">
                          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${order.status === 'pending' ? 'bg-amber-50 text-amber-600' : 'bg-green-50 text-green-600'}`}><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg></div>
                          <div className="flex-1">
                            <p className="text-sm font-black text-slate-800">{order.customerName}</p>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">{order.item}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-[10px] text-slate-500 font-black mb-1.5">{order.date}</p>
                            <span className={`text-[9px] font-black uppercase px-2.5 py-1 rounded-lg border shadow-sm ${order.status === 'pending' ? 'text-amber-600 bg-white border-amber-200' : 'text-green-600 bg-white border-green-200'}`}>{order.status === 'pending' ? 'প্রসেসিং' : 'সম্পন্ন'}</span>
                          </div>
                        </div>
                      ))
                    ) : (
                      userTx.slice(0, 10).map((tx) => (
                        <div key={tx.id} className="flex items-center gap-5 p-4 rounded-2xl hover:bg-slate-50 transition-all border border-transparent hover:border-slate-100 group">
                          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg></div>
                          <div className="flex-1">
                            <p className="text-sm font-black text-slate-800">{tx.qty} কেজি দুধ ক্রয়</p>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">মূল্য: ৳{tx.total} | আদায়: ৳{tx.received}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-[10px] text-slate-500 font-black mb-1.5">{tx.date}</p>
                            <span className={`text-[9px] font-black uppercase px-2.5 py-1 rounded-lg border shadow-sm ${tx.finalBalance >= 0 ? 'text-green-600 bg-white border-green-200' : 'text-red-600 bg-white border-red-200'}`}>{tx.finalBalance >= 0 ? 'ব্যালেন্স আছে' : 'বাকি আছে'}</span>
                          </div>
                        </div>
                      ))
                    )}
                    {(isAdmin ? orders : userTx).length === 0 && (
                      <div className="text-center py-20 opacity-20"><svg className="w-20 h-20 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"/></svg><p className="font-black uppercase tracking-[0.3em] text-[10px]">কোনো রেকর্ড পাওয়া যায়নি</p></div>
                    )}
                  </div>
                </div>

                <div className="space-y-6">
                  {isAdmin ? (
                    <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white h-fit shadow-2xl border border-white/5 relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-600/20 rounded-full blur-2xl"></div>
                      <h3 className="text-xs font-black mb-6 flex items-center gap-3 uppercase tracking-widest">পেন্ডিং রিকুয়েস্ট {pendingRequests.length > 0 && <span className="bg-red-600 px-2 py-0.5 rounded-lg text-[9px] animate-pulse">{pendingRequests.length}</span>}</h3>
                      <div className="space-y-4 relative z-10">
                        {pendingRequests.map(req => (
                          <div key={req.id} className="bg-white/5 border border-white/10 p-4 rounded-2xl hover:bg-white/10 transition-colors group">
                            <div className="flex justify-between items-start mb-2"><p className="text-xs font-black group-hover:text-indigo-400 transition-colors">{req.userName}</p><span className={`text-[7px] px-1.5 py-0.5 rounded uppercase font-black tracking-widest ${req.type === 'order' ? 'bg-indigo-600 text-white' : req.type === 'milk_update' ? 'bg-amber-600 text-white' : 'bg-emerald-600 text-white'}`}>{req.type === 'order' ? 'অর্ডার' : req.type === 'milk_update' ? 'দুধ' : 'প্রোফাইল'}</span></div>
                            <p className="text-[10px] text-slate-400 leading-relaxed">{req.type === 'order' ? `${req.payload.item} অর্ডার করেছেন।` : req.type === 'milk_update' ? `দুধের পরিমাণ ${req.payload.milkLiter}কেজি করার আবেদন।` : 'প্রোফাইল তথ্য পরিবর্তনের আবেদন করেছেন।'}</p>
                            <div className="flex gap-2 mt-4"><button onClick={() => handleApproveInitiate(req)} className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all active:scale-95">এপ্রুভ</button><button className="px-3 py-2 bg-white/5 hover:bg-red-600/20 text-white/50 hover:text-red-500 rounded-xl transition-all"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12"/></svg></button></div>
                          </div>
                        ))}
                        {pendingRequests.length === 0 && <p className="text-[10px] text-slate-500 text-center py-8 font-bold italic">সব রিকুয়েস্ট প্রসেস করা হয়েছে।</p>}
                      </div>
                    </div>
                  ) : (
                    <div className="bg-indigo-600 rounded-[2.5rem] p-8 text-white h-fit shadow-2xl relative overflow-hidden group">
                      <div className="absolute -bottom-8 -right-8 w-40 h-40 bg-white/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-1000"></div>
                      <h3 className="text-xs font-black mb-3 uppercase tracking-[0.2em] relative z-10">খামার নোটিশ</h3>
                      <div className="relative z-10 space-y-4"><div className="bg-white/10 p-4 rounded-2xl backdrop-blur-sm border border-white/10"><p className="text-[11px] font-bold leading-relaxed">"আপনার নির্ধারিত প্রতিদিনের দুধের পরিমাণ {currentUser.milkLiter} কেজি। আপনার বর্তমান পাওনা/দেনা: ৳{currentBalance >= 0 ? currentBalance + ' (জমা)' : Math.abs(currentBalance) + ' (বাকি)'}"</p></div><div className="flex items-center gap-3 pt-2"><div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center"><svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/></svg></div><p className="text-[9px] font-black uppercase tracking-widest opacity-60">Help line: 01590018360</p></div></div>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          {activeTab === 'ইউজার' && isAdmin && (
            <div className="animate-in slide-in-from-bottom-2 duration-500">
               <div className="flex justify-between items-center mb-6"><h2 className="text-2xl font-black text-slate-800">ইউজার লিস্ট</h2><button onClick={handleAddClick} className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest shadow-lg shadow-indigo-100 active:scale-95 transition-all">নতুন ইউজার</button></div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {users.map(user => (
                  <div key={user.id} className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all group relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-20 h-20 bg-indigo-50/50 rounded-bl-[4rem] -mr-4 -mt-4 group-hover:bg-indigo-100/50 transition-colors"></div>
                    <div className="flex items-center gap-4 mb-4 relative z-10">
                      <div className="w-16 h-16 rounded-2xl bg-slate-50 border border-slate-100 overflow-hidden shrink-0 shadow-sm"><img src={user.photo} alt={user.username} className="w-full h-full object-cover" /></div>
                      <div className="flex-1 min-w-0"><h4 className="font-black text-slate-800 truncate text-sm">{user.username}</h4><p className="text-[10px] text-indigo-600 font-black uppercase tracking-widest mb-1">{user.designation}</p><p className="text-[10px] text-slate-400 truncate">{user.email}</p></div>
                    </div>
                    <div className="flex gap-2 pt-4 border-t border-slate-50 relative z-10"><button onClick={() => handleEditClick(user)} className="flex-1 py-2 bg-slate-50 hover:bg-indigo-600 hover:text-white text-slate-600 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border border-slate-100 hover:border-indigo-600">এডিট</button><button onClick={() => handleDeleteUser(user.id)} disabled={user.email === '1111@mail.com' || user.id === currentUser.id} className="flex-1 py-2 bg-red-50 hover:bg-red-600 text-red-600 hover:text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all disabled:opacity-30">ডিলিট</button></div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'কাস্টমার' && isAdmin && (
             <div className="animate-in slide-in-from-bottom-4 duration-500">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                  <div><h3 className="text-xl font-black text-slate-800">কাস্টমার লিস্ট</h3><p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">সব রেজিস্টার্ড কাস্টমারদের তালিকা</p></div>
                  <button onClick={handleAddCustomerClick} className="bg-indigo-600 text-white px-6 py-3 rounded-2xl text-[11px] font-black uppercase tracking-widest shadow-xl shadow-indigo-200 active:scale-95 transition-all flex items-center gap-2"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/></svg>কাস্টমার যোগ করুন</button>
                </div>
                <div className="bg-white rounded-[2.5rem] p-4 sm:p-8 shadow-sm border border-slate-100 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-slate-100">
                          <th className="py-4 px-4 text-[10px] font-black uppercase text-slate-400 tracking-widest">কাস্টমার</th>
                          <th className="py-4 px-4 text-[10px] font-black uppercase text-slate-400 tracking-widest">দৈনিক দুধ</th>
                          <th className="py-4 px-4 text-[10px] font-black uppercase text-slate-400 tracking-widest">ব্যালেন্স (৳)</th>
                          <th className="py-4 px-4 text-[10px] font-black uppercase text-slate-400 tracking-widest">অ্যাকশন</th>
                        </tr>
                      </thead>
                      <tbody>
                        {users.filter(u => u.role === 'user').map(u => (
                          <tr key={u.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors group">
                            <td className="py-4 px-4"><div className="flex items-center gap-3"><img src={u.photo} className="w-8 h-8 rounded-xl border border-slate-100 shadow-sm" alt="" /><div><p className="text-xs font-black text-slate-700">{u.username}</p><p className="text-[9px] text-slate-400 font-bold">{u.phone}</p></div></div></td>
                            <td className="py-4 px-4 text-xs font-black text-slate-600">{u.milkLiter || 0} কেজি</td>
                            <td className="py-4 px-4 text-xs font-black">
                               <span className={u.balance && u.balance < 0 ? 'text-red-500' : 'text-green-600'}>৳ {Math.abs(u.balance || 0)} {u.balance && u.balance < 0 ? '(বাকি)' : '(জমা)'}</span>
                            </td>
                            <td className="py-4 px-4">
                              <button onClick={() => handleSaleClick(u)} className="px-4 py-1.5 bg-indigo-600 text-white text-[10px] font-black uppercase tracking-widest rounded-lg shadow-md hover:bg-indigo-700 active:scale-95 transition-all">Sale</button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
             </div>
          )}

          {activeTab === 'সেটিংস' && !isAdmin && (
            <div className="max-w-xl animate-in slide-in-from-bottom-8 duration-700">
              <div className="mb-8"><h2 className="text-2xl font-black text-slate-800 tracking-tight">প্রোফাইল ও দুধের সেটিংস</h2><p className="text-xs text-slate-500 mt-1 font-medium italic">দুধের পরিমাণ বা তথ্য পরিবর্তন করতে রিকুয়েস্ট করুন।</p></div>
              <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-slate-100 relative overflow-hidden"><div className="absolute top-0 left-0 w-full h-1 bg-indigo-500/10"></div>
                <form onSubmit={handleSettingsSubmit} className="space-y-8"><div className="flex flex-col items-center gap-5"><div className="w-28 h-28 rounded-[2rem] bg-slate-50 border-2 border-dashed border-indigo-100 overflow-hidden relative group shadow-inner"><img src={settingsData.photo} alt="Profile" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" /><button type="button" onClick={() => setSettingsData({...settingsData, photo: `https://api.dicebear.com/7.x/avataaars/svg?seed=${Math.random()}`})} className="absolute inset-0 bg-indigo-600/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300"><svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"/></svg></button></div><p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">প্রোফাইল ছবি পরিবর্তন</p></div>
                  <div className="grid grid-cols-1 gap-6">
                    <div className="space-y-2"><label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">দৈনিক দুধের পরিমাণ (কেজি)</label><input type="number" min="0" className="w-full px-6 py-4 rounded-2xl border border-slate-100 focus:ring-8 focus:ring-indigo-500/5 focus:border-indigo-400 outline-none font-bold text-sm bg-slate-50/50 transition-all" value={settingsData.milkLiter} onChange={e => setSettingsData({...settingsData, milkLiter: Number(e.target.value)})} /></div>
                    <div className="space-y-2"><label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">নতুন ইউজারনেম</label><input type="text" className="w-full px-6 py-4 rounded-2xl border border-slate-100 focus:ring-8 focus:ring-indigo-500/5 focus:border-indigo-400 outline-none font-bold text-sm bg-slate-50/50 transition-all" value={settingsData.username} onChange={e => setSettingsData({...settingsData, username: e.target.value})} /></div>
                  </div>
                  <button type="submit" disabled={isSettingSubmitting} className="w-full py-5 bg-indigo-600 text-white font-black uppercase text-xs tracking-[0.3em] rounded-2xl hover:bg-indigo-700 transition-all shadow-2xl shadow-indigo-200 active:scale-95 disabled:opacity-50 mt-4 flex items-center justify-center gap-3">{isSettingSubmitting ? <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span><span>প্রসেসিং হচ্ছে...</span></> : 'পরিবর্তন রিকুয়েস্ট করুন'}</button>
                </form>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Sale Modal (Admin) */}
      {isSaleModalOpen && selectedSaleUser && (
        <div className="fixed inset-0 z-[105] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsSaleModalOpen(false)}></div>
          <div className="bg-white w-full max-w-lg rounded-[3rem] shadow-2xl relative z-10 overflow-hidden animate-in zoom-in duration-300">
            <div className="p-8 sm:p-10">
               <h3 className="text-xl font-black text-slate-800 mb-8 flex items-center gap-4">
                  <div className="w-12 h-12 bg-indigo-600 text-white rounded-2xl flex items-center justify-center shadow-lg"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"/></svg></div>
                  <div><span className="block">নতুন সেল এন্ট্রি</span><span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{selectedSaleUser.username} - এর জন্য</span></div>
               </h3>
               <form onSubmit={handleSaleSubmit} className="space-y-5">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5"><label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">তারিখ</label><input type="date" required className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none font-bold text-sm bg-slate-50/50" value={saleForm.date} onChange={e => setSaleForm({...saleForm, date: e.target.value})} /></div>
                    <div className="space-y-1.5"><label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">আজকের পরিমাণ (কেজি)</label><input type="number" step="0.1" required className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none font-bold text-sm bg-slate-50/50" value={saleForm.qty} onChange={e => setSaleForm({...saleForm, qty: Number(e.target.value)})} /></div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5"><label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">প্রতি কেজি দাম (৳)</label><input type="number" required className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none font-bold text-sm bg-slate-50/50" value={saleForm.price} onChange={e => setSaleForm({...saleForm, price: Number(e.target.value)})} /></div>
                    <div className="space-y-1.5"><label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">আজকের আদায় (৳)</label><input type="number" required className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none font-bold text-sm bg-slate-50/50" value={saleForm.received} onChange={e => setSaleForm({...saleForm, received: Number(e.target.value)})} /></div>
                  </div>
                  <div className="bg-slate-50 p-5 rounded-[2rem] border border-slate-100 space-y-3">
                    <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-slate-400"><span>আজকের মোট মূল্য:</span><span className="text-slate-800 text-sm">৳ {currentSaleTotal}</span></div>
                    <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-slate-400"><span>আগের {prevSaleBalance >= 0 ? 'জমা' : 'বাকি'}:</span><span className={`text-sm ${prevSaleBalance >= 0 ? 'text-green-600' : 'text-red-500'}`}>৳ {Math.abs(prevSaleBalance)}</span></div>
                    <div className="h-px bg-slate-200 w-full"></div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-black uppercase tracking-widest text-indigo-600">চূড়ান্ত {finalSaleBalance >= 0 ? 'পাওনা/জমা' : 'দেনা/বাকি'}:</span>
                      <span className={`text-lg font-black ${finalSaleBalance >= 0 ? 'text-green-600' : 'text-red-500'}`}>৳ {Math.abs(finalSaleBalance)}</span>
                    </div>
                  </div>
                  <div className="pt-4 flex gap-4">
                    <button type="button" onClick={() => setIsSaleModalOpen(false)} className="flex-1 py-4 bg-white text-slate-400 font-black uppercase text-[10px] tracking-widest rounded-2xl border border-slate-100 hover:bg-slate-50 transition-all">বাতিল</button>
                    <button type="submit" className="flex-[2] py-4 bg-indigo-600 text-white font-black uppercase text-[10px] tracking-widest rounded-2xl shadow-xl shadow-indigo-100 hover:bg-indigo-700 active:scale-95 transition-all">Sale Confirm</button>
                  </div>
               </form>
            </div>
          </div>
        </div>
      )}

      {/* User Management/Customer Modals (Restored and Kept) */}
      {isModalOpen && isAdmin && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
          <div className="bg-white w-full max-w-md rounded-[3rem] shadow-2xl relative z-10 overflow-hidden animate-in zoom-in duration-300"><div className="p-10"><h3 className="text-xl font-black text-slate-800 mb-8 flex items-center gap-3"><div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"/></svg></div>{editingUser ? 'ইউজার তথ্য হালনাগাদ' : 'নতুন অ্যাডমিন/ইউজার যোগ'}</h3><form onSubmit={handleSubmit} className="space-y-5"><div className="grid grid-cols-2 gap-4"><div className="space-y-1.5"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">ইউজার নাম</label><input type="text" required className="w-full px-5 py-3 rounded-2xl border border-slate-100 focus:ring-4 focus:ring-indigo-500/5 outline-none font-bold text-sm bg-slate-50/50" value={formData.username} onChange={e => setFormData({...formData, username: e.target.value})} /></div><div className="space-y-1.5"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">পদবী</label><input type="text" required className="w-full px-5 py-3 rounded-2xl border border-slate-100 focus:ring-4 focus:ring-indigo-500/5 outline-none font-bold text-sm bg-slate-50/50" value={formData.designation} onChange={e => setFormData({...formData, designation: e.target.value})} /></div></div><div className="space-y-1.5"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">ইমেল</label><input type="email" required className="w-full px-5 py-3 rounded-2xl border border-slate-100 focus:ring-4 focus:ring-indigo-500/5 outline-none font-bold text-sm bg-slate-50/50" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} /></div><div className="space-y-1.5"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">রোল (Role)</label><select className="w-full px-5 py-3 rounded-2xl border border-slate-100 focus:ring-4 focus:ring-indigo-500/5 outline-none font-bold text-sm bg-slate-50/50" value={formData.role} onChange={e => setFormData({...formData, role: e.target.value as 'admin'|'user'})}><option value="user">User/Customer</option><option value="admin">Admin</option></select></div><div className="space-y-1.5"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">পাসওয়ার্ড</label><input type="text" required className="w-full px-5 py-3 rounded-2xl border border-slate-100 focus:ring-4 focus:ring-indigo-500/5 outline-none font-bold text-sm bg-slate-50/50" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} /></div><div className="pt-4 flex gap-4"><button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-4 bg-slate-50 text-slate-400 font-black uppercase text-[10px] tracking-widest rounded-2xl border border-slate-100 hover:bg-slate-100">বাতিল</button><button type="submit" className="flex-1 py-4 bg-indigo-600 text-white font-black uppercase text-[10px] tracking-widest rounded-2xl shadow-xl shadow-indigo-100 hover:bg-indigo-700">সংরক্ষণ</button></div></form></div></div>
        </div>
      )}

      {isCustomerModalOpen && isAdmin && (
        <div className="fixed inset-0 z-[105] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsCustomerModalOpen(false)}></div>
          <div className="bg-white w-full max-w-lg rounded-[3.5rem] shadow-2xl relative z-10 overflow-hidden animate-in zoom-in duration-300"><div className="p-10"><div className="flex items-center gap-4 mb-8"><div className="w-14 h-14 bg-indigo-600 rounded-3xl flex items-center justify-center text-white shadow-2xl shadow-indigo-200"><svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"/></svg></div><div><h3 className="text-2xl font-black text-slate-800 tracking-tight">নতুন কাস্টমার যোগ</h3><p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">দুধের পরিমাণ ও কাস্টমার তথ্য</p></div></div><form onSubmit={handleCustomerSubmit} className="space-y-4"><div className="grid grid-cols-2 gap-4"><div className="space-y-1.5"><label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">কাস্টমার নাম</label><input type="text" required className="w-full px-4 py-3 rounded-2xl border border-slate-100 focus:ring-4 focus:ring-indigo-500/5 outline-none font-bold text-sm bg-slate-50/50" value={customerFormData.fullName} onChange={e => setCustomerFormData({...customerFormData, fullName: e.target.value})} placeholder="নাম" /></div><div className="space-y-1.5"><label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">ইউজারনেম</label><input type="text" required className="w-full px-4 py-3 rounded-2xl border border-slate-100 focus:ring-4 focus:ring-indigo-500/5 outline-none font-bold text-sm bg-slate-50/50" value={customerFormData.username} onChange={e => setCustomerFormData({...customerFormData, username: e.target.value})} placeholder="Username" /></div></div><div className="grid grid-cols-2 gap-4"><div className="space-y-1.5"><label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">দুধের পরিমাণ (কেজি)</label><input type="number" required className="w-full px-4 py-3 rounded-2xl border border-slate-100 focus:ring-4 focus:ring-indigo-500/5 outline-none font-bold text-sm bg-slate-50/50" value={customerFormData.milkLiter} onChange={e => setCustomerFormData({...customerFormData, milkLiter: Number(e.target.value)})} /></div><div className="space-y-1.5"><label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">প্রতি কেজি দাম (৳)</label><input type="number" required className="w-full px-4 py-3 rounded-2xl border border-slate-100 focus:ring-4 focus:ring-indigo-500/5 outline-none font-bold text-sm bg-slate-50/50" value={customerFormData.milkPrice} onChange={e => setCustomerFormData({...customerFormData, milkPrice: Number(e.target.value)})} /></div></div><div className="grid grid-cols-2 gap-4"><div className="space-y-1.5"><label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">ফোন নম্বর</label><input type="text" required className="w-full px-4 py-3 rounded-2xl border border-slate-100 focus:ring-4 focus:ring-indigo-500/5 outline-none font-bold text-sm bg-slate-50/50" value={customerFormData.phone} onChange={e => setCustomerFormData({...customerFormData, phone: e.target.value})} placeholder="ফোন" /></div><div className="space-y-1.5"><label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">অস্থায়ী পাসওয়ার্ড</label><input type="text" required className="w-full px-4 py-3 rounded-2xl border border-slate-100 focus:ring-4 focus:ring-indigo-500/5 outline-none font-bold text-sm bg-slate-50/50" value={customerFormData.tempPassword} onChange={e => setCustomerFormData({...customerFormData, tempPassword: e.target.value})} placeholder="পাসওয়ার্ড" /></div></div><div className="space-y-1.5"><label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">ইমেল</label><input type="email" required className="w-full px-4 py-3 rounded-2xl border border-slate-100 focus:ring-4 focus:ring-indigo-500/5 outline-none font-bold text-sm bg-slate-50/50" value={customerFormData.email} onChange={e => setCustomerFormData({...customerFormData, email: e.target.value})} placeholder="email@example.com" /></div><div className="pt-6 flex gap-4"><button type="button" onClick={() => setIsCustomerModalOpen(false)} className="flex-1 py-4 bg-white text-slate-400 font-black uppercase text-[10px] tracking-[0.2em] rounded-2xl border border-slate-100 hover:bg-slate-50 transition-all">বাতিল</button><button type="submit" className="flex-[2] py-4 bg-indigo-600 text-white font-black uppercase text-[10px] tracking-[0.2em] rounded-2xl shadow-2xl shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95">কাস্টমার তৈরি করুন</button></div></form></div></div>
        </div>
      )}

      {showApprovalModal && selectedRequest && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-md" onClick={() => !isSyncing && setShowApprovalModal(false)}></div>
          <div className="bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl relative z-10 overflow-hidden animate-in zoom-in duration-300"><div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50"><div className="flex items-center gap-4"><div className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-2xl shadow-indigo-200"><svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg></div><div><h3 className="text-xl font-black text-slate-800">রিকুয়েস্ট এপ্রুভাল সামারি</h3><p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.3em] mt-0.5">আইডি: {selectedRequest.id}</p></div></div>{!isSyncing && (<button onClick={() => setShowApprovalModal(false)} className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-red-500 transition-all"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12"/></svg></button>)}</div><div className="p-8 space-y-8 overflow-y-auto max-h-[65vh]"><section><h4 className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.3em] mb-4 flex items-center gap-2"><span className="w-1.5 h-1.5 bg-indigo-600 rounded-full animate-pulse"></span>১. রিকুয়েস্ট ডিটেইলস</h4><div className="bg-indigo-50/30 border-2 border-dashed border-indigo-100 p-6 rounded-[2rem]"><div className="flex items-start gap-5"><div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-indigo-600 shadow-sm shrink-0 font-black text-lg">01</div><div><p className="text-sm font-black text-slate-800">{selectedRequest.type === 'order' ? 'নতুন খামার পণ্য অর্ডার অনুমোদন' : selectedRequest.type === 'milk_update' ? 'নির্ধারিত দুধের পরিমাণ পরিবর্তন' : 'প্রোফাইল তথ্য আপডেট অনুমোদন'}</p><p className="text-xs text-slate-500 mt-2 font-bold leading-relaxed">{selectedRequest.userName}-এর আবেদনটি যাচাই করুন। {selectedRequest.type === 'milk_update' ? 'অনুমোদনের পর কাস্টমারের প্রতিদিনের নির্ধারিত দুধের পরিমাণ এবং বিলিং আপডেট হবে।' : 'তথ্যগুলো সঠিক মনে হলে কনফার্ম করুন।'}</p></div></div></div></section><section><h4 className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.3em] mb-4 flex items-center gap-2"><span className="w-1.5 h-1.5 bg-indigo-600 rounded-full animate-pulse"></span>২. বিফোর বনাম আফটার (Comparison)</h4><div className="grid grid-cols-1 md:grid-cols-2 gap-5"><div className="bg-slate-50 border border-slate-100 p-6 rounded-[2rem] relative"><span className="absolute -top-2.5 right-8 px-4 py-1 bg-slate-200 text-slate-600 text-[8px] font-black uppercase rounded-full">বর্তমান ডাটা</span><div className="space-y-4 pt-4">{selectedRequest.type === 'milk_update' ? (<div><p className="text-[8px] text-slate-400 font-black uppercase tracking-widest">দুধের পরিমাণ</p><p className="text-xs font-black text-slate-500">{selectedRequest.oldData.milkLiter} কেজি</p></div>) : selectedRequest.type === 'profile_update' ? (<div><p className="text-[8px] text-slate-400 font-black uppercase tracking-widest">ইউজারনেম</p><p className="text-xs font-black text-slate-500">{selectedRequest.oldData.username}</p></div>) : (<div><p className="text-[8px] text-slate-400 font-black uppercase tracking-widest">স্ট্যাটাস</p><p className="text-xs font-black text-amber-500 italic">পেন্ডিং</p></div>)}</div></div><div className="bg-slate-900 border border-slate-800 p-6 rounded-[2rem] relative shadow-2xl"><span className="absolute -top-2.5 right-8 px-4 py-1 bg-indigo-600 text-white text-[8px] font-black uppercase rounded-full">নতুন ডাটা</span><div className="space-y-4 pt-4 text-white">{selectedRequest.type === 'milk_update' ? (<div><p className="text-[8px] text-indigo-400 font-black uppercase tracking-widest">দুধের পরিমাণ</p><p className="text-xs font-black text-green-400">{selectedRequest.payload.milkLiter} কেজি</p></div>) : selectedRequest.type === 'profile_update' ? (<div><p className="text-[8px] text-indigo-400 font-black uppercase tracking-widest">ইউজারনেম</p><p className="text-xs font-black">{selectedRequest.payload.username}</p></div>) : (<div><p className="text-[8px] text-indigo-400 font-black uppercase tracking-widest">স্ট্যাটাস</p><p className="text-xs font-black text-green-400">সম্পন্ন</p></div>)}</div></div></div></section><section><h4 className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.3em] mb-4 flex items-center gap-2"><span className="w-1.5 h-1.5 bg-indigo-600 rounded-full animate-pulse"></span>৩. ইমপ্যাক্ট অ্যানালাইসিস</h4><div className="bg-emerald-50 border border-emerald-100 p-6 rounded-[2rem]"><ul className="space-y-4"><li className="flex items-center gap-4 text-xs text-emerald-900 font-bold"><div className="w-5 h-5 bg-white rounded-full flex items-center justify-center text-emerald-500 shadow-sm shrink-0"><svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M5 13l4 4L19 7"/></svg></div>মেইন ডাটাবেসে এই পরিবর্তন পার্মানেন্টলি কার্যকর হবে।</li>{selectedRequest.type === 'milk_update' && (<li className="flex items-center gap-4 text-xs text-emerald-900 font-bold"><div className="w-5 h-5 bg-white rounded-full flex items-center justify-center text-emerald-500 shadow-sm shrink-0"><svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M5 13l4 4L19 7"/></svg></div>কাস্টমারের প্রতিদিনের বিলিং এবং ডেলিভারি লিস্ট আপডেট হবে।</li>)}</ul></div></section></div><div className="p-8 bg-slate-50 border-t border-slate-100 flex gap-4">{!isSyncing && (<button onClick={() => setShowApprovalModal(false)} className="flex-1 py-4 bg-white border border-slate-200 text-slate-400 font-black uppercase text-[10px] tracking-widest rounded-2xl hover:bg-slate-100 transition-all active:scale-95">বাতিল</button>)}<button onClick={handleConfirmSync} disabled={isSyncing} className="flex-[2] py-4 bg-indigo-600 text-white font-black uppercase text-[10px] tracking-[0.2em] rounded-2xl shadow-2xl shadow-indigo-100 flex items-center justify-center gap-4 active:scale-95 disabled:opacity-70">{isSyncing ? (<span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>) : 'Confirm & Sync'}</button></div></div>
        </div>
      )}
    </div>
  );
};

export default ManagementPage;
