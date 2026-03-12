import { HStack, Text, VStack, SimpleGrid } from '@chakra-ui/react';

import { Field } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { PromptConfig, PromptParameter } from '@/redux/apis/generatedApi';

interface ParameterFormProps {
  prompt: PromptConfig;
  values: Record<string, string>;
  onChange: (name: string, value: string) => void;

  errors?: Record<string, string>;
  requiredFieldsEmpty?: boolean;
}

export const ParameterForm = ({ prompt, values, onChange, errors = {}, requiredFieldsEmpty }: ParameterFormProps) => {

  const renderField = (name: string, parameter: PromptParameter) => {
    const value = values[name] || '';
    const error = errors[name];
    const isRequired = parameter.required;

    const handleChange = (newValue: string) => {
      onChange(name, newValue);
    };

    // Use textarea for longer description fields or if example is long
    const useTextarea =
      parameter.description.toLowerCase().includes('description') ||
      parameter.description.toLowerCase().includes('context') ||
      (parameter.example && parameter.example.length > 50);

    return (
      <Field
        key={name}
        label={
          <HStack>
            <Text fontWeight="medium" color="text.main">
              {name.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
            </Text>
            {isRequired && (
              <Text color="status.error.text" fontSize="sm">
                *
              </Text>
            )}
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

  return (
    <VStack align="stretch" gap={4}>
      <Text fontSize="sm" color="text.muted">
        Configure the parameters below to customize your prompt
      </Text>

      <SimpleGrid columns={{ base: 1, md: 2 }} gap={4}>
        {Object.entries(prompt.parameters).map(([name, parameter]) => renderField(name, parameter))}
      </SimpleGrid>
      {requiredFieldsEmpty && (
        <Text fontSize="sm" color="status.error.text" textAlign="center">
          Please fill in all required fields (marked with *)
        </Text>
      )}
    </VStack>
  );
};
