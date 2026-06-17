import React, { useState, useEffect } from 'react';
import { DISTRICTS, CLASSES, TEAMS } from '../../data/registrationData';
import { polyfillCountryFlagEmojis } from "country-flag-emoji-polyfill";
import { submitParticipant } from '../../utils/submission';
import { saveParticipant } from '../../utils/sessionState';

export default function ParticipantForm() {
  useEffect(() => {
    polyfillCountryFlagEmojis();
  }, []);

  const [step, setStep] = useState(1);
  const [flipState, setFlipState] = useState<'normal' | 'flipping-out' | 'flipping-in'>('normal');
  const [isTeamDropdownOpen, setIsTeamDropdownOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    district: '',
    studentClass: '',
    team: ''
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const handleNext = async () => {
    // Validation
    const newErrors: { [key: string]: string } = {};
    if (step === 1) {
      if (!formData.fullName.trim()) newErrors.fullName = "Name is required.";
      const phoneRegex = /^[0-9]{10}$/;
      if (!phoneRegex.test(formData.phone)) newErrors.phone = "Enter a valid 10-digit phone number.";
    } else if (step === 2) {
      if (!formData.district) newErrors.district = "District is required.";
      if (!formData.studentClass) newErrors.studentClass = "Class is required.";
    } else if (step === 3) {
      if (!formData.team) newErrors.team = "Team is required.";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    if (step < 3) {
      triggerFlip(step + 1);
    } else {
      setIsSubmitting(true);
      const participantData = {
        name: formData.fullName,
        phone: formData.phone,
        district: formData.district,
        class: formData.studentClass,
        team: formData.team
      };

      try {
        saveParticipant(participantData); // Save to sessionStorage FIRST
        await submitParticipant(participantData); // Submit to Google Sheets
        
        console.log("Registration saved successfully");
        window.location.href = '/quiz'; // Proceed to quiz page
      } catch (err: any) {
        console.error(err);
        setErrors({ submit: err.message || "Failed to submit" });
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const triggerFlip = (nextStep: number) => {
    setFlipState('flipping-out');
    setTimeout(() => {
      setStep(nextStep);
      setFlipState('flipping-in');
      setTimeout(() => {
        setFlipState('normal');
      }, 50);
    }, 250);
  };

  const getTransform = () => {
    if (flipState === 'flipping-out') return 'rotateY(90deg) scale(0.95)';
    if (flipState === 'flipping-in') return 'rotateY(-90deg) scale(0.95)';
    return 'rotateY(0deg) scale(1)';
  };

  return (
    <div className="w-full max-w-md mx-auto perspective-1000">
      <div 
        className="bg-white rounded-2xl p-6 md:p-8 shadow-xl border border-brand-surface-container"
        style={{
          transform: getTransform(),
          transition: flipState === 'normal' ? 'transform 0.25s ease-out' : 'transform 0.25s ease-in',
          transformStyle: 'preserve-3d'
        }}
      >
        {/* Progress Bar Header */}
        <div className="mb-6">
          <div className="flex justify-between text-xs font-bold text-brand-primary uppercase tracking-wider mb-2">
            <span>Step {step} of 3</span>
            <span>{step === 1 ? 'Player Details' : step === 2 ? 'Location' : 'Team Selection'}</span>
          </div>
          <div className="w-full h-1.5 bg-brand-surface-container rounded-full overflow-hidden">
            <div 
              className="h-full bg-brand-primary transition-all duration-500 ease-out"
              style={{ width: `${(step / 3) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Content */}
        <div className="mb-8">
          <h2 className="text-2xl font-heading font-bold text-brand-on-surface mb-2">Join the Squad</h2>
          <p className="text-sm text-brand-on-surface/70">Enter your details to secure your spot on the pitch.</p>
        </div>

        <div className="space-y-4 mb-8 min-h-[160px]">
          {step === 1 && (
            <>
              <div>
                <label className="block text-xs font-bold text-brand-on-surface uppercase mb-1.5">Full Name</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-brand-neutral">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                  </div>
                  <input 
                    type="text" 
                    placeholder="e.g. Lionel Messi"
                    className={`w-full pl-10 pr-3 py-2.5 bg-brand-surface border ${errors.fullName ? 'border-red-500' : 'border-brand-surface-container'} rounded-lg text-sm focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-colors`}
                    value={formData.fullName}
                    onChange={e => setFormData({...formData, fullName: e.target.value})}
                  />
                </div>
                {errors.fullName && <p className="text-red-500 text-xs mt-1">{errors.fullName}</p>}
              </div>

              <div>
                <label className="block text-xs font-bold text-brand-on-surface uppercase mb-1.5">Phone Number</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-brand-neutral">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="14" height="20" x="5" y="2" rx="2" ry="2"/><path d="M12 18h.01"/></svg>
                  </div>
                  <input 
                    type="tel" 
                    placeholder="10-digit number"
                    className={`w-full pl-10 pr-3 py-2.5 bg-brand-surface border ${errors.phone ? 'border-red-500' : 'border-brand-surface-container'} rounded-lg text-sm focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-colors`}
                    value={formData.phone}
                    onChange={e => setFormData({...formData, phone: e.target.value})}
                  />
                </div>
                {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <div>
                <label className="block text-xs font-bold text-brand-on-surface uppercase mb-1.5">District</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-brand-neutral">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
                  </div>
                  <select 
                    className={`w-full pl-10 pr-8 py-2.5 bg-brand-surface border ${errors.district ? 'border-red-500' : 'border-brand-surface-container'} rounded-lg text-sm focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-colors appearance-none`}
                    value={formData.district}
                    onChange={e => setFormData({...formData, district: e.target.value})}
                  >
                    <option value="">Select a district</option>
                    {DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                    <svg className="w-4 h-4 text-brand-neutral" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                  </div>
                </div>
                {errors.district && <p className="text-red-500 text-xs mt-1">{errors.district}</p>}
              </div>

              <div>
                <label className="block text-xs font-bold text-brand-on-surface uppercase mb-1.5">Class</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-brand-neutral">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>
                  </div>
                  <select 
                    className={`w-full pl-10 pr-8 py-2.5 bg-brand-surface border ${errors.studentClass ? 'border-red-500' : 'border-brand-surface-container'} rounded-lg text-sm focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-colors appearance-none`}
                    value={formData.studentClass}
                    onChange={e => setFormData({...formData, studentClass: e.target.value})}
                  >
                    <option value="">Select your class</option>
                    {CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                    <svg className="w-4 h-4 text-brand-neutral" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                  </div>
                </div>
                {errors.studentClass && <p className="text-red-500 text-xs mt-1">{errors.studentClass}</p>}
              </div>
            </>
          )}

          {step === 3 && (
            <>
              <div className="relative">
                <label className="block text-xs font-bold text-brand-on-surface uppercase mb-1.5">Favorite World Cup Team</label>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setIsTeamDropdownOpen(!isTeamDropdownOpen)}
                    className={`w-full pl-10 pr-8 py-2.5 bg-brand-surface border ${errors.team ? 'border-red-500' : 'border-brand-surface-container'} rounded-lg text-sm text-left focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-colors flex items-center justify-between`}
                  >
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-brand-neutral">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" x2="4" y1="22" y2="15"/></svg>
                    </div>
                    <span className={formData.team ? 'text-brand-on-surface' : 'text-brand-on-surface/50'} style={{ fontFamily: '"Twemoji Country Flags", "Segoe UI Emoji", "Apple Color Emoji", sans-serif' }}>
                      {formData.team ? TEAMS.find(t => t.name === formData.team)?.emoji + ' ' + formData.team : 'Select a nation'}
                    </span>
                    <svg className={`w-4 h-4 text-brand-neutral pointer-events-none transition-transform duration-200 ${isTeamDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                  </button>
                  
                  {isTeamDropdownOpen && (
                    <div className="absolute z-50 w-full mt-1 bg-white border border-brand-surface-container rounded-lg shadow-lg max-h-60 overflow-y-auto">
                      {TEAMS.map(t => (
                        <div 
                          key={t.name}
                          onClick={() => {
                            setFormData({...formData, team: t.name});
                            setIsTeamDropdownOpen(false);
                          }}
                          className="px-4 py-2 hover:bg-brand-surface-container cursor-pointer text-sm flex items-center gap-3 transition-colors"
                        >
                          <span className="text-lg leading-none" style={{ fontFamily: '"Twemoji Country Flags", "Segoe UI Emoji", "Apple Color Emoji", sans-serif' }}>{t.emoji}</span>
                          <span>{t.name}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                {errors.team && <p className="text-red-500 text-xs mt-1">{errors.team}</p>}
              </div>
            </>
          )}
        </div>

        <button 
          onClick={handleNext}
          disabled={isSubmitting}
          className="w-full bg-brand-primary hover:bg-[#8e221f] text-white font-bold py-3.5 rounded-lg shadow-md transition-colors flex justify-center items-center gap-2 uppercase tracking-wide text-sm disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? "SUBMITTING..." : step === 3 ? "SUBMIT & START QUIZ" : "CONTINUE TO KICK-OFF"}
          {!isSubmitting && <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>}
        </button>
        {errors.submit && <p className="text-red-500 text-xs mt-3 text-center">{errors.submit}</p>}

        <div className="mt-6 pt-4 border-t border-brand-surface-container flex justify-center items-center gap-2 text-xs text-brand-on-surface/60">
          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
          Your data is secure and encrypted.
        </div>
      </div>
    </div>
  );
}
