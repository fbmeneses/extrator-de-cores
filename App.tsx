import React, { useState, useCallback, useRef, useEffect } from 'react';
import ImageUploader from './components/ImageUploader';
import PaletteSummary from './components/PaletteSummary';
import EditablePalette from './components/EditablePalette';
import { type Color, rgbToHex, hexToRgb, rgbToHsl } from './utils/colorUtils';
import { ZoomInIcon, ZoomOutIcon, ResetZoomIcon } from './components/Icons';

declare const ColorThief: any;
declare const jspdf: any;

const MOCK_IMAGE_SRC = 'https://images.pexels.com/photos/1269968/pexels-photo-1269968.jpeg';

const App: React.FC = () => {
    const [imageSrc, setImageSrc] = useState<string | null>(null);
    const [palette, setPalette] = useState<Color[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedColorIndex, setSelectedColorIndex] = useState<number | null>(null);
    
    // State for zoom and pan
    const [zoom, setZoom] = useState(1);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [baseScale, setBaseScale] = useState(1);

    const imageRef = useRef<HTMLImageElement>(null);
    const imageContainerRef = useRef<HTMLDivElement>(null);
    const currentObjectUrl = useRef<string | null>(null);
    const nextColorToAdd = useRef<'white' | 'gray'>('white');
    const isDraggingRef = useRef(false);
    const dragStartRef = useRef({ x: 0, y: 0 });
    const positionRef = useRef({ x: 0, y: 0 });

    useEffect(() => {
        positionRef.current = position;
    }, [position]);

    const extractPalette = useCallback(() => {
        if (!imageRef.current) {
            setIsLoading(false);
            return;
        }

        try {
            const colorThief = new ColorThief();
            const result = colorThief.getPalette(imageRef.current, 8);

            if (result && Array.isArray(result) && result.length > 0) {
                const newPalette: Color[] = result.map((rgb: [number, number, number]) => ({
                    rgb: `rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]})`,
                    hex: rgbToHex(rgb[0], rgb[1], rgb[2]),
                    hsl: rgbToHsl(rgb[0], rgb[1], rgb[2]),
                }));
                setPalette(newPalette);
                setError(null);
            } else {
                console.warn("ColorThief did not return a valid palette. Result:", result);
                setError('Não foi possível extrair a paleta. A imagem pode ser muito pequena, ter poucas cores ou ser de um formato incompatível.');
                setPalette([]);
            }
        } catch (e) {
            console.error("Error extracting colors:", e);
            setError('Ocorreu um erro ao extrair as cores. Verifique a URL da imagem ou tente uma imagem diferente.');
            setPalette([]);
        } finally {
            setIsLoading(false);
        }
    }, []);
    
    const handleImageLoad = useCallback(() => {
        if (imageRef.current && imageContainerRef.current) {
            const img = imageRef.current;
            const container = imageContainerRef.current;
            const { clientWidth: containerWidth, clientHeight: containerHeight } = container;
            const { naturalWidth: imageWidth, naturalHeight: imageHeight } = img;

            if (imageWidth > 0 && imageHeight > 0) {
                const scale = Math.min(containerWidth / imageWidth, containerHeight / imageHeight);
                setBaseScale(scale);
                setZoom(scale);
                setPosition({ x: 0, y: 0 });
            }
        }
        extractPalette();
    }, [extractPalette]);

    const loadImageFromUrl = useCallback(async (url: string) => {
        setIsLoading(true);
        setError(null);
        setPalette([]);
        setSelectedColorIndex(null);
        nextColorToAdd.current = 'white';

        if (currentObjectUrl.current) {
            URL.revokeObjectURL(currentObjectUrl.current);
            currentObjectUrl.current = null;
        }
        
        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            const blob = await response.blob();
            if (!blob.type.startsWith('image/')) {
                throw new Error('A URL não aponta para um formato de imagem válido.');
            }
            const objectUrl = URL.createObjectURL(blob);
            currentObjectUrl.current = objectUrl;
            setImageSrc(objectUrl);
        } catch (e) {
            console.error("Failed to load image from URL:", e);
            setError('Falha ao carregar a imagem. Verifique a URL e as permissões de CORS.');
            setIsLoading(false);
            setImageSrc(null);
        }
    }, []);

    useEffect(() => {
        loadImageFromUrl(MOCK_IMAGE_SRC);
    }, [loadImageFromUrl]);

    const handleImageUpload = useCallback((file: File) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            if (currentObjectUrl.current) {
                URL.revokeObjectURL(currentObjectUrl.current);
                currentObjectUrl.current = null;
            }
            setIsLoading(true);
            setError(null);
            setPalette([]);
            setSelectedColorIndex(null);
            nextColorToAdd.current = 'white';
            setImageSrc(e.target?.result as string);
        };
        reader.readAsDataURL(file);
    }, []);
    
    const handleUrlUpload = useCallback((url: string) => {
      if (!url.trim()) {
        setError("Por favor, insira uma URL válida.");
        return;
      }
      loadImageFromUrl(url);
    }, [loadImageFromUrl]);

    const handlePaletteSizeChange = useCallback((newSize: number) => {
        if (newSize >= 2 && newSize <= 20) {
            setPalette(prevPalette => {
                if (newSize > prevPalette.length) {
                    const colorsToAdd = newSize - prevPalette.length;
                    const newColors: Color[] = [];

                    const whiteColor: Color = {
                        hex: '#FFFFFF',
                        rgb: 'rgb(255, 255, 255)',
                        hsl: '0, 0%, 100%',
                    };

                    const grayRgb = hexToRgb('#9f9f9f')!;
                    const grayColor: Color = {
                        hex: '#9F9F9F',
                        rgb: `rgb(${grayRgb[0]}, ${grayRgb[1]}, ${grayRgb[2]})`,
                        hsl: rgbToHsl(grayRgb[0], grayRgb[1], grayRgb[2]),
                    };

                    for (let i = 0; i < colorsToAdd; i++) {
                        if (nextColorToAdd.current === 'white') {
                            newColors.push(whiteColor);
                            nextColorToAdd.current = 'gray';
                        } else {
                            newColors.push(grayColor);
                            nextColorToAdd.current = 'white';
                        }
                    }
                    return [...prevPalette, ...newColors];
                } else if (newSize < prevPalette.length) {
                    if(selectedColorIndex && selectedColorIndex >= newSize) {
                        setSelectedColorIndex(null);
                    }
                    return prevPalette.slice(0, newSize);
                }
                return prevPalette;
            });
        }
    }, [selectedColorIndex]);

    const handleColorUpdate = useCallback((index: number, newHex: string) => {
        const rgbArray = hexToRgb(newHex);
        if (!rgbArray) return;

        const newColor: Color = {
            hex: newHex,
            rgb: `rgb(${rgbArray[0]}, ${rgbArray[1]}, ${rgbArray[2]})`,
            hsl: rgbToHsl(rgbArray[0], rgbArray[1], rgbArray[2])
        };

        setPalette(prevPalette => {
            const updatedPalette = [...prevPalette];
            updatedPalette[index] = newColor;
            return updatedPalette;
        });
    }, []);

    const handleExport = async () => {
        if (!imageSrc || palette.length === 0) return;

        const { jsPDF } = jspdf;
        const doc = new jsPDF({
            orientation: 'p',
            unit: 'px',
            format: 'a4'
        });

        const page_width = doc.internal.pageSize.getWidth();
        const margin = 20;
        let y_pos = margin;

        doc.setFontSize(24);
        doc.text("Paleta de Cores Extraída", margin, y_pos);
        y_pos += 30;

        if (imageRef.current) {
            const img = imageRef.current;
            const ratio = img.naturalWidth / img.naturalHeight;
            const imgWidth = page_width - (margin * 2);
            const imgHeight = imgWidth / ratio;
            doc.addImage(imageSrc, 'JPEG', margin, y_pos, imgWidth, imgHeight);
            y_pos += imgHeight + 20;
        }

        doc.setFontSize(16);
        doc.text("Paleta de cores resumo", margin, y_pos);
        y_pos += 20;

        const swatchSize = 30;
        const swatchMargin = 5;
        let x_pos = margin;
        palette.forEach(color => {
            doc.setFillColor(color.hex);
            doc.rect(x_pos, y_pos, swatchSize, swatchSize, 'F');
            x_pos += swatchSize + swatchMargin;
        });
        y_pos += swatchSize + 30;

        doc.setFontSize(16);
        doc.text("Códigos das Cores", margin, y_pos);
        y_pos += 20;

        doc.setFontSize(10);
        palette.forEach(color => {
            if (y_pos > doc.internal.pageSize.getHeight() - 80) {
                doc.addPage();
                y_pos = margin;
            }
            doc.setFillColor(color.hex);
            doc.rect(margin, y_pos, swatchSize, swatchSize, 'F');

            const text_x_pos = margin + swatchSize + 10;
            doc.text(`HEX: ${color.hex}`, text_x_pos, y_pos + 10);
            doc.text(`RGB: ${color.rgb}`, text_x_pos, y_pos + 20);
            doc.text(`HSL: ${color.hsl}`, text_x_pos, y_pos + 30);
            y_pos += swatchSize + 15;
        });

        doc.save('paleta-de-cores.pdf');
    };

    const handleReset = useCallback(() => {
        loadImageFromUrl(MOCK_IMAGE_SRC);
    }, [loadImageFromUrl]);

    // Handlers for zoom and pan
    const handleZoomIn = () => {
        setZoom(prev => Math.min(prev * 1.2, 5)); // Max zoom 5x
    };
    const handleZoomOut = () => {
        setZoom(prev => Math.max(prev / 1.2, baseScale * 0.9));
    };
    const handleResetZoom = useCallback(() => {
        setZoom(baseScale);
        setPosition({ x: 0, y: 0 });
    }, [baseScale]);

    const handleMouseDown = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
        if (e.button !== 0 || !imageRef.current) return;
        e.preventDefault();
        isDraggingRef.current = true;
        dragStartRef.current = {
            x: e.clientX - positionRef.current.x,
            y: e.clientY - positionRef.current.y
        };
        document.body.style.cursor = 'grabbing';
    }, []);

    const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
        if (!isDraggingRef.current || !imageRef.current) return;
        e.preventDefault();
        const newX = e.clientX - dragStartRef.current.x;
        const newY = e.clientY - dragStartRef.current.y;
        setPosition({ x: newX, y: newY });
    }, []);

    const handleMouseUp = useCallback(() => {
        isDraggingRef.current = false;
        document.body.style.cursor = '';
    }, []);

    return (
        <div className="h-screen bg-black text-[#c9d1d9] font-sans overflow-hidden">
            <div className="p-6 sm:p-8 h-full flex flex-col">
                <h1 className="text-4xl sm:text-5xl font-bold mb-8 flex-shrink-0">Extrator de Cores</h1>
                <main className="flex flex-col lg:flex-row lg:gap-8 flex-1 min-h-0">
                    {/* Container for Sidebar, Image, and Summary */}
                    <div className="flex-1 min-w-0 flex flex-col">
                        <div className="flex-1 flex flex-col lg:flex-row lg:gap-8 min-h-0">
                            <aside className="w-full lg:w-[250px] lg:flex-shrink-0">
                                <h2 className="text-xl font-semibold mb-4">Carregar Imagem</h2>
                                <ImageUploader 
                                    onImageUpload={handleImageUpload} 
                                    onUrlUpload={handleUrlUpload}
                                    onExport={handleExport}
                                    onReset={handleReset}
                                    isPaletteGenerated={palette.length > 0}
                                />
                            </aside>

                            <div className="flex-1 min-h-0 flex flex-col mt-8 lg:mt-0 min-w-0">
                                <h2 className="text-xl font-semibold mb-4">Imagem</h2>
                                <div 
                                    ref={imageContainerRef}
                                    className="bg-[#161b22] border border-[#30363d] rounded-lg p-4 flex-1 flex items-center justify-center relative overflow-hidden select-none"
                                    onMouseDown={handleMouseDown}
                                    onMouseMove={handleMouseMove}
                                    onMouseUp={handleMouseUp}
                                    onMouseLeave={handleMouseUp}
                                    onWheel={(e) => { e.preventDefault(); }}
                                >
                                    {imageSrc ? (
                                        <img
                                            ref={imageRef}
                                            src={imageSrc}
                                            alt="Imagem para extração de cores"
                                            className="max-w-none max-h-none rounded"
                                            style={{ 
                                                transform: `translate(${position.x}px, ${position.y}px) scale(${zoom})`,
                                                cursor: 'grab'
                                            }}
                                            onLoad={handleImageLoad}
                                            onError={() => {
                                                setError('Falha ao carregar a imagem. Verifique a URL ou o arquivo.');
                                                setIsLoading(false);
                                            }}
                                            draggable="false"
                                        />
                                    ) : (
                                        <p className="text-[#8b949e]">A pré-visualização da imagem aparecerá aqui</p>
                                    )}

                                    {imageSrc && (
                                        <div className="absolute bottom-4 right-4 z-10 flex items-center space-x-1 bg-black bg-opacity-50 p-1.5 rounded-lg">
                                            <button onClick={handleZoomIn} className="p-2 text-white hover:bg-white/20 rounded-md transition-colors" aria-label="Aumentar zoom">
                                                <ZoomInIcon />
                                            </button>
                                            <button onClick={handleZoomOut} className="p-2 text-white hover:bg-white/20 rounded-md transition-colors" aria-label="Diminuir zoom">
                                                <ZoomOutIcon />
                                            </button>
                                            <button onClick={handleResetZoom} className="p-2 text-white hover:bg-white/20 rounded-md transition-colors" aria-label="Resetar zoom">
                                                <ResetZoomIcon />
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                        
                        <div className="flex-shrink-0 mt-8">
                            {error && <p className="text-red-400 mb-4">{error}</p>}

                            {(isLoading || palette.length > 0) && (
                                <div>
                                    <h2 className="text-xl font-semibold mb-4">Paleta de cores resumo</h2>
                                    {isLoading ? (
                                        <div className="flex items-center justify-center h-20 bg-[#161b22] border border-[#30363d] rounded-lg">
                                            <p>Extraindo cores...</p>
                                        </div>
                                    ) : palette.length > 0 ? (
                                        <PaletteSummary
                                            palette={palette}
                                            onSizeChange={handlePaletteSizeChange}
                                            onColorUpdate={handleColorUpdate}
                                            selectedColorIndex={selectedColorIndex}
                                            setSelectedColorIndex={setSelectedColorIndex}
                                        />
                                    ) : null }
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="mt-8 lg:mt-0 w-full lg:w-[450px] lg:flex-shrink-0 flex flex-col">
                        <h2 className="text-xl font-semibold mb-4 flex-shrink-0">Paleta de cores editável</h2>
                        <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-4 flex-1 min-h-0 overflow-y-auto">
                            {isLoading && palette.length === 0 ? (
                                <div className="flex items-center justify-center h-40">
                                    <p>Analisando imagem...</p>
                                </div>
                            ) : (
                                <EditablePalette
                                    palette={palette}
                                    onColorUpdate={handleColorUpdate}
                                    selectedColorIndex={selectedColorIndex}
                                    setSelectedColorIndex={setSelectedColorIndex}
                                />
                            )}
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default App;