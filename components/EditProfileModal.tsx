
import React, { useState, useRef } from 'react';
import { AppSettings } from '../types';

interface EditProfileModalProps {
  settings: AppSettings;
  onSave: (userName: string, profileImage: string | null, phoneNumber: string, height: number, weight: number) => void;
  onClose: () => void;
}

const EditProfileModal: React.FC<EditProfileModalProps> = ({ settings, onSave, onClose }) => {
  const [userName, setUserName] = useState(settings.userName);
  const [phoneNumber, setPhoneNumber] = useState(settings.phoneNumber);
  const [profileImage, setProfileImage] = useState(settings.profileImage);
  const [height, setHeight] = useState<string>(settings.height?.toString() || '');
  const [weight, setWeight] = useState<string>(settings.weight?.toString() || '');
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsLoading(true);
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result as string);
        setIsLoading(false);
      };
      setTimeout(() => {
        reader.readAsDataURL(file);
      }, 800);
    }
  };

  const handleSave = () => {
    onSave(userName, profileImage, phoneNumber, Number(height), Number(weight));
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-6 bg-black/80 backdrop-blur-xl animate-in fade-in">
      <div 
        className="glass-card w-full max-w-sm p-10 rounded-[3.5rem] border-t-8 accent-border shadow-2xl relative animate-in zoom-in-95 text-center overflow-y-auto max-h-[90vh]"
        onClick={e => e.stopPropagation()}
      >
        <button 
          onClick={onClose}
          className="absolute top-8 right-8 text-white/20 hover:text-white transition-colors"
        >
          <i className="fa-solid fa-xmark text-xl"></i>
        </button>

        <h3 className="text-3xl font-black italic uppercase tracking-tighter text-[#F5F5F5] mb-8">EDITAR <span className="accent-text">PERFIL</span></h3>

        <div className="space-y-6">
          <div className="relative group w-28 h-28 mx-auto">
            <div className="w-full h-full rounded-[2.5rem] bg-white/5 overflow-hidden ring-2 border border-white/10 shadow-lg relative">
              {profileImage ? (
                <img src={profileImage} alt="Perfil" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-white/5 text-4xl">
                  <i className="fa-solid fa-user"></i>
                </div>
              )}
            </div>
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="absolute -bottom-2 -right-2 w-10 h-10 rounded-xl accent-btn text-white shadow-xl flex items-center justify-center"
            >
              <i className="fa-solid fa-camera text-sm"></i>
            </button>
            <input type="file" ref={fileInputRef} onChange={handleImageUpload} className="hidden" accept="image/*" />
          </div>

          <div className="space-y-4">
            <div className="text-left">
              <label className="text-[9px] font-black text-white/20 uppercase tracking-widest ml-4">APODO</label>
              <input 
                type="text" 
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl font-black text-center text-white"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="text-left">
                <label className="text-[9px] font-black text-white/20 uppercase tracking-widest ml-4">ALTURA (CM)</label>
                <input 
                  type="number" 
                  value={height}
                  onChange={(e) => setHeight(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl font-black text-center text-white"
                />
              </div>
              <div className="text-left">
                <label className="text-[9px] font-black text-white/20 uppercase tracking-widest ml-4">PESO (KG)</label>
                <input 
                  type="number" 
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl font-black text-center text-white"
                />
              </div>
            </div>

            <div className="text-left">
              <label className="text-[9px] font-black text-white/20 uppercase tracking-widest ml-4">TELÉFONO</label>
              <input 
                type="tel" 
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl font-black text-center text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-4">
            <button onClick={onClose} className="py-4 rounded-2xl bg-white/5 text-white/20 uppercase text-[10px] font-black">CANCELAR</button>
            <button onClick={handleSave} className="py-4 rounded-2xl accent-btn text-white uppercase text-[10px] font-black">GUARDAR</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditProfileModal;
