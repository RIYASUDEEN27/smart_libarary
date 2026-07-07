import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { User, Lock } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await login(email, password);
      if (user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      const detail = err.response?.data?.detail;
      if (Array.isArray(detail)) {
        setError(detail[0].msg || 'Validation error');
      } else {
        setError(detail || 'Login failed. Please check your credentials.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-themeBg flex flex-col justify-center items-center p-4 sm:p-6 lg:p-8 transition-colors duration-300">
      
      <div className="bg-cardBg w-full max-w-[1050px] rounded-[2.5rem] shadow-2xl flex flex-col p-8 sm:p-12 relative min-h-[650px]">
        
        {/* Header */}
        <div className="flex justify-between items-center w-full mb-10 md:mb-4 z-10">
          <div className="text-2xl sm:text-3xl font-bold tracking-tight">
            <span className="text-logoOrange">Libra</span><span className="text-primary-700">Byte</span>
          </div>
          <div className="flex items-center text-sm font-medium text-gray-500">
            <span className="hidden sm:inline mr-4">Don't have an account?</span>
            <Link to="/register" className="bg-primary-600 text-white px-6 py-2 rounded-xl shadow-sm hover:bg-primary-700 hover:shadow transition-all">
              Sign Up
            </Link>
          </div>
        </div>

        {/* Content */}
        <div className="flex flex-1 flex-col md:flex-row items-center w-full mt-4 md:mt-0">
          
          {/* Left: Form */}
          <div className="w-full md:w-1/2 flex flex-col justify-center md:pr-12 lg:pr-24 z-10">
            <h2 className="text-[2.5rem] font-bold text-center text-primary-900 mb-10">
              Log in
            </h2>
            
            <form className="space-y-6 w-full max-w-sm mx-auto" onSubmit={handleSubmit}>
              {error && (
                <div className="bg-red-50 border-l-4 border-red-400 p-4 text-sm text-red-700 rounded-r-md">
                  {error}
                </div>
              )}
              
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider ml-1">
                  Username or Email
                </label>
                <div className="relative shadow-sm rounded-xl">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <User className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    type="email"
                    required
                    className="block w-full pl-11 pr-4 py-3.5 sm:text-sm border-none rounded-xl focus:ring-2 focus:ring-primary-500 bg-white/90 focus:bg-white transition-colors"
                    placeholder="Enter your username or email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider ml-1">
                  Password
                </label>
                <div className="relative shadow-sm rounded-xl">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    type="password"
                    required
                    className="block w-full pl-11 pr-4 py-3.5 sm:text-sm border-none rounded-xl focus:ring-2 focus:ring-primary-500 bg-white/90 focus:bg-white transition-colors"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex justify-center py-3.5 px-4 border border-transparent rounded-xl shadow-md text-sm font-bold text-white bg-primary-600 hover:bg-primary-700 hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:hover:translate-y-0 transition-all duration-200"
                >
                  {loading ? 'Signing in...' : 'Log In'}
                </button>
              </div>

              <div className="text-center mt-4">
                <a href="#" className="text-xs font-medium text-gray-500 hover:text-primary-600 transition-colors">
                  Forgot Password?
                </a>
              </div>
            </form>
          </div>

          {/* Right: Illustration */}
          <div className="hidden md:flex w-full md:w-1/2 justify-center items-center h-full relative">
            {/* Using mix-blend-multiply to blend the illustration perfectly into the beige background */}
            <img 
              src="/books_illustration.png" 
              alt="Library Books Illustration" 
              className="w-full max-w-[450px] object-contain mix-blend-darken hover:scale-105 transition-transform duration-700 ease-out drop-shadow-xl" 
            />
          </div>

        </div>
      </div>
    </div>
  );
};

export default Login;
