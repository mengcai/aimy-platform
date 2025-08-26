'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ChevronLeft, ChevronRight, CheckCircle, Circle } from 'lucide-react';
import { AssetBasicsStep } from './steps/asset-basics-step';
import { LegalWrapperStep } from './steps/legal-wrapper-step';
import { TokenTermsStep } from './steps/token-terms-step';
import { PricingAIStep } from './steps/pricing-ai-step';
import { OfferingSetupStep } from './steps/offering-setup-step';
import { ReviewLaunchStep } from './steps/review-launch-step';
import { useAssetCreationWizard } from './hooks/use-asset-creation-wizard';

const STEPS = [
  { id: 1, title: 'Asset Basics', description: 'Basic information and documents' },
  { id: 2, title: 'Legal Wrapper', description: 'Jurisdictions and compliance' },
  { id: 3, title: 'Token Terms', description: 'ERC-3643 configuration' },
  { id: 4, title: 'Pricing & AI', description: 'Cashflows and AI inputs' },
  { id: 5, title: 'Offering Setup', description: 'Minimum ticket and KYC' },
  { id: 6, title: 'Review & Launch', description: 'Deploy contracts and launch' },
];

export default function AssetCreationWizardPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const wizard = useAssetCreationWizard();

  const handleNext = () => {
    if (currentStep < STEPS.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleStepClick = (stepId: number) => {
    if (stepId <= currentStep) {
      setCurrentStep(stepId);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <AssetBasicsStep wizard={wizard} />;
      case 2:
        return <LegalWrapperStep wizard={wizard} />;
      case 3:
        return <TokenTermsStep wizard={wizard} />;
      case 4:
        return <PricingAIStep wizard={wizard} />;
      case 5:
        return <OfferingSetupStep wizard={wizard} />;
      case 6:
        return <ReviewLaunchStep wizard={wizard} onLaunch={wizard.launchAsset} />;
      default:
        return null;
    }
  };

  const progress = (currentStep / STEPS.length) * 100;

  return (
    <div className="container mx-auto py-8 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold text-foreground">Create New Asset</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Follow the steps below to tokenize your real-world asset. Each step will collect the necessary information
          to deploy your security token and create a primary offering.
        </p>
      </div>

      {/* Progress Bar */}
      <div className="space-y-4">
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>Step {currentStep} of {STEPS.length}</span>
          <span>{Math.round(progress)}% Complete</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Step Navigation */}
      <div className="grid grid-cols-6 gap-4">
        {STEPS.map((step) => (
          <button
            key={step.id}
            onClick={() => handleStepClick(step.id)}
            disabled={step.id > currentStep}
            className={`flex flex-col items-center p-4 rounded-lg border transition-all ${
              step.id === currentStep
                ? 'border-primary bg-primary/5 text-primary'
                : step.id < currentStep
                ? 'border-green-200 bg-green-50 text-green-700'
                : 'border-border bg-muted/30 text-muted-foreground'
            } ${step.id <= currentStep ? 'cursor-pointer hover:scale-105' : 'cursor-not-allowed'}`}
          >
            <div className="mb-2">
              {step.id < currentStep ? (
                <CheckCircle className="h-6 w-6 text-green-600" />
              ) : (
                <Circle className="h-6 w-6" />
              )}
            </div>
            <span className="text-xs font-medium text-center">{step.title}</span>
          </button>
        ))}
      </div>

      {/* Step Content */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="text-primary">Step {currentStep}:</span>
            {STEPS[currentStep - 1].title}
          </CardTitle>
          <p className="text-muted-foreground">
            {STEPS[currentStep - 1].description}
          </p>
        </CardHeader>
        <CardContent>
          {renderStep()}
        </CardContent>
      </Card>

      {/* Navigation Buttons */}
      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={handlePrevious}
          disabled={currentStep === 1}
          className="flex items-center gap-2"
        >
          <ChevronLeft className="h-4 w-4" />
          Previous
        </Button>

        {currentStep < STEPS.length ? (
          <Button
            onClick={handleNext}
            disabled={!wizard.canProceedToNextStep(currentStep)}
            className="flex items-center gap-2"
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </Button>
        ) : (
          <Button
            onClick={wizard.launchAsset}
            disabled={!wizard.canLaunch}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
          >
            <CheckCircle className="h-4 w-4" />
            Launch Asset
          </Button>
        )}
      </div>
    </div>
  );
}

