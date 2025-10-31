import React from 'react';
import { PlusIcon, MinusIcon } from './Icons';
import { type Color } from '../utils/colorUtils';

interface PaletteSummaryProps {
    palette: Color[];
    onSizeChange: (newSize: number) => void;
    onColorUpdate: (index: number, newColor: string) => void;
    selectedColorIndex: number | null;
    setSelectedColorIndex: (index: number | null) => void;
}

const PaletteSummary: React.FC<PaletteSummaryProps> = ({ palette, onSizeChange, onColorUpdate, selectedColorIndex, setSelectedColorIndex }) => {
    
    const handleColorPick = async (index: number) => {
        if (!('EyeDropper' in window)) {
            alert('Seu navegador não suporta a API EyeDropper.');
            return;
        }

        try {
            setSelectedColorIndex(index);
            const eyeDropper = new (window as any).EyeDropper();
            const result = await eyeDropper.open();
            onColorUpdate(index, result.sRGBHex);
        } catch (e) {
            console.log('Seleção de cor cancelada.');
        }
    };
    
    return (
        <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-4 flex items-center space-x-4">
            <div className="flex-grow flex items-center overflow-x-auto">
                <div className="flex h-12 rounded-md overflow-hidden">
                    {palette.map((color, index) => (
                        <div
                            key={index}
                            className={`w-12 h-12 flex-shrink-0 cursor-pointer transition-all ${selectedColorIndex === index ? 'ring-2 ring-blue-500 ring-inset' : ''}`}
                            style={{ backgroundColor: color.hex }}
                            title={color.hex}
                            onClick={() => handleColorPick(index)}
                        />
                    ))}
                </div>
            </div>
            <div className="flex items-center space-x-2">
                 <button 
                    onClick={() => onSizeChange(palette.length - 1)} 
                    disabled={palette.length <= 2}
                    className="p-2 rounded-full bg-[#21262d] hover:bg-[#30363d] disabled:opacity-50 disabled:cursor-not-allowed transition-colors" 
                    aria-label="Diminuir cores">
                    <MinusIcon />
                </button>
                 <button 
                    onClick={() => onSizeChange(palette.length + 1)} 
                    disabled={palette.length >= 20}
                    className="p-2 rounded-full bg-[#21262d] hover:bg-[#30363d] disabled:opacity-50 disabled:cursor-not-allowed transition-colors" 
                    aria-label="Aumentar cores">
                    <PlusIcon />
                </button>
            </div>
        </div>
    );
};

export default PaletteSummary;
