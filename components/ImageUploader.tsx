import React, { useRef, useCallback, useEffect, useState } from 'react';
import { UploadIcon, DownloadIcon, ResetIcon } from './Icons';

interface ImageUploaderProps {
    onImageUpload: (file: File) => void;
    onUrlUpload: (url: string) => void;
    onExport: () => void;
    onReset: () => void;
    isPaletteGenerated: boolean;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ onImageUpload, onUrlUpload, onExport, onReset, isPaletteGenerated }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const dropZoneRef = useRef<HTMLDivElement>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [url, setUrl] = useState('');

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            onImageUpload(file);
        }
    };

    const handleButtonClick = () => {
        fileInputRef.current?.click();
    };

    const handlePaste = useCallback((event: ClipboardEvent) => {
        const items = event.clipboardData?.items;
        if (!items) return;

        for (let i = 0; i < items.length; i++) {
            if (items[i].type.indexOf('image') !== -1) {
                const blob = items[i].getAsFile();
                if (blob) {
                    onImageUpload(blob);
                }
                break;
            }
        }
    }, [onImageUpload]);

    const handleDragOver = useCallback((event: DragEvent) => {
        event.preventDefault();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback((event: DragEvent) => {
        event.preventDefault();
        setIsDragging(false);
    }, []);

    const handleDrop = useCallback((event: DragEvent) => {
        event.preventDefault();
        setIsDragging(false);
        const file = event.dataTransfer?.files[0];
        if (file && file.type.startsWith('image/')) {
            onImageUpload(file);
        }
    }, [onImageUpload]);
    
    const handleUrlSubmit = (event: React.FormEvent) => {
        event.preventDefault();
        if (url.trim()) {
            onUrlUpload(url);
        }
    };

    useEffect(() => {
        const dropZone = dropZoneRef.current;
        window.addEventListener('paste', handlePaste);
        dropZone?.addEventListener('dragover', handleDragOver);
        dropZone?.addEventListener('dragleave', handleDragLeave);
        dropZone?.addEventListener('drop', handleDrop);
        
        return () => {
            window.removeEventListener('paste', handlePaste);
            dropZone?.removeEventListener('dragover', handleDragOver);
            dropZone?.removeEventListener('dragleave', handleDragLeave);
            dropZone?.removeEventListener('drop', handleDrop);
        };
    }, [handlePaste, handleDragOver, handleDragLeave, handleDrop]);

    return (
        <div className="flex flex-col space-y-6">
            {/* 1. Upload de Arquivo */}
            <div 
                ref={dropZoneRef}
                className={`bg-[#161b22] border border-[#30363d] rounded-lg p-6 flex flex-col items-center justify-center text-center transition-all ${isDragging ? 'border-blue-500 ring-2 ring-blue-500' : ''}`}
            >
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/png, image/jpeg"
                    className="hidden"
                />
                <button
                    onClick={handleButtonClick}
                    className="bg-[#238636] hover:bg-[#2ea043] text-white font-semibold py-2 px-4 rounded-lg transition-colors flex items-center space-x-2"
                >
                    <UploadIcon />
                    <span>Carregue aqui uma imagem</span>
                </button>
                <p className="text-sm text-[#8b949e] mt-4">Ou arraste e solte, ou cole da área de transferência (Ctrl+V)</p>
            </div>
            
            {/* 2. Upload de URL */}
            <div>
                <p className="text-sm text-[#8b949e] mb-2">Ou carregue a partir de uma URL:</p>
                <form onSubmit={handleUrlSubmit} className="flex flex-col space-y-2">
                    <input
                        type="url"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        placeholder="https://exemplo.com/imagem.jpg"
                        className="flex-grow bg-black border border-[#30363d] rounded-md px-3 py-2 text-sm placeholder-[#8b949e] focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button 
                        type="submit" 
                        className="bg-[#21262d] hover:bg-[#30363d] text-white font-semibold py-2 px-4 rounded-lg transition-colors"
                    >
                        Carregar URL
                    </button>
                </form>
            </div>

            {/* 3. Botão Resetar */}
            <button 
                onClick={onReset} 
                className="w-full flex items-center justify-center space-x-2 bg-[#21262d] hover:bg-[#30363d] text-white text-base font-semibold py-2 px-4 rounded-lg transition-colors"
            >
                <ResetIcon />
                <span>Resetar paleta</span>
            </button>
            
            {/* 4. Botão Download */}
            <button 
                onClick={onExport} 
                disabled={!isPaletteGenerated}
                className="w-full flex items-center justify-center space-x-2 bg-[#21262d] hover:bg-[#30363d] text-white text-base font-semibold py-2 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
                <DownloadIcon />
                <span>Download da paleta</span>
            </button>
        </div>
    );
};

export default ImageUploader;