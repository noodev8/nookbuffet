'use client';

import { useState } from 'react';

// Shared submit helper for the admin forms: tracks saving / error state and calls
// onSaved(data.data) when the server says SUCCESS.
export default function useSave(onSaved) {
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');
  const save = async (request) => {
    setSaving(true);
    setFormError('');
    try {
      const data = await request();
      if (data.return_code === 'SUCCESS') onSaved(data.data);
      else setFormError(data.message || 'Could not save');
    } catch {
      setFormError('Could not reach the server. Please try again.');
    } finally {
      setSaving(false);
    }
  };
  return { saving, formError, setFormError, save };
}
