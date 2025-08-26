'use client';

import { useState, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Upload, X, FileText, Image, File } from 'lucide-react';
import { AssetBasics } from '../hooks/use-asset-creation-wizard';

interface AssetBasicsStepProps {
  wizard: {
    data: { assetBasics: AssetBasics };
    updateAssetBasics: (updates: Partial<AssetBasics>) => void;
  };
}

const ASSET_TYPES = [
  'Real Estate',
  'Infrastructure',
  'Renewable Energy',
  'Private Equity',
  'Commodities',
  'Art & Collectibles',
  'Intellectual Property',
  'Agriculture',
  'Mining',
  'Other',
];

const SECTORS = [
  'Technology',
  'Healthcare',
  'Finance',
  'Energy',
  'Manufacturing',
  'Consumer Goods',
  'Real Estate',
  'Transportation',
  'Utilities',
  'Other',
];

const CURRENCIES = ['USD', 'EUR', 'GBP', 'HKD', 'SGD', 'JPY', 'CHF', 'CAD', 'AUD'];

export function AssetBasicsStep({ wizard }: AssetBasicsStepProps) {
  const { data, updateAssetBasics } = wizard;
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);

  const handleFileUpload = (files: FileList | null) => {
    if (!files) return;
    
    const newFiles = Array.from(files);
    const validFiles = newFiles.filter(file => {
      const maxSize = 10 * 1024 * 1024; // 10MB
      const allowedTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'image/jpeg',
        'image/png',
        'text/plain',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      ];
      
      return file.size <= maxSize && allowedTypes.includes(file.type);
    });

    if (validFiles.length !== newFiles.length) {
      alert('Some files were rejected. Only PDF, Word, Excel, images, and text files up to 10MB are allowed.');
    }

    updateAssetBasics({
      documents: [...data.assetBasics.documents, ...validFiles]
    });
  };

  const removeDocument = (index: number) => {
    updateAssetBasics({
      documents: data.assetBasics.documents.filter((_, i) => i !== index)
    });
  };

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) return <Image className="h-4 w-4" />;
    if (file.type === 'application/pdf') return <FileText className="h-4 w-4" />;
    return <File className="h-4 w-4" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files);
    }
  };

  return (
    <div className="space-y-6">
      {/* Basic Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="asset-name">Asset Name *</Label>
          <Input
            id="asset-name"
            placeholder="e.g., Solar Farm Alpha, Downtown Office Tower"
            value={data.assetBasics.name}
            onChange={(e) => updateAssetBasics({ name: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="asset-type">Asset Type *</Label>
          <Select
            value={data.assetBasics.assetType}
            onValueChange={(value) => updateAssetBasics({ assetType: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select asset type" />
            </SelectTrigger>
            <SelectContent>
              {ASSET_TYPES.map((type) => (
                <SelectItem key={type} value={type}>
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="sector">Sector *</Label>
          <Select
            value={data.assetBasics.sector}
            onValueChange={(value) => updateAssetBasics({ sector: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select sector" />
            </SelectTrigger>
            <SelectContent>
              {SECTORS.map((sector) => (
                <SelectItem key={sector} value={sector}>
                  {sector}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="location">Location *</Label>
          <Input
            id="location"
            placeholder="e.g., California, USA or Hong Kong"
            value={data.assetBasics.location}
            onChange={(e) => updateAssetBasics({ location: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="estimated-value">Estimated Value *</Label>
          <div className="flex gap-2">
            <Input
              id="estimated-value"
              type="number"
              placeholder="1000000"
              value={data.assetBasics.estimatedValue || ''}
              onChange={(e) => updateAssetBasics({ estimatedValue: parseFloat(e.target.value) || 0 })}
            />
            <Select
              value={data.assetBasics.currency}
              onValueChange={(value) => updateAssetBasics({ currency: value })}
            >
              <SelectTrigger className="w-24">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CURRENCIES.map((currency) => (
                  <SelectItem key={currency} value={currency}>
                    {currency}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Label htmlFor="description">Asset Description *</Label>
        <Textarea
          id="description"
          placeholder="Provide a detailed description of the asset, including its purpose, current status, and key characteristics..."
          rows={4}
          value={data.assetBasics.description}
          onChange={(e) => updateAssetBasics({ description: e.target.value })}
        />
      </div>

      {/* Document Upload */}
      <div className="space-y-4">
        <Label>Asset Documents *</Label>
        <p className="text-sm text-muted-foreground">
          Upload relevant documents such as property deeds, financial statements, legal documents, etc.
        </p>

        {/* Drag & Drop Area */}
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            dragActive
              ? 'border-primary bg-primary/5'
              : 'border-border hover:border-primary/50'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-lg font-medium mb-2">
            Drag and drop files here, or{' '}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="text-primary hover:underline"
            >
              browse files
            </button>
          </p>
          <p className="text-sm text-muted-foreground">
            Supports PDF, Word, Excel, images, and text files up to 10MB
          </p>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.txt"
            onChange={(e) => handleFileUpload(e.target.files)}
            className="hidden"
          />
        </div>

        {/* Uploaded Files */}
        {data.assetBasics.documents.length > 0 && (
          <div className="space-y-2">
            <Label>Uploaded Documents ({data.assetBasics.documents.length})</Label>
            <div className="grid gap-2">
              {data.assetBasics.documents.map((file, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-muted rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    {getFileIcon(file)}
                    <div>
                      <p className="font-medium text-sm">{file.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatFileSize(file.size)} • {file.type}
                      </p>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeDocument(index)}
                    className="text-destructive hover:text-destructive"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Validation Summary */}
      <Card className="bg-muted/30">
        <CardHeader>
          <CardTitle className="text-sm">Validation Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${
                data.assetBasics.name ? 'bg-green-500' : 'bg-red-500'
              }`} />
              <span>Name</span>
            </div>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${
                data.assetBasics.description ? 'bg-green-500' : 'bg-red-500'
              }`} />
              <span>Description</span>
            </div>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${
                data.assetBasics.assetType ? 'bg-green-500' : 'bg-red-500'
              }`} />
              <span>Type</span>
            </div>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${
                data.assetBasics.documents.length > 0 ? 'bg-green-500' : 'bg-red-500'
              }`} />
              <span>Documents</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

