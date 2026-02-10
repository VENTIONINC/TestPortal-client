### Button

Support new variants: `primary | secondary | `
(Error) style works for the Button, you have two main options:

Option 1: Direct Attribute (Quickest)
You can directly add the `aria-invalid={true}` attribute to any primary button in your code. This forces the browser and Chakra UI to apply the \_invalid styles.

```tsx
import { Button, HStack } from '@chakra-ui/react';

// ... inside your component
<HStack>
  // Normal Blue Button
  <Button variant="primary">Normal</Button>
  // Error/Invalid Red Button
  <Button variant="primary" aria-invalid={true}>
    Invalid State
  </Button>
</HStack>;
```

Option 2: Using Field / FormControl (Real usage)
If your button is inside a Form Field (common in forms), it will automatically turn red if the field itself is marked as invalid.

```tsx
import { Field, Button } from '@chakra-ui/react';

// ... inside your component
<Field.Root invalid>
  <Button variant="primary" type="submit">
    Submit with Error
  </Button>
  <Field.ErrorText>Something went wrong</Field.ErrorText>
</Field.Root>;
```
