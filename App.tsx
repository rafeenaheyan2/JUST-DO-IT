
import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import LoginForm from './components/LoginForm';
import ForgotForm from './components/ForgotForm';
import HelpAssistant from './components/HelpAssistant';
import ManagementPage from './components/ManagementPage';
import { AuthView, User, Order, SystemRequest, Transaction } from './types';

const DEFAULT_USERS: User[] = [
  {
    id: '1',
    username: 'Admin',
    email: '1111@mail.com',
    password: '1111',
    designation: 'Super Admin',
    photo: 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin',
    role: 'admin',
    phone: '01500000000',
    balance: 0
  },
  {
    id: '2',
    username: 'Customer User',
    email: '2222@gmail.com',
    password: '2222',
    designation: 'Customer',
    photo: 'https://api.dicebear.com/7.x/avataaars/svg?seed=customer',
    role: 'user',
    phone: '01700000000',
    milkLiter: 2,
    milkPrice: 80,
    balance: 0
  }
];

const App: React.FC = () => {
  const [view, setView] = useState<AuthView>('login');
  const [users, setUsers] = useState<User[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [systemRequests, setSystemRequests] = useState<SystemRequest[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
    const savedUsersStr = localStorage.getItem('portal_users');
    let finalUsers: User[] = [];
    if (savedUsersStr) {
      try {
        finalUsers = JSON.parse(savedUsersStr);
        DEFAULT_USERS.forEach(defUser => {
          const exists = finalUsers.some(u => u.email === defUser.email);
          if (!exists) finalUsers.push(defUser);
        });
      } catch (e) {
        finalUsers = DEFAULT_USERS;
      }
    } else {
      finalUsers = DEFAULT_USERS;
    }
    setUsers(finalUsers);
    localStorage.setItem('portal_users', JSON.stringify(finalUsers));

    const savedOrders = localStorage.getItem('portal_orders');
    if (savedOrders) try { setOrders(JSON.parse(savedOrders)); } catch (e) { setOrders([]); }

    const savedRequests = localStorage.getItem('portal_requests');
    if (savedRequests) try { setSystemRequests(JSON.parse(savedRequests)); } catch (e) { setSystemRequests([]); }

    const savedTx = localStorage.getItem('portal_transactions');
    if (savedTx) try { setTransactions(JSON.parse(savedTx)); } catch (e) { setTransactions([]); }
  }, []);

  const saveUsers = (newUsers: User[]) => {
    setUsers(newUsers);
    localStorage.setItem('portal_users', JSON.stringify(newUsers));
  };

  const saveRequests = (newRequests: SystemRequest[]) => {
    setSystemRequests(newRequests);
    localStorage.setItem('portal_requests', JSON.stringify(newRequests));
  };

  const handleSaleConfirm = (tx: Transaction) => {
    const updatedTx = [tx, ...transactions];
    setTransactions(updatedTx);
    localStorage.setItem('portal_transactions', JSON.stringify(updatedTx));

    const updatedUsers = users.map(u => u.id === tx.userId ? { ...u, balance: tx.finalBalance } : u);
    saveUsers(updatedUsers);

    if (currentUser && currentUser.id === tx.userId) {
      setCurrentUser({ ...currentUser, balance: tx.finalBalance });
    }
  };

  const handleOrder = (order: Order) => {
    const updatedOrders = [order, ...orders];
    setOrders(updatedOrders);
    localStorage.setItem('portal_orders', JSON.stringify(updatedOrders));
    const request: SystemRequest = { id: order.id, type: 'order', userId: order.customerId, userName: order.customerName, date: order.date, status: 'pending', payload: order };
    saveRequests([request, ...systemRequests]);
  };

  const handleProfileUpdateRequest = (request: SystemRequest) => {
    saveRequests([request, ...systemRequests]);
  };

  const handleApproveRequest = (requestId: string) => {
    const request = systemRequests.find(r => r.id === requestId);
    if (!request) return;

    if (request.type === 'order') {
      const updatedOrders = orders.map(order => order.id === requestId ? { ...order, status: 'completed' as const } : order);
      setOrders(updatedOrders);
      localStorage.setItem('portal_orders', JSON.stringify(updatedOrders));
    } else if (request.type === 'profile_update' || request.type === 'milk_update') {
      const updatedUsers = users.map(u => u.id === request.userId ? { ...u, ...request.payload } : u);
      saveUsers(updatedUsers);
      if (currentUser && currentUser.id === request.userId) {
        setCurrentUser({ ...currentUser, ...request.payload });
      }
    }
    const updatedRequests = systemRequests.map(r => r.id === requestId ? { ...r, status: 'completed' as const } : r);
    saveRequests(updatedRequests);
  };

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    setView('management');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setView('login');
  };

  const renderView = () => {
    switch (view) {
      case 'login': return <LoginForm onSwitchView={setView} users={users} onLoginSuccess={handleLogin} />;
      case 'forgot': return <ForgotForm onSwitchView={setView} />;
      case 'help': return <HelpAssistant onSwitchView={setView} />;
      default: return <LoginForm onSwitchView={setView} users={users} onLoginSuccess={handleLogin} />;
    }
  };

  if (view === 'management' && currentUser) {
    return (
      <ManagementPage 
        currentUser={currentUser} 
        users={users} 
        orders={orders}
        systemRequests={systemRequests}
        transactions={transactions}
        onUpdateUsers={saveUsers} 
        onSubmitOrder={handleOrder}
        onProfileUpdateRequest={handleProfileUpdateRequest}
        onApproveRequest={handleApproveRequest}
        onSaleConfirm={handleSaleConfirm}
        onLogout={handleLogout} 
      />
    );
  }

  return <Layout>{renderView()}</Layout>;
};

export default App;
