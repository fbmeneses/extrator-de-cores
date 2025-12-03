import React, { useState, useRef, useEffect } from 'react';
import { type Color } from '../utils/colorUtils';
import { CopyIcon, CheckIcon, CloseIcon } from './Icons';

interface EditablePaletteProps {
    palette: Color[];
    onColorUpdate: (index: number, newColor: string) => void;
    onColorRemove: (index: number) => void;
    selectedColorIndex: number | null;
    setSelectedColorIndex: (index: number | null) => void;
}

interface EditableColorItemProps { 
    color: Color; 
    index: number; 
    isSelected: boolean;
    onSelect: () => void;
    onColorUpdate: (index: number, newColor: string) => void;
    onRemove: (index: number) => void;
}

const EditableColorItem = React.forwardRef<HTMLDivElement, EditableColorItemProps>(
    ({ color, index, isSelected, onSelect, onColorUpdate, onRemove }, ref) => {
    const [copied, setCopied] = useState<string | null>(null);

    const handleCopy = (text: string, type: string) => {
        navigator.clipboard.writeText(text);
        setCopied(type);
        setTimeout(() => setCopied(null), 2000);
    };
    
    const handleColorPick = async (event: React.MouseEvent) => {
        event.stopPropagation();
        if (!('EyeDropper' in window)) {
            alert('Seu navegador não suporta a API EyeDropper.');
            return;
        }

        try {
            onSelect();
            const eyeDropper = new (window as any).EyeDropper();
            const result = await eyeDropper.open();
            onColorUpdate(index, result.sRGBHex);
        } catch (e) {
            console.log('Seleção de cor cancelada.');
        }
    };

    const ColorValueRow: React.FC<{ label: string; value: string }> = ({ label, value }) => (
        <div className="flex items-center justify-between text-sm py-2 border-b border-[#21262d]">
            <span className="text-[#8b949e]">{label}</span>
            <div className="flex items-center space-x-2">
                <span className="font-mono">{value}</span>
                <button onClick={(e) => { e.stopPropagation(); handleCopy(value, label);}} className="text-[#8b949e] hover:text-white">
                    {copied === label ? <CheckIcon /> : <CopyIcon />}
                </button>
            </div>
        </div>
    );

    return (
        <div 
            ref={ref}
            className={`bg-[#161b22] border border-[#30363d] rounded-lg p-4 transition-all cursor-pointer relative ${isSelected ? 'border-blue-500 ring-2 ring-blue-500' : ''}`}
            onClick={onSelect}
        >
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    onRemove(index);
                }}
                className="absolute top-2 right-2 p-1 bg-black/30 hover:bg-black/60 rounded-full text-white/70 hover:text-white transition-colors z-10"
                title="Remover cor"
            >
                <CloseIcon />
            </button>
            <div 
                className="w-full h-24 rounded-md mb-4"
                style={{ backgroundColor: color.hex }}
                onClick={handleColorPick}
                title="Clique para escolher uma nova cor"
            />
            <div className="space-y-1">
                <ColorValueRow label="HEX" value={color.hex} />
                <ColorValueRow label="RGB" value={color.rgb.replace('rgb', '')} />
                <ColorValueRow label="HSL" value={color.hsl} />
            </div>
        </div>
    );
});
EditableColorItem.displayName = "EditableColorItem";

const EditablePalette: React.FC<EditablePaletteProps> = ({ palette, onColorUpdate, onColorRemove, selectedColorIndex, setSelectedColorIndex }) => {
    const colorItemRefs = useRef<(HTMLDivElement | null)[]>([]);
    
    useEffect(() => {
        colorItemRefs.current = colorItemRefs.current.slice(0, palette.length);
    }, [palette.length]);

    useEffect(() => {
        if (selectedColorIndex !== null && colorItemRefs.current[selectedColorIndex]) {
            colorItemRefs.current[selectedColorIndex]?.scrollIntoView({
                behavior: 'smooth',
                block: 'nearest',
            });
        }
    }, [selectedColorIndex]);
    
    if (palette.length === 0) {
        return (
            <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-4 min-h-[400px] flex items-center justify-center">
                <p className="text-[#8b949e]">A paleta de cores aparecerá aqui.</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {palette.map((color, index) => (
                <EditableColorItem 
                    // FIX: A ref callback must return void or a cleanup function.
                    // The original implementation implicitly returned the assigned element, causing a type error.
                    // Wrapping the assignment in curly braces creates a block body, ensuring a void return.
                    ref={el => { colorItemRefs.current[index] = el; }}
                    key={`${color.hex}-${index}`} 
                    color={color} 
                    index={index} 
                    isSelected={selectedColorIndex === index}
                    onSelect={() => setSelectedColorIndex(index)}
                    onColorUpdate={onColorUpdate} 
                    onRemove={onColorRemove}
                />
            ))}
        </div>
    );
};

export default EditablePalette;