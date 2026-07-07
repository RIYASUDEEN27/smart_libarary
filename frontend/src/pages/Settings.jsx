import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Settings as SettingsIcon, User, Lock, Bell, Shield, ChevronRight } from 'lucide-react';

const Settings = () => {
  const { user } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('profile');

  const tabs = [
    { key: 'profile', label: 'Profile', icon: User },
    { key: 'security', label: 'Security', icon: Lock },
    { key: 'notifications', label: 'Notifications', icon: Bell },
    { key: 'about', label: 'About', icon: Shield },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="page-title">Settings</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Manage your account and system preferences.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar Tabs */}
        <div className="card p-3 space-y-1 h-fit">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors
                  ${activeTab === tab.key
                    ? 'bg-primary-600 text-white'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
                {activeTab === tab.key && <ChevronRight className="h-3.5 w-3.5 ml-auto" />}
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        <div className="lg:col-span-3">
          {activeTab === 'profile' && (
            <div className="card p-6 space-y-6">
              <h2 className="section-title">Profile Information</h2>
              <div className="flex items-center gap-5">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white text-3xl font-bold">
                  {user?.name?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-bold text-gray-900 dark:text-white text-lg">{user?.name}</p>
                  <p className="text-sm text-gray-500">{user?.email}</p>
                  <span className={`mt-1 inline-block text-xs font-medium px-3 py-1 rounded-full
                    ${user?.role === 'admin' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' : 'bg-gray-100 text-gray-600'}`}>
                    {user?.role?.toUpperCase()}
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="form-label">Full Name</label>
                  <input defaultValue={user?.name} className="form-input" readOnly />
                </div>
                <div>
                  <label className="form-label">Email Address</label>
                  <input defaultValue={user?.email} className="form-input" readOnly />
                </div>
                <div>
                  <label className="form-label">Role</label>
                  <input defaultValue={user?.role} className="form-input" readOnly />
                </div>
              </div>
              <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800 rounded-xl p-4 text-sm text-amber-700 dark:text-amber-300">
                Profile editing requires admin privileges. Contact your system administrator to update profile information.
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="card p-6 space-y-6">
              <h2 className="section-title">Security Settings</h2>
              <div className="space-y-4">
                <div>
                  <label className="form-label">Current Password</label>
                  <input type="password" className="form-input" placeholder="Enter current password" />
                </div>
                <div>
                  <label className="form-label">New Password</label>
                  <input type="password" className="form-input" placeholder="Enter new password" />
                </div>
                <div>
                  <label className="form-label">Confirm New Password</label>
                  <input type="password" className="form-input" placeholder="Confirm new password" />
                </div>
              </div>
              <button className="btn-primary bg-blue-600 hover:bg-blue-700">
                Update Password
              </button>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="card p-6 space-y-5">
              <h2 className="section-title">Notification Preferences</h2>
              {[
                { label: 'Overdue Alerts', desc: 'Get notified when books become overdue' },
                { label: 'New Borrow Activity', desc: 'Alerts when books are borrowed or returned' },
                { label: 'Fine Reminders', desc: 'Remind users about outstanding fines' },
                { label: 'Low Stock Alerts', desc: 'Alert when book availability is low' },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-700 last:border-0">
                  <div>
                    <p className="font-medium text-gray-800 dark:text-white text-sm">{item.label}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{item.desc}</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" defaultChecked className="sr-only peer" />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                  </label>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'about' && (
            <div className="card p-6 space-y-5">
              <h2 className="section-title">About Smart Library</h2>
              <div className="flex items-center gap-4 p-5 bg-gradient-to-br from-primary-50 to-blue-50 dark:from-primary-900/20 dark:to-blue-900/20 rounded-2xl border border-primary-100 dark:border-primary-800">
                <div className="w-14 h-14 bg-primary-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <SettingsIcon className="h-7 w-7 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 dark:text-white">Smart Library Management System</h3>
                  <p className="text-sm text-gray-500">Version 1.0.0</p>
                </div>
              </div>
              {[
                ['Backend', 'FastAPI + Python'],
                ['Database', 'MongoDB'],
                ['Frontend', 'React + Vite + Tailwind CSS'],
                ['Authentication', 'JWT Bearer Tokens'],
                ['Fine Policy', '₹10 per day after due date'],
                ['Borrow Period', '14 days (renewable)'],
              ].map(([key, val]) => (
                <div key={key} className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700 last:border-0">
                  <span className="text-sm text-gray-500 dark:text-gray-400">{key}</span>
                  <span className="text-sm font-medium text-gray-800 dark:text-white">{val}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;
