/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sprout, 
  MapPin, 
  Calendar, 
  CloudRain, 
  Thermometer, 
  Droplets, 
  ChevronRight, 
  CircleDollarSign, 
  TrendingUp, 
  ShieldAlert, 
  BookOpen, 
  Wheat,
  RotateCcw,
  Layers,
  ArrowRight
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { 
  getAnalysis,
  getInsight,
  ClimateData
} from './services/geminiService.ts';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const MONTHS = [
  "January", "February", "March", "April", 
  "May", "June", "July", "August", 
  "September", "October", "November", "December"
];

type AppState = 'input' | 'analyzing' | 'recommendations' | 'detailed_guide';

export default function App() {
  const [state, setState] = useState<AppState>('input');
  const [location, setLocation] = useState('');
  const [month, setMonth] = useState(MONTHS[new Date().getMonth()]);
  const [acres, setAcres] = useState<number>(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Data states
  const [climate, setClimate] = useState<ClimateData | null>(null);
  const [recommendations, setRecommendations] = useState('');
  const [selectedCrop, setSelectedCrop] = useState('');
  
  // Detailed guide states
  const [cropDetail, setCropDetail] = useState('');
  const [fertilizerAdvice, setFertilizerAdvice] = useState('');
  const [costCalc, setCostCalc] = useState('');
  const [profitEst, setProfitEst] = useState('');
  const [riskAdvice, setRiskAdvice] = useState('');

  const handleStartAnalysis = async () => {
    if (!location.trim()) {
      setError("Please enter a location (उदा: महाराष्ट्र)");
      return;
    }
    setError(null);
    setLoading(true);
    setState('analyzing');
    
    try {
      const data = await getAnalysis(location, month);
      setClimate(data.climate);
      setRecommendations(data.recommendations);
      setState('recommendations');
    } catch (err) {
      console.error(err);
      setError("AI Service unavailable. Please check if GEMINI_API_KEY is correctly set in Settings.");
      setState('input');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectCrop = async (cropName: string) => {
    setSelectedCrop(cropName);
    setLoading(true);
    
    try {
      const [detail, fert, cost, risk] = await Promise.all([
        getInsight('protocol', { crop: cropName, location }),
        getInsight('resources', { crop: cropName, soil: climate?.soil_type_estimation }),
        getInsight('economics', { crop: cropName, acres }),
        getInsight('risk', { crop: cropName, location })
      ]);
      
      setCropDetail(detail);
      setFertilizerAdvice(fert);
      setCostCalc(cost);
      setProfitEst(cost.split('\n').slice(-3).join('\n')); // Extract summary from cost
      setRiskAdvice(risk);
      
      setState('detailed_guide');
    } catch (err) {
      console.error(err);
      setError("Failed to generate detailed protocol.");
    } finally {
      setLoading(false);
    }
  };

  const resetApp = () => {
    setState('input');
    setLocation('');
    setSelectedCrop('');
    setClimate(null);
    setRecommendations('');
    setError(null);
  };

  return (
    <div className="min-h-screen bg-[#F8FAF7] text-[#0F172A] font-sans selection:bg-[#064E3B] selection:text-white">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-6 lg:py-10">
        
        {/* Professional Header */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-slate-200 pb-8 mb-10 gap-6">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#064E3B] rounded-xl flex items-center justify-center shadow-lg shadow-emerald-200">
                <Sprout className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-3xl md:text-4xl font-display font-bold tracking-tight">
                Kisan<span className="text-[#059669]">Sahayak</span>
              </h1>
            </div>
            <div className="flex items-center gap-2 mt-2">
              <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold uppercase tracking-wider rounded">Enterprise AI</span>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Version 2.4.0</span>
            </div>
          </div>
          
          <div className="flex flex-col md:items-end gap-1">
            <div className="flex items-center gap-3 text-slate-500">
              <MapPin className="w-4 h-4" />
              <span className="text-sm font-medium">{location || "Location Unknown"}</span>
              <div className="w-1 h-1 bg-slate-300 rounded-full" />
              <Calendar className="w-4 h-4" />
              <span className="text-sm font-medium">{month?.split(' ')[0]} (FY26)</span>
            </div>
            {state !== 'input' && (
              <button 
                onClick={resetApp}
                className="mt-2 text-xs font-bold text-[#064E3B] flex items-center gap-2 hover:opacity-70 transition-opacity uppercase tracking-widest bg-emerald-50 px-3 py-1 rounded-full cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" /> Start New Simulation
              </button>
            )}
          </div>
        </header>

        <main>
          <AnimatePresence mode="wait">
            {state === 'input' && (
              <motion.div
                key="input"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className="grid grid-cols-1 lg:grid-cols-12 gap-10"
              >
                {/* Hero / Vision Section */}
                <div className="lg:col-span-12 mb-4">
                  <motion.h2 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-5xl md:text-7xl font-display font-bold leading-[0.95] tracking-tight text-[#0F172A]"
                  >
                    Precision Agriculture <br />
                    <span className="text-[#059669] italic">Fuelled by Intelligence.</span>
                  </motion.h2>
                  <p className="mt-6 text-lg text-slate-500 max-w-2xl font-medium">
                    Analyze environmental conditions and optimize your crop yield with data-driven AI simulations tailored for the Indian farmer.
                  </p>
                </div>

                <div className="lg:col-span-8">
                  <div className="bg-white border border-slate-200 rounded-3xl p-8 md:p-10 shadow-sm transition-all hover:shadow-md">
                    <div className="flex items-center gap-3 mb-10 pb-4 border-b border-slate-100">
                      <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center">
                        <MapPin className="w-4 h-4 text-slate-600" />
                      </div>
                      <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-slate-400">01. Parameters Input</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest pl-1">
                          Location (स्थान)
                        </label>
                        <input
                          type="text"
                          placeholder="उदा: नागपुर, महाराष्ट्र"
                          value={location}
                          onChange={(e) => setLocation(e.target.value)}
                          className="w-full bg-slate-50 border-2 border-transparent focus:border-emerald-500 focus:bg-white px-5 py-4 rounded-2xl outline-none text-xl font-display font-bold transition-all placeholder:text-slate-300"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest pl-1">
                          Month (महीना)
                        </label>
                        <select
                          value={month}
                          onChange={(e) => setMonth(e.target.value)}
                          className="w-full bg-slate-50 border-2 border-transparent focus:border-emerald-500 focus:bg-white px-5 py-4 rounded-2xl outline-none text-xl font-display font-bold transition-all appearance-none cursor-pointer"
                        >
                          {MONTHS.map(m => (
                            <option key={m} value={m}>{m}</option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest pl-1">
                          Total Area (एकड़)
                        </label>
                        <div className="relative">
                          <input
                            type="number"
                            value={acres}
                            onChange={(e) => setAcres(Number(e.target.value))}
                            className="w-full bg-slate-50 border-2 border-transparent focus:border-emerald-500 focus:bg-white px-5 py-4 rounded-2xl outline-none text-xl font-display font-bold transition-all"
                            min="0.1"
                            step="0.1"
                          />
                          <div className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-300 font-bold">Acres</div>
                        </div>
                      </div>

                      <div className="flex items-end">
                        <button
                          onClick={handleStartAnalysis}
                          disabled={loading}
                          className="w-full group bg-[#064E3B] text-white py-5 px-8 rounded-2xl font-bold flex items-center justify-between hover:bg-[#065F46] hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-50 disabled:hover:scale-100 shadow-xl shadow-emerald-100"
                        >
                          <span className="text-lg">Run Intelligence</span>
                          <ChevronRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                        </button>
                      </div>
                    </div>

                    {error && (
                      <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="mt-8 p-4 bg-red-50 border border-red-100 text-red-700 rounded-xl flex items-center gap-3 text-sm font-semibold"
                      >
                        <ShieldAlert className="w-5 h-5 flex-shrink-0" />
                        {error}
                      </motion.div>
                    )}
                  </div>
                </div>

                <div className="lg:col-span-4 flex flex-col gap-8">
                  <div className="bg-slate-900 text-white p-8 rounded-3xl shadow-xl space-y-6">
                    <h3 className="text-xs font-bold uppercase tracking-[0.3em] text-slate-400 border-b border-white/10 pb-4">Our Methodology</h3>
                    <div className="space-y-4">
                      <div className="flex gap-4">
                        <div className="w-6 h-6 rounded bg-emerald-500 flex items-center justify-center flex-shrink-0 text-[10px] font-bold">01</div>
                        <p className="text-sm font-medium text-slate-300 underline decoration-slate-700 underline-offset-4">Satellite Soil Mapping</p>
                      </div>
                      <div className="flex gap-4">
                        <div className="w-6 h-6 rounded bg-emerald-500 flex items-center justify-center flex-shrink-0 text-[10px] font-bold">02</div>
                        <p className="text-sm font-medium text-slate-300 underline decoration-slate-700 underline-offset-4">Local Weather Stratification</p>
                      </div>
                      <div className="flex gap-4">
                        <div className="w-6 h-6 rounded bg-emerald-500 flex items-center justify-center flex-shrink-0 text-[10px] font-bold">03</div>
                        <p className="text-sm font-medium text-slate-300 underline decoration-slate-700 underline-offset-4">Commodity Index Forecasting</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-emerald-50 border border-emerald-100 p-8 rounded-3xl space-y-3">
                    <p className="text-emerald-900 font-bold flex items-center gap-2">
                       <Wheat className="w-5 h-5" /> Harvest the Future
                    </p>
                    <p className="text-sm text-emerald-700/80 leading-relaxed font-medium">
                      "हमारा लक्ष्य हर किसान को आधुनिक तकनीकों के साथ जोड़कर उनकी आय बढ़ाना है।"
                    </p>
                  </div>
                </div>
              </motion.div>
            )}

            {state === 'analyzing' && (
              <motion.div
                key="analyzing"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center py-32 space-y-8"
              >
                <div className="relative">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                    className="w-24 h-24 border-4 border-slate-100 border-t-emerald-600 rounded-full shadow-inner"
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Sprout className="w-8 h-8 text-emerald-600" />
                  </div>
                </div>
                <div className="text-center font-display">
                  <h3 className="text-3xl font-bold mb-2 tracking-tight">Synthesizing Environment Data</h3>
                  <p className="text-slate-400 font-medium">जलवायु और मिट्टी की स्थिति की जांच हो रही है...</p>
                </div>
              </motion.div>
            )}

            {state === 'recommendations' && climate && (
              <motion.div
                key="recommendations"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-10"
              >
                {/* Environmental Scorecard */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm transition-hover hover:border-emerald-200">
                    <CloudRain className="w-5 h-5 text-emerald-600 mb-3" />
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest block mb-1">Climate</label>
                    <p className="text-lg font-display font-bold leading-tight">{climate.climate_zone}</p>
                  </div>
                  <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm transition-hover hover:border-emerald-200">
                    <div className="flex justify-between items-start">
                      <Sprout className="w-5 h-5 text-emerald-600 mb-3" />
                      <span className="text-[8px] bg-emerald-50 text-emerald-700 px-2 rounded-full font-bold">ESTIMATED</span>
                    </div>
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest block mb-1">Soil</label>
                    <p className="text-lg font-display font-bold leading-tight">{climate.soil_type_estimation}</p>
                  </div>
                  <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm transition-hover hover:border-emerald-200">
                    <Droplets className="w-5 h-5 text-emerald-600 mb-3" />
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest block mb-1">Rainfall</label>
                    <p className="text-lg font-display font-bold leading-tight">{climate.rainfall_pattern}</p>
                  </div>
                  <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm transition-hover hover:border-emerald-200">
                    <Thermometer className="w-5 h-5 text-emerald-600 mb-3" />
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest block mb-1">Temp Range</label>
                    <p className="text-lg font-display font-bold leading-tight">{climate.temperature_range}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                  {/* Main Recs */}
                  <div className="lg:col-span-8 space-y-10">
                    <div className="bg-white border border-slate-200 rounded-3xl p-8 md:p-10 shadow-sm relative overflow-hidden">
                       <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 rounded-bl-[100px] -mr-8 -mt-8 pointer-events-none" />
                       <div className="flex items-center gap-3 mb-8 relative z-10">
                        <Wheat className="w-6 h-6 text-emerald-600" />
                        <h3 className="text-3xl font-display font-bold">Top Recommendations</h3>
                      </div>
                      <div className="prose prose-emerald max-w-none HindiContent text-lg text-slate-700 relative z-10">
                        <ReactMarkdown>{recommendations}</ReactMarkdown>
                      </div>
                    </div>

                    <div className="bg-[#064E3B] text-white rounded-3xl p-8 md:p-10 shadow-xl relative overflow-hidden">
                      <TrendingUp className="absolute top-1/2 right-10 -translate-y-1/2 w-48 h-48 opacity-5 text-white pointer-events-none" />
                      <div className="flex items-center gap-3 mb-6">
                        <CircleDollarSign className="w-6 h-6 text-emerald-400" />
                        <h3 className="text-2xl font-display font-bold">Risk Management Advisory</h3>
                      </div>
                      <div className="prose prose-invert max-w-none HindiContent text-lg leading-relaxed">
                        <p>Our simulation indicates that choosing local hardy varieties is key this season. Monitor soil moisture levels daily.</p>
                        <p className="mt-4 text-emerald-300 font-bold">मौसम और बाजार की स्थिति को देखते हुए सही बीज का चुनाव महत्वपूर्ण है।</p>
                      </div>
                    </div>
                  </div>

                  {/* Selection Sidebar */}
                  <div className="lg:col-span-4">
                    <div className="sticky top-32 space-y-6">
                      <div className="bg-white border border-slate-200 p-8 rounded-3xl shadow-sm">
                        <h4 className="text-xs font-black uppercase tracking-widest text-[#064E3B] mb-6 border-b border-slate-100 pb-2">Analysis Depth</h4>
                        <p className="text-sm text-slate-500 font-medium mb-8">
                          Select a crop from the recommendations to unlock detailed cultivation protocols and financial calculations.
                        </p>
                        <div className="space-y-4">
                          <input 
                            type="text" 
                            id="crop_selector_input"
                            placeholder="Type Crop Name (उदा: कपास)"
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-5 py-4 font-display font-bold outline-none focus:border-emerald-500 focus:bg-white transition-all transition-duration-300"
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                const val = (e.currentTarget as HTMLInputElement).value;
                                if (val) handleSelectCrop(val);
                              }
                            }}
                          />
                          <button 
                            onClick={() => {
                              const input = document.getElementById('crop_selector_input') as HTMLInputElement;
                              if (input.value) handleSelectCrop(input.value);
                            }}
                            disabled={loading}
                            className="w-full bg-emerald-600 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-3 hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-50"
                          >
                             {loading ? "Generating Insight..." : "Generate Full Protocol"}
                             <ArrowRight className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      
                      <div className="p-6 bg-amber-50 border border-amber-100 rounded-2xl flex gap-4">
                        <ShieldAlert className="w-6 h-6 text-amber-600 flex-shrink-0" />
                        <div>
                          <p className="text-xs font-bold text-amber-800 uppercase tracking-widest mb-1">Disclaimer</p>
                          <p className="text-[11px] font-medium text-amber-700 leading-relaxed">
                            Market values & yield projections are simulations. 
                            Connect with KVK (Krishi Vigyan Kendra) for physical soil testing.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {state === 'detailed_guide' && (
              <motion.div
                key="detailed_guide"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-12 pb-32"
              >
                {/* Visual Report Header */}
                <header className="bg-slate-900 text-white rounded-[40px] p-10 md:p-16 relative overflow-hidden">
                  <Sprout className="absolute -right-20 -bottom-20 w-80 h-80 text-white/5 pointer-events-none" />
                  <div className="relative z-10">
                    <p className="text-emerald-400 font-black uppercase text-xs tracking-[0.3em] mb-4">Strategic Cultivation Dossier</p>
                    <h2 className="text-6xl md:text-8xl font-display font-bold tracking-tight mb-6 leading-none">
                      {selectedCrop}
                    </h2>
                    <div className="flex flex-wrap gap-8">
                      <div>
                        <p className="text-[10px] font-bold uppercase opacity-40 text-white tracking-widest mb-1">Target Location</p>
                        <p className="text-xl font-display font-medium text-slate-100">{location}</p>
                      </div>
                      <div className="w-px bg-white/20 h-10 self-end" />
                      <div>
                        <p className="text-[10px] font-bold uppercase opacity-40 text-white tracking-widest mb-1">Operation Scale</p>
                        <p className="text-xl font-display font-medium text-slate-100">{acres} Acres</p>
                      </div>
                      <div className="w-px bg-white/20 h-10 self-end" />
                      <div>
                        <p className="text-[10px] font-bold uppercase opacity-40 text-white tracking-widest mb-1">Confidence Score</p>
                        <p className="text-xl font-display font-medium text-emerald-400">High (92%)</p>
                      </div>
                    </div>
                  </div>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                  {/* Detailed Insights Bento Grid */}
                  <div className="lg:col-span-8 space-y-10">
                    {/* Cultivation Guide */}
                    <section className="bg-white border border-slate-200 rounded-3xl p-10 shadow-sm relative overflow-hidden">
                      <div className="absolute top-0 right-0 p-8 text-slate-50">
                        <BookOpen className="w-40 h-40" />
                      </div>
                      <div className="flex items-center gap-4 mb-8">
                        <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center">
                          <BookOpen className="w-5 h-5 text-orange-600" />
                        </div>
                        <h3 className="text-2xl font-display font-bold">01. Cultivation Protocol</h3>
                      </div>
                      <div className="prose prose-slate max-w-none HindiContent text-lg text-slate-700 relative z-10 leading-loose">
                        <ReactMarkdown>{cropDetail}</ReactMarkdown>
                      </div>
                    </section>

                    {/* Resources */}
                    <section className="bg-white border border-slate-200 rounded-3xl p-10 shadow-sm relative overflow-hidden">
                      <div className="absolute top-0 right-0 p-8 text-slate-50">
                        <Droplets className="w-40 h-40" />
                      </div>
                      <div className="flex items-center gap-4 mb-8">
                        <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                          <Droplets className="w-5 h-5 text-blue-600" />
                        </div>
                        <h3 className="text-2xl font-display font-bold">02. Nutrient & Hydration Plan</h3>
                      </div>
                      <div className="prose prose-slate max-w-none HindiContent text-lg text-slate-700 relative z-10 leading-loose">
                        <ReactMarkdown>{fertilizerAdvice}</ReactMarkdown>
                      </div>
                    </section>

                    {/* Risk Advisory */}
                    <section className="bg-red-50 border border-red-100 rounded-3xl p-10 shadow-sm">
                      <div className="flex items-center gap-4 mb-8">
                        <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center">
                          <ShieldAlert className="w-5 h-5 text-red-600" />
                        </div>
                        <h3 className="text-2xl font-display font-bold text-red-900">05. Strategic Guardrails</h3>
                      </div>
                      <div className="prose prose-red max-w-none HindiContent text-lg text-red-800/80 leading-relaxed">
                        <ReactMarkdown>{riskAdvice}</ReactMarkdown>
                      </div>
                    </section>
                  </div>

                  {/* Financial Sidebar */}
                  <div className="lg:col-span-4 space-y-8">
                    <div className="sticky top-32 flex flex-col gap-8">
                      <div className="bg-white border-2 border-slate-900 rounded-3xl p-8 shadow-sm">
                        <h4 className="text-xs font-black uppercase tracking-[0.3em] mb-8 border-b border-slate-100 pb-2">03. Expense Audit</h4>
                        <div className="prose prose-slate max-w-none HindiContent text-sm leading-relaxed">
                          <ReactMarkdown>{costCalc}</ReactMarkdown>
                        </div>
                      </div>

                      <div className="bg-[#059669] text-white rounded-3xl p-8 shadow-xl shadow-emerald-100">
                        <div className="flex items-center gap-3 mb-6">
                           <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                            <TrendingUp className="w-4 h-4 text-white" />
                           </div>
                           <h4 className="text-xs font-black uppercase tracking-[0.3em]">04. Yield Intelligence</h4>
                        </div>
                        <div className="prose prose-invert max-w-none HindiContent font-bold text-2xl leading-tight">
                          <ReactMarkdown>{profitEst}</ReactMarkdown>
                        </div>
                      </div>

                      <button 
                        onClick={resetApp}
                        className="w-full group bg-slate-50 border border-slate-200 py-6 px-4 rounded-2xl flex items-center justify-between hover:bg-slate-100 transition-all font-bold uppercase text-[10px] tracking-[0.2em]"
                      >
                        <span className="group-hover:ml-2 transition-all duration-300">Run New Simulation</span>
                        <RotateCcw className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </main>

        <footer className="mt-32 pt-12 border-t border-slate-200 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-3 grayscale opacity-40">
            <div className="w-6 h-6 bg-slate-900 rounded flex items-center justify-center">
              <Sprout className="w-3 h-3 text-white" />
            </div>
            <span className="text-xs font-black uppercase tracking-widest">Kisan Sahayak AI-Protocol</span>
          </div>
          <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 text-center md:text-right">
            © 2026 Kisan Intelligent Logistics. All data is simulation-based advisory. 
            <br /> <span className="text-emerald-600">Empowering Bharat through Intelligence.</span>
          </div>
        </footer>
      </div>
    </div>
  );
}

