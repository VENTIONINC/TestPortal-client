import { Button, HStack, Text, VStack } from '@chakra-ui/react';

import { Field } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { PromptConfig, PromptParameter } from '@/redux/apis/generatedApi';

interface ParameterFormProps {
  prompt: PromptConfig;
  values: Record<string, string>;
  onChange: (name: string, value: string) => void;
  onGenerate: () => void;
  isGenerating?: boolean;
  errors?: Record<string, string>;
}

export const ParameterForm = ({ 
  prompt, 
  values, 
  onChange, 
  onGenerate, 
  isGenerating, 
  errors = {} 
}: ParameterFormProps) => {
  const renderField = (name: string, parameter: PromptParameter) => {
    const value = values[name] || '';
    const error = errors[name];
    const isRequired = parameter.required;

    const handleChange = (newValue: string) => {
      onChange(name, newValue);
    };

    // Use textarea for longer description fields or if example is long
    const useTextarea = parameter.description.toLowerCase().includes('description') || 
                       parameter.description.toLowerCase().includes('context') ||
                       (parameter.example && parameter.example.length > 50);

    return (
      <Field
        key={name}
        label={
          <HStack>
            <Text fontWeight="medium">
              {name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
            </Text>
            {isRequired && <Text color="red.500" fontSize="sm">*</Text>}
          </HStack>
        }
        helperText={parameter.description}
        invalid={!!error}
        errorText={error}
      >
        {useTextarea ? (
          <Textarea
            name={name}
            value={value}
            onChange={(e) => handleChange(e.target.value)}
            placeholder={parameter.example || `Enter ${name.replace(/_/g, ' ')}`}
            rows={3}
          />
        ) : (
          <Input
            name={name}
            value={value}
            onChange={(e) => handleChange(e.target.value)}
            placeholder={parameter.example || `Enter ${name.replace(/_/g, ' ')}`}
          />
        )}
      </Field>
    );
  };

  const hasRequiredFields = Object.entries(prompt.parameters).some(([, param]) => param.required);
  const requiredFieldsEmpty = hasRequiredFields && 
    Object.entries(prompt.parameters).some(([name, param]) => param.required && !values[name]);

  return (
    <VStack align="stretch" gap={4}>
      <Text fontSize="sm" color="gray.600">
        Configure the parameters below to customize your prompt
      </Text>

      <VStack align="stretch" gap={4}>
        {Object.entries(prompt.parameters).map(([name, parameter]) =>
          renderField(name, parameter)
        )}
      </VStack>

      <Button
        onClick={onGenerate}
        disabled={isGenerating || requiredFieldsEmpty}
        loading={isGenerating}
        colorPalette="blue"
        size="lg"
        alignSelf="center"
        w="fit-content"
      >
        {isGenerating ? 'Generating...' : 'Generate Prompt'}
      </Button>

      {requiredFieldsEmpty && (
        <Text fontSize="sm" color="red.500" textAlign="center">
          Please fill in all required fields (marked with *)
        </Text>
      )}
    </VStack>
  );
};