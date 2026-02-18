'use client';

import { useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import DashboardLayout from '@/components/DashboardLayout';

export default function ContentGeneratorPage() {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [generatedContent, setGeneratedContent] = useState<any>(null);
    const [productName, setProductName] = useState('');
    const [description, setDescription] = useState('');
    const [userId, setUserId] = useState<string | null>(null);

    const supabase = createClient();

    useState(() => {
        // Handle pre-filled data from query params
        if (typeof window !== 'undefined') {
            const params = new URLSearchParams(window.location.search);
            const pName = params.get('productName');
            const pDesc = params.get('description');
            if (pName) setProductName(pName);
            if (pDesc) setDescription(pDesc);
        }
    });

    useState(() => {
        const fetchUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) setUserId(user.id);
        };
        fetchUser();
    });

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setSelectedFile(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const convertToBase64 = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = error => reject(error);
        });
    };

    const handleGenerate = async () => {
        if (!selectedFile) return;

        setIsLoading(true);
        try {
            const base64Image = await convertToBase64(selectedFile);

            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/generate-content`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    productName: productName || 'My Product',
                    description: description || 'A great product',
                    imageBase64: base64Image,
                    userId
                })
            });
            const data = await res.json();
            setGeneratedContent(data);
        } catch (err) {
            console.error("Failed to generate content", err);
            alert("Failed to generate content. Check server logs.");
        } finally {
            setIsLoading(false);
        }
    };

    const socialItems = generatedContent ? [
        ...(generatedContent.pinterest || []).map((p: any) => ({ ...p, type: 'Pin' })),
        ...(generatedContent.instagram || []).map((i: any) => ({ ...i, type: 'Story/Post' }))
    ] : [];

    return (
        <DashboardLayout>
            <div className="max-w-7xl mx-auto px-6 py-6 animate-fade-in-up">
                <div className="bg-white border border-purple-100 shadow-[0_40px_100px_-20px_rgba(168,85,247,0.1)] overflow-hidden rounded-[2.5rem]">
                    <div className="flex bg-purple-50 p-3 items-center justify-between border-b border-purple-100 sticky top-0 bg-white z-10">
                        <div className="flex gap-2.5">
                            <span className="w-3 h-3 rounded-full bg-red-400/60"></span>
                            <span className="w-3 h-3 rounded-full bg-amber-400/60"></span>
                            <span className="w-3 h-3 rounded-full bg-green-400/60"></span>
                        </div>
                        <span className="text-[10px] font-black font-sans text-purple-300 tracking-[0.4em] uppercase text-center flex-1 pr-12">Neural Content Studio</span>
                    </div>
                    <div className="p-8 space-y-8">
                        <div className="flex flex-col md:flex-row items-center justify-between border-b border-purple-50 pb-8">
                            <div>
                                <h2 className="text-4xl lg:text-5xl font-serif text-gray-900 mb-2 italic tracking-tighter">Manifest <span className="text-purple-600">Essence.</span></h2>
                                <p className="text-[10px] font-black tracking-[0.3em] uppercase text-gray-300">Transforming core values into visual assets</p>
                            </div>
                            <div className="mt-6 md:mt-0 flex gap-8">
                                <div className="text-right">
                                    <p className="text-[10px] uppercase tracking-[0.3em] font-black text-gray-300 mb-1">Engine</p>
                                    <p className="text-sm font-bold text-gray-900 tracking-tighter">SDXL + FLUX</p>
                                </div>
                                <div className="w-px h-10 bg-purple-50"></div>
                                <div className="text-right">
                                    <p className="text-[10px] uppercase tracking-[0.3em] font-black text-gray-300 mb-1">Status</p>
                                    <div className="flex items-center gap-2 justify-end">
                                        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                                        <p className="text-sm font-bold text-gray-900 tracking-tighter italic uppercase">online</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
                            <div className="space-y-8">
                                <div className="group space-y-1">
                                    <label className="block text-[10px] font-black tracking-[0.3em] uppercase text-purple-600 mb-2 transition-colors">Product Line</label>
                                    <input
                                        type="text"
                                        value={productName}
                                        onChange={(e) => setProductName(e.target.value)}
                                        className="w-full bg-transparent border-b border-purple-100 py-4 text-gray-900 focus:outline-none focus:border-purple-600 transition-all font-serif placeholder:text-gray-100 text-4xl italic tracking-tighter"
                                        placeholder="Brand Name"
                                    />
                                </div>

                                <div className="group space-y-1">
                                    <label className="block text-[10px] font-black tracking-[0.3em] uppercase text-purple-600 mb-2 transition-colors">Narrative Arc</label>
                                    <textarea
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        rows={4}
                                        className="w-full bg-transparent border-b border-purple-100 py-4 text-gray-700 focus:outline-none focus:border-purple-600 transition-all text-base leading-relaxed placeholder:text-gray-100 resize-none font-light italic"
                                        placeholder="Describe the product's essence..."
                                    />
                                </div>

                                <div
                                    onClick={() => document.getElementById('file-upload')?.click()}
                                    className={`relative aspect-[4/3] border border-purple-50 transition-all duration-1000 flex flex-col items-center justify-center p-8 text-center group cursor-pointer shadow-sm hover:shadow-2xl rounded-[1.5rem] overflow-hidden ${previewUrl ? 'ring-2 ring-purple-600 ring-offset-4' : 'bg-purple-50/20 hover:bg-white'}`}
                                >
                                    <input
                                        type="file"
                                        id="file-upload"
                                        className="hidden"
                                        accept="image/*"
                                        onChange={handleFileChange}
                                    />

                                    {previewUrl ? (
                                        <>
                                            <img src={previewUrl} alt="Preview" className="absolute inset-0 w-full h-full object-cover transition-all duration-1000 group-hover:scale-110 brightness-95 group-hover:brightness-100" />
                                            <div className="absolute inset-0 bg-purple-950/20 group-hover:bg-purple-950/0 transition-all duration-700"></div>
                                            <div className="relative z-10 flex flex-col items-center gap-2">
                                                <div className="bg-white px-8 py-3 shadow-[0_20px_50px_-10px_rgba(0,0,0,0.3)] scale-90 group-hover:scale-100 opacity-0 group-hover:opacity-100 transition-all duration-500 border border-purple-100 rounded-xl">
                                                    <span className="text-gray-900 text-[10px] font-black tracking-[0.3em] uppercase">Swap Reference</span>
                                                </div>
                                            </div>
                                        </>
                                    ) : (
                                        <div className="space-y-6">
                                            <div className="w-20 h-20 border border-purple-100 rounded-3xl flex items-center justify-center mx-auto text-purple-200 group-hover:scale-110 group-hover:border-purple-400 group-hover:text-purple-400 transition-all duration-700 bg-white shadow-xl shadow-purple-500/5">
                                                <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-[10px] font-black tracking-[0.4em] uppercase text-purple-300">Drop Source Asset</p>
                                                <p className="text-[10px] italic font-medium text-gray-200 uppercase tracking-widest">Neural analysis requires a visual anchor</p>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <button
                                    onClick={handleGenerate}
                                    disabled={isLoading || !selectedFile}
                                    className="w-full py-6 bg-gradient-to-r from-purple-700 to-blue-700 text-white text-[11px] font-black tracking-[0.5em] uppercase hover:shadow-2xl hover:shadow-purple-500/20 rounded-2xl transition-all disabled:opacity-30 disabled:cursor-not-allowed group relative overflow-hidden active:scale-[0.98]"
                                >
                                    <span className="relative z-10">{isLoading ? "Processing Manifestation..." : "Synthesize Assets"}</span>
                                    {!isLoading && <div className="absolute inset-0 bg-white/10 -translate-x-full group-hover:translate-x-0 transition-transform duration-700 ease-in-out"></div>}
                                    {isLoading && <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin ml-4"></span>}
                                </button>
                            </div>

                            <div className="relative min-h-[400px] h-full flex flex-col">
                                {!generatedContent && !isLoading && (
                                    <div className="flex-1 flex flex-col items-center justify-center italic text-purple-100 space-y-8 animate-pulse border-2 border-dashed border-purple-50 bg-purple-50/10 rounded-[2rem]">
                                        <div className="w-40 h-px bg-purple-50/50"></div>
                                        <p className="text-5xl font-serif tracking-tighter">Studio <span className="text-purple-600">Idle.</span></p>
                                        <p className="text-[10px] font-black tracking-[0.4em] uppercase text-purple-300">Connect assets to begin session</p>
                                        <div className="w-40 h-px bg-purple-50/50"></div>
                                    </div>
                                )}

                                {isLoading && (
                                    <div className="flex-1 flex flex-col items-center justify-center gap-10 bg-white border border-purple-100 shadow-inner rounded-[2rem]">
                                        <div className="relative">
                                            <div className="w-40 h-40 border-t-2 border-purple-600 rounded-full animate-spin [animation-duration:3s]"></div>
                                            <div className="absolute inset-3 border-r-2 border-blue-400 rounded-full animate-spin [animation-duration:2s] [animation-direction:reverse]"></div>
                                            <div className="absolute inset-6 border-b-2 border-purple-200 rounded-full animate-spin [animation-duration:1.5s]"></div>
                                            <div className="absolute inset-0 flex items-center justify-center">
                                                <div className="w-3 h-3 bg-purple-600 rounded-full animate-ping"></div>
                                            </div>
                                        </div>
                                        <div className="text-center space-y-3">
                                            <p className="text-[10px] font-black tracking-[0.5em] uppercase text-gray-900">Neural Link Active</p>
                                            <p className="text-xs italic font-medium text-gray-300 uppercase tracking-widest leading-relaxed">Bridging visual essence to marketing DNA</p>
                                        </div>
                                    </div>
                                )}

                                {generatedContent && (
                                    <div className="flex-1 bg-gray-950 p-10 text-white space-y-12 animate-fade-in rounded-[2rem] shadow-2xl relative overflow-hidden border border-white/5">
                                        <div className="absolute top-0 right-0 w-64 h-64 bg-purple-600/10 rounded-full blur-3xl -mr-32 -mt-32"></div>
                                        <div className="relative z-10 flex justify-between items-start border-b border-white/10 pb-8">
                                            <div>
                                                <h4 className="text-[10px] font-black tracking-[0.4em] uppercase text-white/30 mb-3">Aesthetic Signature</h4>
                                                <p className="text-6xl font-serif italic text-purple-400 leading-none tracking-tighter">High-Impact</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-[10px] font-black tracking-[0.4em] uppercase text-white/30 mb-2">Score</p>
                                                <p className="text-4xl font-serif text-amber-500 italic tracking-tighter">{generatedContent.ai_analysis?.aesthetic_score || 'N/A'}<span className="text-xs text-white/10 not-italic ml-1 font-sans">/10</span></p>
                                            </div>
                                        </div>

                                        <div className="relative z-10 space-y-10">
                                            <div className="space-y-6">
                                                <h5 className="text-[10px] font-black tracking-[0.4em] uppercase text-white/30 italic">Chromatic Profile</h5>
                                                <div className="flex gap-4">
                                                    {generatedContent.ai_analysis?.color_palette?.map((c: string, i: number) => (
                                                        <div key={i} className="group relative">
                                                            <div className="w-12 h-12 rounded-2xl border border-white/10 shadow-2xl transition-all duration-500 group-hover:scale-110 group-hover:rotate-12" style={{ backgroundColor: c }}></div>
                                                            <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-[9px] font-black font-sans opacity-0 group-hover:opacity-100 transition-opacity uppercase tracking-widest text-purple-200">{c}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            <div className="space-y-6 pt-4">
                                                <h5 className="text-[10px] font-black tracking-[0.4em] uppercase text-white/30 italic">Algorithmic Signals</h5>
                                                <div className="flex flex-wrap gap-3">
                                                    {generatedContent.ai_analysis?.hashtags?.map((t: string, i: number) => (
                                                        <span key={i} className="text-[10px] font-black uppercase tracking-[0.2em] bg-white/5 border border-white/10 px-4 py-2 rounded-lg hover:bg-purple-600 hover:text-white hover:border-purple-500 transition-all cursor-default">{t}</span>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="relative z-10 pt-10 border-t border-white/5 flex justify-between items-center">
                                            <p className="text-[9px] font-black tracking-[0.5em] uppercase text-white/10">Neural Manifest V2.0</p>
                                            <div className="flex gap-1">
                                                {[1, 2, 3].map(i => <div key={i} className="w-1 h-1 rounded-full bg-purple-600/30"></div>)}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {generatedContent && (
                            <div className="pt-24 border-t border-purple-100">
                                <div className="flex flex-col md:flex-row items-center justify-between mb-16 gap-6">
                                    <h3 className="text-[10px] font-black tracking-[0.5em] uppercase text-purple-300">Generated Neural Assets</h3>
                                    <div className="flex gap-4 text-[10px] font-black text-gray-900 uppercase tracking-[0.3em] bg-purple-50 px-8 py-4 rounded-2xl shadow-sm border border-purple-100">
                                        <span className="text-purple-600 underline underline-offset-8 decoration-2 flex items-center gap-2">
                                            <span className="w-1.5 h-1.5 rounded-full bg-purple-600"></span> Pinterest
                                        </span>
                                        <span className="text-purple-100 mx-2">/</span>
                                        <span className="text-gray-300">Instagram</span>
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-16">
                                    {socialItems.map((item: any, idx: number) => (
                                        <VisualAsset key={idx} item={item} />
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}

function VisualAsset({ item }: { item: any }) {
    const [imgLoaded, setImgLoaded] = useState(false);

    return (
        <div className="group flex flex-col">
            <div className="aspect-[4/5] relative overflow-hidden bg-purple-50 border border-purple-100 shadow-sm transition-all duration-1000 group-hover:shadow-[0_40px_80px_-20px_rgba(168,85,247,0.2)] rounded-[2.5rem] group-hover:rotate-1">
                {!imgLoaded && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-purple-50/50 backdrop-blur-sm">
                        <div className="w-10 h-10 border-4 border-purple-100 border-t-purple-600 rounded-full animate-spin"></div>
                        <p className="mt-6 text-[10px] font-black tracking-[0.4em] uppercase text-purple-300">Synthesizing...</p>
                    </div>
                )}
                <img
                    src={item.url}
                    alt={item.type}
                    onLoad={() => setImgLoaded(true)}
                    className={`w-full h-full object-cover transition-all duration-[2s] ease-out group-hover:scale-110 ${imgLoaded ? 'opacity-100' : 'opacity-0'}`}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-purple-900/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000"></div>
                <div className="absolute top-8 left-8 flex items-center gap-3 transform -translate-x-4 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-700">
                    <span className="bg-white/90 backdrop-blur-md px-4 py-2 text-[10px] font-black tracking-[0.2em] uppercase text-gray-900 shadow-2xl rounded-xl border border-white/50">
                        {item.type}
                    </span>
                    <span className="w-2 h-2 rounded-full bg-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.8)] animate-pulse"></span>
                </div>
            </div>
            <div className="py-10 space-y-8 pl-4">
                {item.type === 'Pin' ? (
                    <h5 className="text-3xl font-serif italic text-gray-900 leading-[1.1] transition-all duration-500 group-hover:text-purple-600 tracking-tighter uppercase">"{item.title}"</h5>
                ) : (
                    <p className="text-lg text-gray-500 font-light leading-relaxed italic border-l-4 border-purple-50 pl-6 group-hover:border-purple-600 transition-all duration-1000 group-hover:text-gray-900">"{item.caption}"</p>
                )}
                <div className="flex items-center gap-10 pt-4">
                    <button className="text-[10px] font-black tracking-[0.4em] uppercase text-gray-900 group-hover:text-purple-600 transition-all relative overflow-hidden group/btn">
                        <span className="relative z-10">Download</span>
                        <div className="absolute bottom-0 left-0 w-full h-0.5 bg-purple-600/10 group-hover/btn:h-full transition-all duration-300 -z-0"></div>
                    </button>
                    <button className="text-[10px] font-black tracking-[0.4em] uppercase text-gray-300 hover:text-gray-900 transition-colors">Archive</button>
                </div>
            </div>
        </div>
    );
}

