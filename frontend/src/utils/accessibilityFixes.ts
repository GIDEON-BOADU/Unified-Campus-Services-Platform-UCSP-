// Accessibility fixes for form elements
// This file contains utility functions to ensure proper accessibility attributes

export const addAccessibilityAttributes = (element: HTMLInputElement, labelText: string): void => {
  // Generate a unique ID based on the label text
  const id = labelText.toLowerCase().replace(/[^a-z0-9]/g, '-');
  
  // Add id and name attributes if missing
  if (!element.id) {
    element.id = id;
  }
  
  if (!element.name) {
    element.name = id;
  }
  
  // Add aria-label if no label is associated
  if (!element.getAttribute('aria-label') && !element.getAttribute('aria-labelledby')) {
    element.setAttribute('aria-label', labelText);
  }
};

export const createAccessibleInput = (
  type: string,
  name: string,
  labelText: string,
  props: any = {}
): { inputProps: any; labelProps: any } => {
  const id = `${name}-${Date.now()}`;
  
  return {
    inputProps: {
      id,
      name,
      type,
      'aria-label': labelText,
      ...props
    },
    labelProps: {
      htmlFor: id
    }
  };
};

// Common accessibility patterns
export const accessibilityPatterns = {
  // For search inputs
  searchInput: (props: any = {}) => ({
    id: 'search-input',
    name: 'search',
    type: 'text',
    'aria-label': 'Search',
    ...props
  }),
  
  // For form inputs with labels
  formInput: (name: string, label: string, props: any = {}) => {
    const id = `${name}-input`;
    return {
      input: {
        id,
        name,
        'aria-label': label,
        ...props
      },
      label: {
        htmlFor: id
      }
    };
  },
  
  // For file inputs
  fileInput: (name: string, label: string, props: any = {}) => {
    const id = `${name}-file`;
    return {
      input: {
        id,
        name,
        type: 'file',
        'aria-label': label,
        ...props
      },
      label: {
        htmlFor: id
      }
    };
  }
};

// Validation for accessibility
export const validateAccessibility = (element: HTMLInputElement): string[] => {
  const issues: string[] = [];
  
  if (!element.id) {
    issues.push('Missing id attribute');
  }
  
  if (!element.name) {
    issues.push('Missing name attribute');
  }
  
  if (!element.getAttribute('aria-label') && !element.getAttribute('aria-labelledby')) {
    const label = document.querySelector(`label[for="${element.id}"]`);
    if (!label) {
      issues.push('No label associated with input');
    }
  }
  
  return issues;
};

// Auto-fix accessibility issues
export const autoFixAccessibility = (container: HTMLElement): void => {
  const inputs = container.querySelectorAll('input:not([id]):not([name])');
  
  inputs.forEach((input, index) => {
    const element = input as HTMLInputElement;
    const placeholder = element.placeholder || `Input ${index + 1}`;
    const id = `input-${index + 1}`;
    
    element.id = id;
    element.name = id;
    element.setAttribute('aria-label', placeholder);
  });
  
  // Find labels without for attributes
  const labels = container.querySelectorAll('label:not([for])');
  labels.forEach((label, index) => {
    const nextInput = label.querySelector('input');
    if (nextInput && nextInput.id) {
      label.setAttribute('for', nextInput.id);
    }
  });
};
