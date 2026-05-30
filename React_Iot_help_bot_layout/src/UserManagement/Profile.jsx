import Header from '../UIcomponents/Header';

export default function Profile() {
  return (
    <>
      <Header title="User Profile" subtitle="Manage your account settings and preferences." />
      <section className="bg-white rounded-3xl border border-slate-200 shadow-sm p-10 mb-8 max-w-3xl">
        <div className="flex items-center gap-6 mb-8">
          <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center text-4xl shadow-inner border border-slate-200">
            👤
          </div>
          <div>
            <h2 className="text-3xl font-bold text-slate-950">Student</h2>
            <p className="text-slate-500 text-lg">Engineering Faculty</p>
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Full Name</label>
            <input type="text" className="w-full border border-slate-300 rounded-2xl px-4 py-3 bg-slate-50" value="Student" disabled />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Email Address</label>
            <input type="email" className="w-full border border-slate-300 rounded-2xl px-4 py-3 bg-slate-50" value="student@university.edu" disabled />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Role</label>
            <input type="text" className="w-full border border-slate-300 rounded-2xl px-4 py-3 bg-slate-50" value="IoT Developer" disabled />
          </div>
          
       
        </div>
      </section>
    </>
  );
}
