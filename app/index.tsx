// app/index.tsx
import { Redirect } from 'expo-router';

export default function Index() {
  // Using Redirect automatically handles the "replace" logic
  return <Redirect href="/login" />; 
}