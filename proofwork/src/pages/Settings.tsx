import React, { useState } from 'react';
import { User, Bell, ShieldCheck, Lock, Link as LinkIcon, KeyRound, Activity, AlertTriangle, Monitor, Smartphone, Plus, Download } from 'lucide-react';
import { Icon } from '@iconify/react';
import NavigationBar from '../components/NavigationBar';
import Footer from '../components/Footer';
import CopyButton from '../components/CopyButton';
import clsx from 'clsx';

type Tab = 'profile' | 'notifications' | 'privacy' | 'security' | 'connected' | 'api' | 'activity';

export default function Settings() {
  const [activeTab, setActiveTab] = useState<Tab>('profile');

  // Toggle states
  const [promisesOn, setPromisesOn] = useState(true);
  const [alertsOn, setAlertsOn] = useState(true);
  const [dataCollection, setDataCollection] = useState(true);
  const [profileVisible, setProfileVisible] = useState(false);

  // Tabs configuration
  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'privacy', label: 'Privacy', icon: ShieldCheck },
    { id: 'security', label: 'Security', icon: Lock },
    { id: 'connected', label: 'Connected Apps', icon: LinkIcon },
    { id: 'api', label: 'API & Webhooks', icon: KeyRound },
    { id: 'activity', label: 'Activity Log', icon: Activity },
  ];

  return (
    <div className="min-h-screen bg-navy flex flex-col pt-32">
      <NavigationBar activeItem="settings" />

      <main className="flex-1 max-w-7xl mx-auto w-full px-6 flex flex-col lg:flex-row gap-8 pb-32">
        
        {/* SIDEBAR (25%) */}
        <aside className="lg:w-1/4 flex flex-col gap-6">
          <div className="font-mono text-[10px] uppercase text-white/40 tracking-widest pl-2">
            Home / Settings / {activeTab}
          </div>

          <h1 className="text-4xl md:text-5xl font-bold mb-4 pl-2">Account</h1>

          {/* User Profile Card */}
          <div className="glass rounded-[2rem] p-6 flex flex-col relative group">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-full bg-blueAccent flex items-center justify-center text-navy font-bold text-lg">JD</div>
              <div>
                <div className="font-bold">Jane Doe</div>
                <div className="text-sm text-white/50">jane.doe@company.com</div>
              </div>
            </div>
            <div className="bg-black/40 border border-white/5 rounded-xl p-3 flex justify-between items-center group/emp">
              <div className="font-mono text-xs text-blueAccent truncate mr-2">emp_0x1a2b3c4d...</div>
              <CopyButton text="emp_0x1a2b3c4d" />
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="glass rounded-[2rem] overflow-hidden flex flex-col py-2">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as Tab)}
                className={clsx(
                  "w-full flex items-center gap-3 px-6 py-4 text-sm font-medium text-left transition-all",
                  activeTab === tab.id 
                    ? "bg-blueAccent/10 text-blueAccent border-l-[3px] border-blueAccent" 
                    : "text-white/70 hover:bg-white/5 hover:text-white border-l-[3px] border-transparent"
                )}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>

          {/* Danger Zone */}
          <div className="glass rounded-[2rem] p-6 border-danger/20 mt-4">
            <h4 className="text-danger font-mono text-[10px] uppercase tracking-widest mb-4 font-bold">Danger Zone</h4>
            <button className="w-full px-4 py-3 border border-danger/40 text-danger rounded-xl hover:bg-danger/10 transition-colors text-sm font-medium text-left flex justify-between items-center">
              Delete Account <AlertTriangle className="w-4 h-4" />
            </button>
          </div>

          <div className="mt-auto pt-6 flex items-center gap-3 opacity-60">
            <div className="w-8 h-8 rounded-full bg-limeAccent/10 border border-limeAccent/20 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4 text-limeAccent" />
            </div>
            <div className="text-xs font-mono uppercase">
              <div className="text-white">Secured by</div>
              <div className="text-limeAccent font-bold">Midnight Network</div>
            </div>
          </div>
        </aside>

        {/* MAIN CONTENT (75%) */}
        <div className="lg:w-3/4">
          <div className="glass rounded-[2.5rem] p-8 md:p-12 min-h-[700px] lg:mt-16">
            
            {activeTab === 'profile' && (
              <div className="animate-fade-in-up">
                <h2 className="text-2xl font-bold mb-8 border-b border-white/5 pb-4">Profile Information</h2>
                
                <div className="flex flex-col sm:flex-row items-center gap-8 mb-10">
                  <div className="w-48 h-48 rounded-full bg-charcoal border border-white/10 flex items-center justify-center text-4xl font-bold text-blueAccent relative group overflow-hidden cursor-pointer">
                    JD
                    <div className="absolute inset-0 bg-navy/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="text-white text-sm font-medium">Change Avatar</span>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-bold mb-2">Profile Picture</h3>
                    <p className="text-sm text-white/50 mb-4 max-w-sm">JPG, GIF or PNG. Max size of 5MB. Drag and drop to upload.</p>
                    <button className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm hover:bg-white/10 transition-colors">Upload Image</button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
                  <div>
                    <label className="block text-xs font-mono uppercase text-white/50 tracking-wider mb-2">Full Name</label>
                    <input type="text" defaultValue="Jane Doe" className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-blueAccent transition-colors text-white" />
                  </div>
                  <div>
                    <label className="block text-xs font-mono uppercase text-white/50 tracking-wider mb-2">Email</label>
                    <div className="relative">
                      <input type="email" disabled defaultValue="jane.doe@company.com" className="w-full bg-black/40 border border-white/5 rounded-xl px-4 py-3 outline-none text-white/50 cursor-not-allowed" />
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 text-greenSuccess"><ShieldCheck className="w-4 h-4" /></div>
                    </div>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-mono uppercase text-white/50 tracking-wider mb-2">Employee ID</label>
                    <div className="flex items-center gap-4">
                      <div className="flex-1 bg-black/40 border border-white/5 rounded-xl px-4 py-3 font-mono text-blueAccent/80 flex justify-between">
                        emp_0x1a2b3c4d5e6f7g8h9i0j <CopyButton text="emp_0x1a2b3c4d5e6f7g8h9i0j" />
                      </div>
                    </div>
                    <p className="text-xs text-white/30 mt-2 font-mono flex items-center gap-1"><Lock className="w-3 h-3" /> Cryptographically verified on Midnight</p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-10">
                  <div className="glass p-5 rounded-2xl">
                    <div className="text-xs text-white/40 mb-1">Department</div>
                    <div className="font-bold">Engineering</div>
                  </div>
                  <div className="glass p-5 rounded-2xl">
                    <div className="text-xs text-white/40 mb-1">Role</div>
                    <div className="font-bold">Senior Developer</div>
                  </div>
                  <div className="glass p-5 rounded-2xl">
                    <div className="text-xs text-white/40 mb-1">Join Date</div>
                    <div className="font-bold">Mar 2023</div>
                  </div>
                </div>

                <div className="flex justify-end pt-6 border-t border-white/5">
                  <button className="px-8 py-3 bg-blueAccent text-navy font-bold rounded-full hover:bg-blueAccent/90 transition-transform hover:-translate-y-0.5">Save Changes</button>
                </div>
              </div>
            )}

            {activeTab === 'notifications' && (
              <div className="animate-fade-in-up">
                <h2 className="text-2xl font-bold mb-8 border-b border-white/5 pb-4">Email Preferences</h2>
                
                <div className="glass rounded-3xl p-2 mb-8 divide-y divide-white/5">
                  <div className="p-6 flex items-center justify-between">
                    <div>
                      <h4 className="font-bold mb-1">Promise Notifications</h4>
                      <p className="text-sm text-white/50">Get alerted when a promise is sealed or resolved</p>
                    </div>
                    <div 
                      className={`w-12 h-6 rounded-full relative cursor-pointer transition-colors ${promisesOn ? 'bg-blueAccent' : 'bg-white/10'}`}
                      onClick={() => setPromisesOn(!promisesOn)}
                    >
                      <div className={`w-5 h-5 rounded-full bg-white absolute top-0.5 transition-all shadow-md ${promisesOn ? 'right-0.5' : 'left-0.5'}`} />
                    </div>
                  </div>
                  <div className="p-6 flex items-center justify-between opacity-50">
                    <div>
                      <h4 className="font-bold mb-1">Report Updates</h4>
                      <p className="text-sm text-white/50">Notifications for anonymous reports</p>
                    </div>
                    <div className="w-12 h-6 rounded-full bg-white/10 relative cursor-not-allowed">
                      <div className="w-5 h-5 rounded-full bg-white absolute top-0.5 left-0.5 shadow-md" />
                    </div>
                  </div>
                  <div className="p-6 flex items-center justify-between">
                    <div>
                      <h4 className="font-bold mb-1">System Alerts</h4>
                      <p className="text-sm text-white/50">Security alerts and login notifications</p>
                    </div>
                    <div 
                      className={`w-12 h-6 rounded-full relative cursor-pointer transition-colors ${alertsOn ? 'bg-blueAccent' : 'bg-white/10'}`}
                      onClick={() => setAlertsOn(!alertsOn)}
                    >
                      <div className={`w-5 h-5 rounded-full bg-white absolute top-0.5 transition-all shadow-md ${alertsOn ? 'right-0.5' : 'left-0.5'}`} />
                    </div>
                  </div>
                </div>

                <div className="mb-8">
                  <label className="block text-xs font-mono uppercase text-white/50 tracking-wider mb-2">Digest Frequency</label>
                  <select className="w-full max-w-sm bg-black/20 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-blueAccent text-white appearance-none transition-colors">
                    <option className="bg-charcoal">Real-time (Immediate)</option>
                    <option className="bg-charcoal">Daily Digest</option>
                    <option className="bg-charcoal">Weekly Digest</option>
                  </select>
                </div>
              </div>
            )}

            {activeTab === 'privacy' && (
              <div className="animate-fade-in-up">
                <h2 className="text-2xl font-bold mb-8 border-b border-white/5 pb-4">Privacy & Data Analytics</h2>
                
                <div className="glass rounded-3xl p-6 mb-8 flex justify-between items-center group hover:border-white/10 transition-colors">
                  <div>
                    <h4 className="font-bold mb-1">Telemetry & Usage Data</h4>
                    <p className="text-sm text-white/50">Allow ProofWork to collect anonymous usage metrics to improve the app.</p>
                  </div>
                  <div 
                    className={`w-12 h-6 rounded-full relative cursor-pointer transition-colors shrink-0 ml-4 ${dataCollection ? 'bg-blueAccent' : 'bg-white/10'}`}
                    onClick={() => setDataCollection(!dataCollection)}
                  >
                    <div className={`w-5 h-5 rounded-full bg-white absolute top-0.5 transition-all shadow-md ${dataCollection ? 'right-0.5' : 'left-0.5'}`} />
                  </div>
                </div>

                <div className="glass rounded-3xl p-6 mb-8 flex justify-between items-center group hover:border-white/10 transition-colors">
                  <div>
                    <h4 className="font-bold mb-1">Profile Visibility</h4>
                    <p className="text-sm text-white/50">Allow peers to discover your address via name search.</p>
                  </div>
                  <div 
                    className={`w-12 h-6 rounded-full relative cursor-pointer transition-colors shrink-0 ml-4 ${profileVisible ? 'bg-blueAccent' : 'bg-white/10'}`}
                    onClick={() => setProfileVisible(!profileVisible)}
                  >
                    <div className={`w-5 h-5 rounded-full bg-white absolute top-0.5 transition-all shadow-md ${profileVisible ? 'right-0.5' : 'left-0.5'}`} />
                  </div>
                </div>

                <div className="mb-10">
                  <h4 className="font-bold mb-3">On-Chain Data Retention</h4>
                  <div className="space-y-3">
                    <label className="flex items-center gap-3 p-4 border border-white/10 rounded-xl cursor-pointer hover:bg-white/5">
                      <input type="radio" name="retention" className="accent-blueAccent" defaultChecked />
                      <div>
                        <div className="font-medium">Permanent (Default)</div>
                        <div className="text-xs text-white/50">Data is immutably stored on the Midnight blockchain.</div>
                      </div>
                    </label>
                    <label className="flex items-center gap-3 p-4 border border-white/10 rounded-xl cursor-pointer hover:bg-white/5">
                      <input type="radio" name="retention" className="accent-blueAccent" />
                      <div>
                        <div className="font-medium">Self-Destruct after 5 years</div>
                        <div className="text-xs text-white/50">Automated pruning of decrypted references.</div>
                      </div>
                    </label>
                  </div>
                </div>

                <div className="flex gap-4 pt-6 border-t border-white/5">
                  <button className="px-6 py-2 border border-blueAccent/40 text-blueAccent rounded-full hover:bg-blueAccent/10 transition-colors font-medium text-sm">Export My Data</button>
                  <button className="px-6 py-2 bg-blueAccent text-navy rounded-full font-bold text-sm ml-auto">Save Privacy Settings</button>
                </div>
              </div>
            )}

            {activeTab === 'security' && (
              <div className="animate-fade-in-up">
                <h2 className="text-2xl font-bold mb-8 border-b border-white/5 pb-4">Security</h2>
                
                <h3 className="font-bold mb-4">Change Password</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 max-w-2xl">
                  <div className="md:col-span-2">
                    <input type="password" placeholder="Current Password" className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-blueAccent transition-colors text-white" />
                  </div>
                  <div>
                    <input type="password" placeholder="New Password" className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-blueAccent transition-colors text-white" />
                    <div className="flex gap-1 mt-3 h-1 w-full">
                      <div className="h-full flex-1 bg-greenSuccess rounded-full"></div>
                      <div className="h-full flex-1 bg-greenSuccess rounded-full"></div>
                      <div className="h-full flex-1 bg-white/10 rounded-full"></div>
                      <div className="h-full flex-1 bg-white/10 rounded-full"></div>
                    </div>
                    <div className="text-[10px] text-white/40 font-mono mt-1 uppercase">Fair</div>
                  </div>
                  <div>
                    <input type="password" placeholder="Confirm New Password" className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-blueAccent transition-colors text-white" />
                  </div>
                  <div>
                    <button className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-full font-medium transition-colors text-sm">Update Password</button>
                    <span className="text-xs text-white/30 ml-4">Last changed 2 months ago</span>
                  </div>
                </div>

                <div className="glass p-8 rounded-3xl border-warning/20 mb-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
                  <div className="flex gap-4">
                    <div className="bg-warning/10 p-3 rounded-full text-warning shrink-0 h-min">
                      <AlertTriangle className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-bold text-lg mb-1 flex items-center gap-3">
                        Two-Factor Authentication
                        <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded border border-white/20 bg-white/5 text-white/50">Disabled</span>
                      </h4>
                      <p className="text-sm text-white/50">Secure your account with an authenticator app.</p>
                    </div>
                  </div>
                  <button className="px-6 py-3 border hover:border-limeAccent text-white hover:text-limeAccent rounded-full border-white/20 transition-colors whitespace-nowrap text-sm font-bold">Enable 2FA</button>
                </div>

                <h3 className="font-bold mb-4">Active Sessions</h3>
                <div className="glass rounded-3xl divide-y divide-white/5">
                  <div className="p-5 flex justify-between items-center">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center"><Monitor className="w-5 h-5 text-white/60" /></div>
                      <div>
                        <div className="font-medium text-sm">Mac OS &middot; Chrome</div>
                        <div className="text-xs text-greenSuccess flex items-center gap-1 mt-0.5"><div className="w-1.5 h-1.5 rounded-full bg-greenSuccess" /> Active Now</div>
                      </div>
                    </div>
                    <div className="text-xs text-white/30">San Francisco, US</div>
                  </div>
                  <div className="p-5 flex justify-between items-center group">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center"><Smartphone className="w-5 h-5 text-white/60" /></div>
                      <div>
                        <div className="font-medium text-sm">iPhone 14 &middot; Safari</div>
                        <div className="text-xs text-white/40 mt-0.5">Last active 2 days ago</div>
                      </div>
                    </div>
                    <button className="text-xs text-danger border border-danger/20 px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-danger/10">Sign Out</button>
                  </div>
                </div>

              </div>
            )}

            {activeTab === 'connected' && (
              <div className="animate-fade-in-up">
                <h2 className="text-2xl font-bold mb-8 border-b border-white/5 pb-4">Connected Apps</h2>
                
                <div className="space-y-4">
                  {/* Connected */}
                  <div className="glass p-6 rounded-3xl flex justify-between items-center">
                    <div className="flex gap-4 items-center">
                      <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-black font-bold text-lg">G</div>
                      <div>
                        <h4 className="font-bold">Google Calendar</h4>
                        <p className="text-xs text-white/50">Used to verify meeting transcripts.</p>
                      </div>
                    </div>
                    <button className="text-sm font-medium border border-white/10 px-4 py-2 rounded-lg hover:bg-white/5 text-white/70 hover:text-danger">Disconnect</button>
                  </div>

                  <div className="glass p-6 rounded-3xl flex justify-between items-center">
                    <div className="flex gap-4 items-center">
                      <div className="w-12 h-12 bg-[#4A154B] rounded-xl flex items-center justify-center text-white"><Icon icon="lucide:hash" className="w-6 h-6" /></div>
                      <div>
                        <h4 className="font-bold">Slack</h4>
                        <p className="text-xs text-white/50">For receiving vault notifications.</p>
                      </div>
                    </div>
                    <button className="text-sm font-medium border border-white/10 px-4 py-2 rounded-lg hover:bg-white/5 text-white/70 hover:text-danger">Disconnect</button>
                  </div>

                  {/* Available */}
                  <div className="border border-dashed border-white/10 bg-white/[0.01] p-6 rounded-3xl flex justify-between items-center mt-8">
                    <div className="flex gap-4 items-center">
                      <div className="w-12 h-12 border border-white/10 rounded-xl flex items-center justify-center text-white/40 bg-white/5"><Icon icon="lucide:briefcase" className="w-6 h-6" /></div>
                      <div>
                        <h4 className="font-bold text-white/80">Company HR System</h4>
                        <p className="text-xs text-white/40">Sync employee records.</p>
                      </div>
                    </div>
                    <button className="text-sm font-bold bg-blueAccent text-navy px-5 py-2 rounded-full hover:bg-blueAccent/90 transition-transform hover:-translate-y-0.5">Connect</button>
                  </div>
                </div>
              </div>
            )}
            
            {activeTab === 'api' && (
              <div className="animate-fade-in-up">
                <h2 className="text-2xl font-bold mb-8 border-b border-white/5 pb-4">API & Webhooks</h2>
                
                <div className="flex justify-between items-end mb-6">
                  <div>
                    <h3 className="font-bold mb-1">API Keys</h3>
                    <p className="text-sm text-white/50">Authenticate programmatic access to your vault.</p>
                  </div>
                  <button className="text-sm font-bold bg-white text-navy px-4 py-2 rounded-full flex gap-2 items-center hover:bg-limeAccent transition-colors">
                    <Plus className="w-4 h-4" /> Generate Key
                  </button>
                </div>

                <div className="glass rounded-2xl overflow-hidden mb-12">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-white/5 text-white/40 font-mono text-[10px] uppercase">
                      <tr>
                        <th className="p-4 font-normal">Name</th>
                        <th className="p-4 font-normal">Key</th>
                        <th className="p-4 font-normal">Created</th>
                        <th className="p-4 font-normal">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      <tr>
                        <td className="p-4 font-medium">Prod Integration</td>
                        <td className="p-4 font-mono text-xs text-white/60">pk_live_****************a9j</td>
                        <td className="p-4 text-white/50">Oct 12, 2024</td>
                        <td className="p-4 flex gap-3">
                          <button className="text-xs text-blueAccent hover:underline">Rotate</button>
                          <button className="text-xs text-danger hover:underline">Delete</button>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className="flex justify-between items-end mb-6">
                  <div>
                    <h3 className="font-bold mb-1">Webhooks</h3>
                    <p className="text-sm text-white/50">Receive real-time HTTP events.</p>
                  </div>
                  <button className="text-sm font-medium border border-white/20 text-white px-4 py-2 rounded-full hover:bg-white/5 transition-colors">
                    Add Webhook
                  </button>
                </div>

                <div className="glass p-5 rounded-2xl flex justify-between items-center border-l-4 border-l-blueAccent">
                  <div>
                    <div className="font-mono text-sm mb-1">https://api.mycompany.com/proofwork</div>
                    <div className="flex gap-2">
                       <span className="text-[10px] uppercase font-mono bg-white/5 py-0.5 px-2 rounded">promise.created</span>
                       <span className="text-[10px] uppercase font-mono bg-white/5 py-0.5 px-2 rounded">promise.fulfilled</span>
                    </div>
                  </div>
                  <button className="text-xs border border-white/20 px-3 py-1.5 rounded hover:bg-white/10 transition-colors">Test</button>
                </div>

              </div>
            )}

            {activeTab === 'activity' && (
              <div className="animate-fade-in-up">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 pb-4 border-b border-white/5 gap-4">
                  <h2 className="text-2xl font-bold">Activity Log</h2>
                  <a href="#" className="flex gap-2 items-center text-sm text-blueAccent hover:underline font-mono uppercase tracking-widest"><Download className="w-4 h-4"/> Export CSV</a>
                </div>

                <div className="flex flex-wrap gap-4 mb-8">
                  <select className="bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-sm outline-none text-white/70 min-w-[150px]">
                     <option>All Events</option>
                     <option>Security</option>
                     <option>Vault Access</option>
                  </select>
                  <input type="date" className="bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-sm outline-none text-white/70" />
                </div>

                <div className="space-y-3 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-white/5 before:to-transparent">
                  {/* Timeline items - simplified for layout without actual timeline line since parent class handles it poorly if complex */}
                  {[
                    { title: 'Successful Login', ip: '192.168.1.1', time: 'Today, 09:41 AM', badge: 'Security', color: 'blueAccent' },
                    { title: 'API Key Generated', ip: '192.168.1.1', time: 'Yesterday, 14:22 PM', badge: 'API', color: 'purpleAccent' },
                    { title: 'Promise Vault Accessed', ip: 'Unknown', time: 'May 12, 11:05 AM', badge: 'Access', color: 'greenSuccess' },
                    { title: 'Failed Login Attempt', ip: '103.44.22.11', time: 'May 10, 03:12 AM', badge: 'Warning', color: 'amber-500' }
                  ].map((log, i) => (
                    <div key={i} className="glass p-5 rounded-2xl flex justify-between items-center group relative z-10 before:absolute before:left-[-25px] md:before:left-auto md:before:right-full md:before:mr-6 before:w-2 before:h-2 before:bg-white/20 before:rounded-full">
                       <div>
                         <div className="font-bold text-sm mb-1">{log.title} <span className="text-white/30 font-mono font-normal">[{log.ip}]</span></div>
                         <div className="text-xs text-white/40">{log.time}</div>
                       </div>
                       <span className={`text-[10px] uppercase font-mono px-2 py-0.5 rounded border border-${log.color}/20 bg-${log.color}/10 text-${log.color}`}>{log.badge}</span>
                    </div>
                  ))}
                </div>

                <div className="mt-8 text-center pt-8">
                  <button className="text-sm font-medium text-white/40 hover:text-white transition-colors border border-white/10 px-6 py-2 rounded-full hover:bg-white/5">Load Older Events</button>
                </div>
              </div>
            )}
            
          </div>
        </div>

      </main>
      
      <Footer />
    </div>
  );
}
