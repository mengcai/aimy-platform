'use client';

import { useRef, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Upload, X, FileText, Shield, Globe, Building2 } from 'lucide-react';
import { LegalWrapper } from '../hooks/use-asset-creation-wizard';

interface LegalWrapperStepProps {
  wizard: {
    data: { legalWrapper: LegalWrapper };
    updateLegalWrapper: (updates: Partial<LegalWrapper>) => void;
  };
}

const JURISDICTIONS = [
  'United States',
  'European Union',
  'United Kingdom',
  'Hong Kong',
  'Singapore',
  'Switzerland',
  'Cayman Islands',
  'Bermuda',
  'Luxembourg',
  'Other',
];

const REGULATORY_FRAMEWORKS = [
  'Regulation D (Reg D)',
  'Regulation S (Reg S)',
  'Regulation A+ (Reg A+)',
  'MiCA (Markets in Crypto-Assets)',
  'HK SFC Sandbox',
  'MAS Sandbox',
  'FCA Sandbox',
  'SEC Framework',
  'ESMA Guidelines',
  'Other',
];

const COMPLIANCE_DOCUMENT_TYPES = [
  'Legal Opinion',
  'Compliance Certificate',
  'Regulatory Approval',
  'KYC/AML Policy',
  'Risk Disclosure',
  'Terms of Service',
  'Privacy Policy',
  'Other',
];

export function LegalWrapperStep({ wizard }: LegalWrapperStepProps) {
  const { data, updateLegalWrapper } = wizard;
  const legalOpinionRef = useRef<HTMLInputElement>(null);
  const complianceDocsRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);

  const handleRegulatoryFrameworkToggle = (framework: string) => {
    const current = data.legalWrapper.regulatoryFramework;
    const updated = current.includes(framework)
      ? current.filter(f => f !== framework)
      : [...current, framework];
    
    updateLegalWrapper({ regulatoryFramework: updated });
  };

  const handleFileUpload = (files: FileList | null, type: 'legalOpinion' | 'complianceDocuments') => {
    if (!files) return;
    
    const newFiles = Array.from(files);
    const validFiles = newFiles.filter(file => {
      const maxSize = 10 * 1024 * 1024; // 10MB
      const allowedTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'text/plain',
      ];
      
      return file.size <= maxSize && allowedTypes.includes(file.type);
    });

    if (validFiles.length !== newFiles.length) {
      alert('Some files were rejected. Only PDF, Word, and text files up to 10MB are allowed.');
    }

    if (type === 'legalOpinion') {
      updateLegalWrapper({ legalOpinion: validFiles[0] || null });
    } else {
      updateLegalWrapper({
        complianceDocuments: [...data.legalWrapper.complianceDocuments, ...validFiles]
      });
    }
  };

  const removeComplianceDocument = (index: number) => {
    updateLegalWrapper({
      complianceDocuments: data.legalWrapper.complianceDocuments.filter((_, i) => i !== index)
    });
  };

  const getFileIcon = (file: File) => {
    if (file.type === 'application/pdf') return <FileText className="h-4 w-4" />;
    return <FileText className="h-4 w-4" />;
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

  const handleDrop = (e: React.DragEvent, type: 'legalOpinion' | 'complianceDocuments') => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files, type);
    }
  };

  return (
    <div className="space-y-6">
      {/* Jurisdiction Selection */}
      <div className="space-y-4">
        <Label htmlFor="jurisdiction">Primary Jurisdiction *</Label>
        <Select
          value={data.legalWrapper.jurisdiction}
          onValueChange={(value) => updateLegalWrapper({ jurisdiction: value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select primary jurisdiction" />
          </SelectTrigger>
          <SelectContent>
            {JURISDICTIONS.map((jurisdiction) => (
              <SelectItem key={jurisdiction} value={jurisdiction}>
                {jurisdiction}
              </SelectTrigger>
            ))}
          </SelectContent>
        </Select>
        <p className="text-sm text-muted-foreground">
          Select the primary jurisdiction where the asset will be tokenized and offered.
        </p>
      </div>

      {/* Regulatory Framework Selection */}
      <div className="space-y-4">
        <Label>Regulatory Framework *</Label>
        <p className="text-sm text-muted-foreground">
          Select the regulatory frameworks that apply to your offering. You must select at least one.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {REGULATORY_FRAMEWORKS.map((framework) => (
            <div key={framework} className="flex items-center space-x-2">
              <Checkbox
                id={framework}
                checked={data.legalWrapper.regulatoryFramework.includes(framework)}
                onCheckedChange={() => handleRegulatoryFrameworkToggle(framework)}
              />
              <Label htmlFor={framework} className="text-sm cursor-pointer">
                {framework}
              </Label>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Toggle Buttons */}
      <div className="space-y-4">
        <Label>Quick Framework Selection</Label>
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant={data.legalWrapper.regD ? "default" : "outline"}
            size="sm"
            onClick={() => updateLegalWrapper({ regD: !data.legalWrapper.regD })}
            className="flex items-center gap-2"
          >
            <Shield className="h-4 w-4" />
            Reg D
          </Button>
          <Button
            type="button"
            variant={data.legalWrapper.regS ? "default" : "outline"}
            size="sm"
            onClick={() => updateLegalWrapper({ regS: !data.legalWrapper.regS })}
            className="flex items-center gap-2"
          >
            <Globe className="h-4 w-4" />
            Reg S
          </Button>
          <Button
            type="button"
            variant={data.legalWrapper.mica ? "default" : "outline"}
            size="sm"
            onClick={() => updateLegalWrapper({ mica: !data.legalWrapper.mica })}
            className="flex items-center gap-2"
          >
            <Building2 className="h-4 w-4" />
            MiCA
          </Button>
          <Button
            type="button"
            variant={data.legalWrapper.hkSandbox ? "default" : "outline"}
            size="sm"
            onClick={() => updateLegalWrapper({ hkSandbox: !data.legalWrapper.hkSandbox })}
            className="flex items-center gap-2"
          >
            <Shield className="h-4 w-4" />
            HK Sandbox
          </Button>
        </div>
      </div>

      {/* Legal Opinion Upload */}
      <div className="space-y-4">
        <Label>Legal Opinion *</Label>
        <p className="text-sm text-muted-foreground">
          Upload a legal opinion confirming the compliance of your offering with the selected regulatory frameworks.
        </p>

        {data.legalWrapper.legalOpinion ? (
          <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
            <div className="flex items-center gap-3">
              {getFileIcon(data.legalWrapper.legalOpinion)}
              <div>
                <p className="font-medium text-sm">{data.legalWrapper.legalOpinion.name}</p>
                <p className="text-xs text-muted-foreground">
                  {formatFileSize(data.legalWrapper.legalOpinion.size)} • {data.legalWrapper.legalOpinion.type}
                </p>
              </div>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => updateLegalWrapper({ legalOpinion: null })}
              className="text-destructive hover:text-destructive"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <div
            className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
              dragActive
                ? 'border-primary bg-primary/5'
                : 'border-border hover:border-primary/50'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={(e) => handleDrop(e, 'legalOpinion')}
          >
            <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
            <p className="text-sm font-medium mb-1">
              Drag and drop legal opinion here, or{' '}
              <button
                type="button"
                onClick={() => legalOpinionRef.current?.click()}
                className="text-primary hover:underline"
              >
                browse files
              </button>
            </p>
            <p className="text-xs text-muted-foreground">
              PDF or Word documents up to 10MB
            </p>
            <input
              ref={legalOpinionRef}
              type="file"
              accept=".pdf,.doc,.docx,.txt"
              onChange={(e) => handleFileUpload(e.target.files, 'legalOpinion')}
              className="hidden"
            />
          </div>
        )}
      </div>

      {/* Compliance Documents Upload */}
      <div className="space-y-4">
        <Label>Additional Compliance Documents</Label>
        <p className="text-sm text-muted-foreground">
          Upload additional compliance documents such as policies, certificates, and regulatory approvals.
        </p>

        <div
          className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
            dragActive
              ? 'border-primary bg-primary/5'
              : 'border-border hover:border-primary/50'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={(e) => handleDrop(e, 'complianceDocuments')}
        >
          <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
          <p className="text-sm font-medium mb-1">
            Drag and drop compliance documents here, or{' '}
            <button
              type="button"
              onClick={() => complianceDocsRef.current?.click()}
              className="text-primary hover:underline"
            >
              browse files
            </button>
          </p>
          <p className="text-xs text-muted-foreground">
            PDF or Word documents up to 10MB
          </p>
          <input
            ref={complianceDocsRef}
            type="file"
            multiple
            accept=".pdf,.doc,.docx,.txt"
            onChange={(e) => handleFileUpload(e.target.files, 'complianceDocuments')}
            className="hidden"
          />
        </div>

        {/* Uploaded Compliance Documents */}
        {data.legalWrapper.complianceDocuments.length > 0 && (
          <div className="space-y-2">
            <Label>Uploaded Documents ({data.legalWrapper.complianceDocuments.length})</Label>
            <div className="grid gap-2">
              {data.legalWrapper.complianceDocuments.map((file, index) => (
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
                    onClick={() => removeComplianceDocument(index)}
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

      {/* Regulatory Framework Summary */}
      <Card className="bg-muted/30">
        <CardHeader>
          <CardTitle className="text-sm">Selected Frameworks</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {data.legalWrapper.regulatoryFramework.length > 0 ? (
              data.legalWrapper.regulatoryFramework.map((framework) => (
                <Badge key={framework} variant="secondary">
                  {framework}
                </Badge>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">No frameworks selected</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Validation Summary */}
      <Card className="bg-muted/30">
        <CardHeader>
          <CardTitle className="text-sm">Validation Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${
                data.legalWrapper.jurisdiction ? 'bg-green-500' : 'bg-red-500'
              }`} />
              <span>Jurisdiction</span>
            </div>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${
                data.legalWrapper.regulatoryFramework.length > 0 ? 'bg-green-500' : 'bg-red-500'
              }`} />
              <span>Framework</span>
            </div>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${
                data.legalWrapper.legalOpinion ? 'bg-green-500' : 'bg-red-500'
              }`} />
              <span>Legal Opinion</span>
            </div>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${
                (data.legalWrapper.regD || data.legalWrapper.regS || data.legalWrapper.mica || data.legalWrapper.hkSandbox) ? 'bg-green-500' : 'bg-red-500'
              }`} />
              <span>Quick Toggle</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

