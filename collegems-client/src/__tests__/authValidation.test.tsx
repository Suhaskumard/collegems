import { validateRegistrationInput } from '../utils/validators';

interface TestCase {
  name: string;
  data: any;
  expected: {
    isValid: boolean;
    error?: string;
  };
}

const testCases: TestCase[] = [
  {
    name: '✅ Valid registration',
    data: {
      email: 'test@example.com',
      password: 'Test@1234',
      name: 'John Doe',
      phone: '+1234567890',
      studentId: 'STU-1234',
    },
    expected: { isValid: true },
  },
  {
    name: '❌ Invalid email',
    data: {
      email: 'invalid@.com',
      password: 'Test@1234',
      name: 'John Doe',
    },
    expected: { isValid: false, error: 'email' },
  },
  {
    name: '❌ Weak password (too short)',
    data: {
      email: 'test@example.com',
      password: '123',
      name: 'John Doe',
    },
    expected: { isValid: false, error: 'password' },
  },
  {
    name: '❌ Weak password (no special char)',
    data: {
      email: 'test@example.com',
      password: 'Test1234',
      name: 'John Doe',
    },
    expected: { isValid: false, error: 'password' },
  },
  {
    name: '❌ Empty name',
    data: {
      email: 'test@example.com',
      password: 'Test@1234',
      name: '',
    },
    expected: { isValid: false, error: 'name' },
  },
  {
    name: '❌ Name with special characters',
    data: {
      email: 'test@example.com',
      password: 'Test@1234',
      name: 'John@Doe',
    },
    expected: { isValid: false, error: 'name' },
  },
  {
    name: '❌ Invalid student ID format',
    data: {
      email: 'test@example.com',
      password: 'Test@1234',
      name: 'John Doe',
      studentId: '123',
    },
    expected: { isValid: false, error: 'studentId' },
  },
  {
    name: '✅ Valid registration with optional fields omitted',
    data: {
      email: 'test@example.com',
      password: 'Test@1234',
      name: 'John Doe',
    },
    expected: { isValid: true },
  },
];

console.log('🧪 Running validation tests...\n');

let passedCount = 0;
let failedCount = 0;

testCases.forEach((testCase) => {
  const result = validateRegistrationInput(testCase.data);
  const passed = result.isValid === testCase.expected.isValid;
  
  if (passed) {
    passedCount++;
    console.log(`✅ ${testCase.name}`);
  } else {
    failedCount++;
    console.log(`❌ ${testCase.name}`);
    console.log(`   Expected: ${JSON.stringify(testCase.expected)}`);
    console.log(`   Got: ${JSON.stringify(result.errors)}`);
  }
});

console.log(`\n📊 Results: ${passedCount} passed, ${failedCount} failed`);

if (failedCount === 0) {
  console.log('🎉 All tests passed!');
} else {
  console.log('⚠️ Some tests failed. Please review the errors.');
}