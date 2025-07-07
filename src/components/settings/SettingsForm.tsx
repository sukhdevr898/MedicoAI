
"use client";

import { useEffect, useState } from 'react';
import { useSettings, availableVoices } from '@/contexts/SettingsContext';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription as UiAlertDescription } from '@/components/ui/alert';

const colorPresets = [
  { name: "Forest Green (Default)", values: { primary: '142 57% 48%', background: '150 17% 96%', accent: '112 51% 53%' } },
  { name: "Ocean Blue", values: { primary: '205 79% 46%', background: '210 40% 96%', accent: '180 60% 50%' } },
  { name: "Warm Sunset", values: { primary: '25 85% 55%', background: '30 50% 95%', accent: '45 90% 60%' } },
  { name: "Tech Purple", values: { primary: '260 60% 55%', background: '250 20% 96%', accent: '280 70% 65%' } },
];

const MODELS_API_URL = "https://text.pollinations.ai/models";

const PREFERRED_IMAGE_MODELS = ['openai-large', 'openai', 'mistral', 'phi', 'claude-hybridspace', 'bidara']; 
const PREFERRED_TEXT_MODELS = ['openai', 'openai-fast', 'mistral', 'llama', 'grok', 'qwen-coder', 'searchgpt'];

interface ApiModelDescription {
  name: string;
  description?: string;
  input_modalities?: string[];
  output_modalities?: string[];
  vision?: boolean;
  audio?: boolean;
  voices?: string[];
}

export function SettingsForm() {
  const { 
    themeColors, setThemeColors, 
    fontSize, setFontSize,
    selectedImageModel, setSelectedImageModel,
    selectedTextModel, setSelectedTextModel,
    selectedAiVoice, setSelectedAiVoice,
    isMounted 
  } = useSettings();

  const [allApiModels, setAllApiModels] = useState<ApiModelDescription[]>([]);
  const [availableImageModels, setAvailableImageModels] = useState<string[]>(PREFERRED_IMAGE_MODELS);
  const [availableTextModels, setAvailableTextModels] = useState<string[]>(PREFERRED_TEXT_MODELS);
  const [modelsLoading, setModelsLoading] = useState(true);
  const [modelsError, setModelsError] = useState<string | null>(null);

  useEffect(() => {
    if (!isMounted) return;

    const fetchAndFilterModels = async () => {
      setModelsLoading(true);
      setModelsError(null);
      try {
        const response = await fetch(MODELS_API_URL);
        if (!response.ok) throw new Error(`Failed to fetch models: ${response.statusText}`);
        const allModelsData = await response.json();

        const parsedModels: ApiModelDescription[] = Object.entries(allModelsData).map(([name, details]) => ({
          name,
          ...(typeof details === 'object' && details !== null ? details as Partial<ApiModelDescription> : { description: String(details) })
        }));
        setAllApiModels(parsedModels);
        
        // Filter for Image Analysis Models
        const visionCompatibleModels = parsedModels
          .filter(model => model.vision === true || (Array.isArray(model.input_modalities) && model.input_modalities.includes('image')))
          .map(model => model.name);
        
        let finalImageModels = PREFERRED_IMAGE_MODELS.filter(pm => visionCompatibleModels.includes(pm));
        visionCompatibleModels.forEach(vm => {
            if (!finalImageModels.includes(vm)) finalImageModels.push(vm);
        });
        if (finalImageModels.length === 0 && PREFERRED_IMAGE_MODELS.length > 0) {
            finalImageModels = PREFERRED_IMAGE_MODELS; 
        } else if (finalImageModels.length === 0 && visionCompatibleModels.length > 0) {
            finalImageModels = visionCompatibleModels;
        }


        setAvailableImageModels(finalImageModels.length > 0 ? finalImageModels : ['openai-large']);
        if (!finalImageModels.includes(selectedImageModel) && finalImageModels.length > 0) {
          setSelectedImageModel(finalImageModels.includes('openai-large') ? 'openai-large' : finalImageModels[0]);
        } else if (finalImageModels.length === 0){
            setSelectedImageModel('openai-large'); // Fallback
        }

        // Filter for Text Generation Models
        const textGenCompatibleModels = parsedModels
          .filter(model => Array.isArray(model.output_modalities) && model.output_modalities.includes('text'))
          .map(model => model.name);

        let finalTextModels = PREFERRED_TEXT_MODELS.filter(pm => textGenCompatibleModels.includes(pm));
        textGenCompatibleModels.forEach(tm => {
            if(!finalTextModels.includes(tm)) finalTextModels.push(tm);
        });
        if (finalTextModels.length === 0 && PREFERRED_TEXT_MODELS.length > 0) {
            finalTextModels = PREFERRED_TEXT_MODELS;
        } else if (finalTextModels.length === 0 && textGenCompatibleModels.length > 0) {
            finalTextModels = textGenCompatibleModels;
        }

        setAvailableTextModels(finalTextModels.length > 0 ? finalTextModels : ['openai']);
        if (!finalTextModels.includes(selectedTextModel) && finalTextModels.length > 0) {
          setSelectedTextModel(finalTextModels.includes('openai') ? 'openai' : finalTextModels[0]);
        } else if (finalTextModels.length === 0) {
            setSelectedTextModel('openai'); // Fallback
        }

      } catch (error) {
        console.error("Error fetching or filtering models:", error);
        setModelsError(error instanceof Error ? error.message : "Unknown error fetching models");
        setAvailableImageModels(PREFERRED_IMAGE_MODELS);
        if (!PREFERRED_IMAGE_MODELS.includes(selectedImageModel) && PREFERRED_IMAGE_MODELS.length > 0) {
            setSelectedImageModel(PREFERRED_IMAGE_MODELS[0]);
        } else {
            setSelectedImageModel('openai-large');
        }
        setAvailableTextModels(PREFERRED_TEXT_MODELS);
        if (!PREFERRED_TEXT_MODELS.includes(selectedTextModel) && PREFERRED_TEXT_MODELS.length > 0) {
            setSelectedTextModel(PREFERRED_TEXT_MODELS[0]);
        } else {
            setSelectedTextModel('openai');
        }
      } finally {
        setModelsLoading(false);
      }
    };

    fetchAndFilterModels();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isMounted, setSelectedImageModel, setSelectedTextModel]); // Added dependencies

  if (!isMounted && modelsLoading) {
    return (
      <div className="space-y-8">
        <Skeleton className="h-32 w-full rounded-lg" />
        <Skeleton className="h-24 w-full rounded-lg" />
        <Skeleton className="h-24 w-full rounded-lg" />
        <Skeleton className="h-24 w-full rounded-lg" />
      </div>
    );
  }

  const handleColorPresetChange = (presetValues: { primary: string; background: string; accent: string; }) => {
    setThemeColors(presetValues);
  };

  return (
    <div className="space-y-6">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Theme Color</CardTitle>
          <CardDescription className="text-xs">Select a color preset for the application.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {colorPresets.map((preset) => (
              <Button
                key={preset.name}
                variant={themeColors.primary === preset.values.primary && themeColors.background === preset.values.background ? "default" : "outline"}
                onClick={() => handleColorPresetChange(preset.values)}
                className="w-full justify-start text-left h-auto py-2.5 px-3 rounded-md"
              >
                <div className="flex items-center space-x-2.5">
                  <div className="flex space-x-1">
                    <span className="block w-4 h-4 rounded-full border-2 border-white shadow-sm" style={{ backgroundColor: `hsl(${preset.values.primary})` }}></span>
                    <span className="block w-4 h-4 rounded-full border-2 border-white shadow-sm" style={{ backgroundColor: `hsl(${preset.values.background})` }}></span>
                    <span className="block w-4 h-4 rounded-full border-2 border-white shadow-sm" style={{ backgroundColor: `hsl(${preset.values.accent})` }}></span>
                  </div>
                  <span className="text-xs">{preset.name}</span>
                </div>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Image Analysis Model</CardTitle>
          <CardDescription className="text-xs">Choose the AI model for analyzing medical images.</CardDescription>
        </CardHeader>
        <CardContent>
          {modelsLoading ? (
            <Skeleton className="h-10 w-full rounded-md" />
          ) : (
            <>
            {modelsError && (
                <Alert variant="destructive" className="mb-3 text-xs p-3 rounded-md">
                    <AlertCircle className="h-4 w-4" />
                    <UiAlertDescription>Error: {modelsError}. Using default: {selectedImageModel}.</UiAlertDescription>
                </Alert>
            )}
            <Select value={selectedImageModel} onValueChange={setSelectedImageModel} disabled={(availableImageModels.length <=1 && !!modelsError) || availableImageModels.length === 0}>
              <SelectTrigger id="image-model-select" className="text-xs rounded-md">
                <SelectValue placeholder="Select image model" />
              </SelectTrigger>
              <SelectContent className="text-xs">
                {availableImageModels.map(modelName => (
                  <SelectItem key={modelName} value={modelName} className="text-xs">{modelName}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            </>
          )}
        </CardContent>
      </Card>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Text Generation Model</CardTitle>
          <CardDescription className="text-xs">Choose the AI model for generating text responses.</CardDescription>
        </CardHeader>
        <CardContent>
          {modelsLoading ? (
            <Skeleton className="h-10 w-full rounded-md" />
          ) : (
            <>
            {modelsError && (
                <Alert variant="destructive" className="mb-3 text-xs p-3 rounded-md">
                    <AlertCircle className="h-4 w-4" />
                    <UiAlertDescription>Error: {modelsError}. Using default: {selectedTextModel}.</UiAlertDescription>
                </Alert>
            )}
            <Select value={selectedTextModel} onValueChange={setSelectedTextModel} disabled={(availableTextModels.length <=1 && !!modelsError) || availableTextModels.length === 0}>
              <SelectTrigger id="text-model-select" className="text-xs rounded-md">
                <SelectValue placeholder="Select text model" />
              </SelectTrigger>
              <SelectContent className="text-xs">
                {availableTextModels.map(modelName => (
                  <SelectItem key={modelName} value={modelName} className="text-xs">{modelName}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            </>
          )}
        </CardContent>
      </Card>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">AI Voice</CardTitle>
          <CardDescription className="text-xs">Choose the voice for AI's spoken responses.</CardDescription>
        </CardHeader>
        <CardContent>
            <Select value={selectedAiVoice} onValueChange={setSelectedAiVoice}>
              <SelectTrigger id="ai-voice-select" className="text-xs rounded-md">
                <SelectValue placeholder="Select AI voice" />
              </SelectTrigger>
              <SelectContent className="text-xs">
                {availableVoices.map(voiceName => (
                  <SelectItem key={voiceName} value={voiceName} className="text-xs capitalize">{voiceName}</SelectItem>
                ))}
              </SelectContent>
            </Select>
        </CardContent>
      </Card>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Font Size</CardTitle>
          <CardDescription className="text-xs">Adjust the application's base font size.</CardDescription>
        </CardHeader>
        <CardContent>
          <RadioGroup
            value={fontSize}
            onValueChange={(value) => setFontSize(value as 'sm' | 'base' | 'lg')}
            className="space-y-2.5" 
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="sm" id="font-sm" />
              <Label htmlFor="font-sm" className="cursor-pointer text-xs">Small</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="base" id="font-base" />
              <Label htmlFor="font-base" className="cursor-pointer text-xs">Medium (Default)</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="lg" id="font-lg" />
              <Label htmlFor="font-lg" className="cursor-pointer text-xs">Large</Label>
            </div>
          </RadioGroup>
        </CardContent>
      </Card>
    </div>
  );
}
