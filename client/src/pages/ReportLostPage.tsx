import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, Category, Location as CampusLocation } from '../services/api';
import { PlusCircle, Upload, AlertCircle, ShieldCheck, Camera } from 'lucide-react';

export const ReportLostPage: React.FC = () => {
  const navigate = useNavigate();

  const [categories, setCategories] = useState<Category[]>([]);
  const [locations, setLocations] = useState<CampusLocation[]>([]);

  const [title, setTitle] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [locationId, setLocationId] = useState('');
  const [description, setDescription] = useState('');
  const [incidentDate, setIncidentDate] = useState(new Date().toISOString().split('T')[0]);
  const [incidentTime, setIncidentTime] = useState('12:00');
  const [primaryColor, setPrimaryColor] = useState('Black');
  const [brand, setBrand] = useState('');
  const [distinguishingFeatures, setDistinguishingFeatures] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadMaster = async () => {
      try {
        const [catRes, locRes] = await Promise.all([
          api.getCategories(),
          api.getLocations()
        ]);
        setCategories(catRes.categories);
        setLocations(locRes.locations);
        if (catRes.categories.length > 0) setCategoryId(catRes.categories[0].id.toString());
        if (locRes.locations.length > 0) setLocationId(locRes.locations[0].id.toString());
      } catch (err) {
        console.error('Failed to load master options:', err);
      }
    };

    loadMaster();
  }, []);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 5 * 1024 * 1024) {
        setError('Image file size must be less than 5MB.');
        return;
      }
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
      setError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !categoryId || !locationId || !description || !primaryColor) {
      setError('Please fill in all mandatory fields.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('report_type', 'LOST');
      formData.append('title', title);
      formData.append('category_id', categoryId);
      formData.append('location_id', locationId);
      formData.append('description', description);
      formData.append('incident_date', incidentDate);
      formData.append('incident_time', incidentTime);
      formData.append('primary_color', primaryColor);
      if (brand) formData.append('brand', brand);
      if (distinguishingFeatures) formData.append('distinguishing_features', distinguishingFeatures);
      if (imageFile) formData.append('image', imageFile);

      const res = await api.createReport(formData);
      navigate(`/items/${res.itemId}`);
    } catch (err: any) {
      setError(err.message || 'Failed to submit lost item report.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Header Banner */}
      <div className="bg-[#1E3A2B] text-white p-6 rounded-3xl shadow-md space-y-2 border border-[#2A4D3B]">
        <div className="inline-flex items-center space-x-2 bg-[#D97706] text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
          <PlusCircle className="w-4 h-4" />
          <span>Lost Item Report Form</span>
        </div>
        <h1 className="text-2xl font-extrabold">File a Lost Belonging Notice</h1>
        <p className="text-xs text-gray-200">
          Provide accurate details about your lost item to trigger the automated similarity match scan across all campus found reports.
        </p>
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 text-xs p-4 rounded-2xl border border-red-200 flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Form Card */}
      <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-xs space-y-6">
        
        {/* Item Title & Category */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wider">
              Item Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Sony Wireless Headphones (Grey)"
              className="w-full text-xs p-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#1E3A2B] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wider">
              Category <span className="text-red-500">*</span>
            </label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full text-xs p-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#1E3A2B] focus:outline-none"
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Location & Incident Date */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="sm:col-span-2">
            <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wider">
              Campus Location Lost <span className="text-red-500">*</span>
            </label>
            <select
              value={locationId}
              onChange={(e) => setLocationId(e.target.value)}
              className="w-full text-xs p-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#1E3A2B] focus:outline-none"
            >
              {locations.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.building_name} — {l.floor_level} ({l.campus_zone})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wider">
              Date Lost <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              required
              value={incidentDate}
              onChange={(e) => setIncidentDate(e.target.value)}
              className="w-full text-xs p-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#1E3A2B] focus:outline-none"
            />
          </div>
        </div>

        {/* Detailed Description */}
        <div>
          <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wider">
            Detailed Description <span className="text-red-500">*</span>
          </label>
          <textarea
            required
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe where you last saw the item, contents inside, model specifics, wallpaper, etc..."
            className="w-full text-xs p-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#1E3A2B] focus:outline-none"
          />
        </div>

        {/* Color & Brand */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wider">
              Primary Color <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={primaryColor}
              onChange={(e) => setPrimaryColor(e.target.value)}
              placeholder="e.g. Black, Dark Blue, Silver"
              className="w-full text-xs p-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#1E3A2B] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wider">
              Brand / Manufacturer (Optional)
            </label>
            <input
              type="text"
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
              placeholder="e.g. WildHorn, Sony, Milton, Apple"
              className="w-full text-xs p-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#1E3A2B] focus:outline-none"
            />
          </div>
        </div>

        {/* Distinguishing Features */}
        <div>
          <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wider">
            Public Distinguishing Marks
          </label>
          <input
            type="text"
            value={distinguishingFeatures}
            onChange={(e) => setDistinguishingFeatures(e.target.value)}
            placeholder="e.g. Yellow sticker on lid, small scratch near hinge"
            className="w-full text-xs p-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#1E3A2B] focus:outline-none"
          />
        </div>

        {/* Optional Image Upload */}
        <div>
          <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wider">
            Photograph Attachment (Optional)
          </label>
          
          <div className="flex items-center space-x-4">
            <label className="cursor-pointer bg-gray-50 hover:bg-gray-100 border border-dashed border-gray-300 rounded-xl p-4 flex items-center justify-center space-x-2 text-xs text-gray-600 w-full">
              <Camera className="w-5 h-5 text-gray-400" />
              <span>{imageFile ? imageFile.name : 'Click to upload item image (Max 5MB)'}</span>
              <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
            </label>

            {imagePreview && (
              <img src={imagePreview} alt="Preview" className="w-16 h-16 object-cover rounded-xl border border-gray-200 shrink-0" />
            )}
          </div>
        </div>

        {/* Submit CTA */}
        <div className="pt-4">
          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-[#1E3A2B] hover:bg-[#15291E] text-white py-3.5 px-6 rounded-xl font-bold text-sm shadow-md transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
          >
            <ShieldCheck className="w-5 h-5 text-[#D97706]" />
            <span>{submitting ? 'Submitting Lost Report...' : 'Publish Lost Item Report & Scan Matches'}</span>
          </button>
        </div>

      </form>

    </div>
  );
};
